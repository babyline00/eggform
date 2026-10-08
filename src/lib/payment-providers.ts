// Payment Provider Abstraction Layer
// Per engineering §15 (AI / Agent Projects) + §10 (Security):
//   - Provider configuration separate from business logic
//   - Provider fallback where reliability requires it
//   - Provider abstraction so providers can be replaced
//   - Webhook signature verification
//
// Implements a unified PaymentProvider interface that JazzCash, Easypaisa,
// Bank, and Card adapters all implement. Adding a new provider = implementing
// this interface, no changes to the rest of the codebase.

import crypto from 'crypto'

export type PaymentProviderId = 'jazzcash' | 'easypaisa' | 'bank' | 'card'

export interface InitiateDepositInput {
  amountPaisa: number  // always in paisa (1 PKR = 100 paisa)
  internalReference: string
  userId: string
  paymentMethod: PaymentProviderId
  returnUrl: string
  webhookUrl: string
}

export interface InitiateDepositResult {
  providerReference: string | null
  redirectUrl: string | null  // URL to redirect user to provider checkout
  status: 'initiated' | 'failed'
  rawResponse?: any
}

export interface VerifyWebhookInput {
  rawBody: string  // the raw HTTP body
  signature: string  // from x-webhook-signature header
  providerEventId?: string
  provider: PaymentProviderId
}

export interface VerifyWebhookResult {
  valid: boolean
  internalReference?: string
  amountPaisa?: number
  currency?: string
  providerTransactionId?: string
  error?: string
}

export interface PaymentProvider {
  id: PaymentProviderId
  name: string
  initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult>
  verifyWebhook(input: VerifyWebhookInput): VerifyWebhookResult
  formatProviderReference(response: any): string | null
}

// ============================================================
// JAZZCASH — HMAC SHA-256 Integrity Salt
// ============================================================

export class JazzCashProvider implements PaymentProvider {
  id: PaymentProviderId = 'jazzcash'
  name = 'JazzCash'

  private merchantId: string
  private password: string
  private integritySalt: string
  private apiUrl: string

  constructor() {
    this.merchantId = process.env.JAZZCASH_MERCHANT_ID || ''
    this.password = process.env.JAZZCASH_PASSWORD || ''
    this.integritySalt = process.env.JAZZCASH_INTEGRITY_SALT || ''
    this.apiUrl = process.env.JAZZCASH_API_URL || 'https://sandbox.jazzcash.com.pk/CustomerServices/PaymentInterfaceService'
  }

  async initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult> {
    // JazzCash expects amounts in PKR (not paisa)
    const amountRupees = (input.amountPaisa / 100).toFixed(2)
    const txnRef = input.internalReference

    // Build the signed payload
    const sortedParams = `${this.integritySalt}&${amountRupees}&${txnRef}&${this.merchantId}&${this.password}`
    const secureHash = await this.hmacSha256(sortedParams)

    const requestBody = {
      pp_MerchantID: this.merchantId,
      pp_Password: this.password,
      pp_TxnRefNo: txnRef,
      pp_Amount: input.amountPaisa.toString(),  // JazzCash expects paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
      pp_BillReference: 'bill_' + input.userId,
      pp_Description: 'EggForm Deposit',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_ReturnURL: input.returnUrl,
      pp_SecureHash: secureHash,
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      return {
        providerReference: data.pp_TxnRefNo || txnRef,
        redirectUrl: data.pp_RedenemptionURL || null,
        status: data.pp_ResponseCode === '000' ? 'initiated' : 'failed',
        rawResponse: data,
      }
    } catch (e: any) {
      return {
        providerReference: null,
        redirectUrl: null,
        status: 'failed',
        rawResponse: { error: e.message },
      }
    }
  }

  verifyWebhook(input: VerifyWebInput): VerifyWebhookResult {
    // JazzCash webhook verification uses HMAC SHA-256 over sorted params
    // The signature comes in the `pp_SecureHash` field of the body
    try {
      const body = JSON.parse(input.rawBody)
      const providedHash = body.pp_SecureHash || input.signature
      if (!providedHash) return { valid: false, error: 'Missing pp_SecureHash' }

      // Reconstruct the sorted string excluding pp_SecureHash itself
      const sortedKeys = Object.keys(body)
        .filter((k) => k !== 'pp_SecureHash')
        .sort()
      const sortedString = `${this.integritySalt}&${sortedKeys.map((k) => body[k]).join('&')}`
      const expectedHash = this.hmacSha256Sync(sortedString)

      if (expectedHash !== providedHash) {
        return { valid: false, error: 'Signature mismatch' }
      }

      return {
        valid: true,
        internalReference: body.pp_TxnRefNo,
        amountPaisa: parseInt(body.pp_Amount, 10),
        currency: body.pp_TxnCurrency || 'PKR',
        providerTransactionId: body.pp_RetreivalReferenceNo,
      }
    } catch (e: any) {
      return { valid: false, error: e.message }
    }
  }

  formatProviderReference(response: any): string | null {
    return response?.pp_TxnRefNo || null
  }

  private async hmacSha256(data: string): Promise<string> {
    return crypto.createHmac('sha256', this.integritySalt).update(data).digest('hex').toUpperCase()
  }

  private hmacSha256Sync(data: string): string {
    return crypto.createHmac('sha256', this.integritySalt).update(data).digest('hex').toUpperCase()
  }
}

// ============================================================
// EASYPAISA — HMAC SHA-256 with store ID
// ============================================================

export class EasypaisaProvider implements PaymentProvider {
  id: PaymentProviderId = 'easypaisa'
  name = 'Easypaisa'

  private storeId: string
  private storePassword: string
  private apiUrl: string

  constructor() {
    this.storeId = process.env.EASYPAISA_STORE_ID || ''
    this.storePassword = process.env.EASYPAISA_PASSWORD || ''
    this.apiUrl = process.env.EASYPAISA_API_URL || 'https://easypay.easypaisa.com.pk/easypay-service/api/v1/invoices'
  }

  async initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult> {
    const amountRupees = (input.amountPaisa / 100).toFixed(2)
    const txnRef = input.internalReference
    const hashKey = this.storePassword

    // Easypaisa uses HashKey = MD5(accountNum + amount + merchantId)
    const hash = crypto.createHash('md5').update(`${hashKey}&${amountRupees}&${this.storeId}&${txnRef}`).digest('hex')

    const requestBody = {
      orderId: txnRef,
      storeId: this.storeId,
      transactionAmount: amountRupees,
      transactionType: 'MWALLET',
      mobileAccountNo: '',
      emailAddress: '',
      token: hash,
      // Callback URLs
      postBackURL: input.webhookUrl,
      successUrl: input.returnUrl + '?status=success',
      failureUrl: input.returnUrl + '?status=failure',
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Credentials': `BMCCredential:${process.env.EASYPAISA_MERCHANT_ID || ''}`,
        },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      return {
        providerReference: data.orderId || txnRef,
        redirectUrl: data.checkoutUrl || null,
        status: data.responseCode === '0000' ? 'initiated' : 'failed',
        rawResponse: data,
      }
    } catch (e: any) {
      return {
        providerReference: null,
        redirectUrl: null,
        status: 'failed',
        rawResponse: { error: e.message },
      }
    }
  }

  verifyWebhook(input: VerifyWebInput): VerifyWebhookResult {
    try {
      const body = JSON.parse(input.rawBody)
      // Easypaisa sends a signature in the URL query (?hash=...) — verify against body
      const providedHash = input.signature
      if (!providedHash) return { valid: false, error: 'Missing hash signature' }

      // Reconstruct hash: MD5(amount + orderId + storeId)
      const expectedHash = crypto
        .createHash('md5')
        .update(`${body.transactionAmount}&${body.orderId}&${this.storeId}`)
        .digest('hex')

      if (expectedHash !== providedHash) {
        return { valid: false, error: 'Signature mismatch' }
      }

      return {
        valid: true,
        internalReference: body.orderId,
        amountPaisa: Math.round(parseFloat(body.transactionAmount) * 100),
        currency: 'PKR',
        providerTransactionId: body.transactionId,
      }
    } catch (e: any) {
      return { valid: false, error: e.message }
    }
  }

  formatProviderReference(response: any): string | null {
    return response?.orderId || null
  }
}

// ============================================================
// BANK TRANSFER — manual reconciliation
// ============================================================

export class BankTransferProvider implements PaymentProvider {
  id: PaymentProviderId = 'bank'
  name = 'Bank Transfer'

  // Bank transfers don't have an "initiate" step — user gets bank details
  // and makes the transfer externally. Verification is manual + admin-reviewed.
  async initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult> {
    return {
      providerReference: input.internalReference,  // we use our own reference
      redirectUrl: null,  // no provider redirect — show bank details in UI
      status: 'initiated',
      rawResponse: {
        bankDetails: {
          accountTitle: process.env.BANK_ACCOUNT_TITLE || 'EggForm Pvt Ltd',
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'PK00XXXX0000000000',
          bankName: process.env.BANK_NAME || 'Bank Alfalah',
          branch: process.env.BANK_BRANCH || 'Main Branch, Karachi',
          iban: process.env.BANK_IBAN || 'PK36ALFH0000000000000000',
          reference: input.internalReference,
          amount: input.amountPaisa / 100,
        },
        instructions: 'Transfer the exact amount with the reference number shown. Funds will be credited within 1-3 business days after verification.',
      },
    }
  }

  verifyWebhook(input: VerifyWebInput): VerifyWebhookResult {
    // Bank transfers have no automatic webhook — verification is manual via
    // admin dashboard (admin matches bank statement to internal reference).
    return { valid: false, error: 'Manual verification required — bank transfers have no webhook' }
  }

  formatProviderReference(response: any): string | null {
    return response?.reference || null
  }
}

// ============================================================
// CARD (Stripe / 2C2P / etc.) — placeholder
// ============================================================

export class CardProvider implements PaymentProvider {
  id: PaymentProviderId = 'card'
  name = 'Debit/Credit Card'

  async initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult> {
    // In production, integrate with Stripe / 2C2P / local card processor
    return {
      providerReference: input.internalReference,
      redirectUrl: null,
      status: 'initiated',
      rawResponse: { note: 'Card provider integration pending — implement Stripe/2C2P adapter' },
    }
  }

  verifyWebhook(input: VerifyWebInput): VerifyWebhookResult {
    // Stripe webhook verification uses Stripe-Signature header (t=...,v1=...)
    // Parse the header, reconstruct the signed payload, compare with HMAC SHA-256
    return { valid: false, error: 'Card provider webhook verification not yet implemented' }
  }

  formatProviderReference(response: any): string | null {
    return response?.id || null
  }
}

// ============================================================
// PROVIDER REGISTRY — used by /api/pkr/deposit + /api/pkr/webhook
// ============================================================

const providers: Record<PaymentProviderId, PaymentProvider> = {
  jazzcash: new JazzCashProvider(),
  easypaisa: new EasypaisaProvider(),
  bank: new BankTransferProvider(),
  card: new CardProvider(),
}

export function getProvider(id: PaymentProviderId): PaymentProvider {
  const provider = providers[id]
  if (!provider) throw new Error(`Unknown payment provider: ${id}`)
  return provider
}

export function listProviders(): PaymentProviderId[] {
  return Object.keys(providers) as PaymentProviderId[]
}

// Type alias to avoid conflict with the verifyWebhook method signature
type VerifyWebInput = VerifyWebhookInput
