// Generate PWA icons (192px + 512px PNG) from a simple egg SVG
// Uses sharp for SVG → PNG conversion
// Run: bun run scripts/generate-pwa-icons.ts

import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18A957"/>
      <stop offset="100%" stop-color="#087A3D"/>
    </linearGradient>
    <radialGradient id="egg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="60%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#92400E"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#bg)"/>
  <ellipse cx="256" cy="270" rx="160" ry="200" fill="url(#egg)" stroke="#92400E" stroke-width="6"/>
  <path d="M180 230 Q210 210 240 230 T300 230" stroke="#92400E" stroke-width="8" fill="none" opacity="0.6"/>
  <path d="M200 320 Q230 300 260 320 T320 320" stroke="#92400E" stroke-width="6" fill="none" opacity="0.5"/>
  <ellipse cx="200" cy="180" rx="40" ry="60" fill="white" opacity="0.4"/>
</svg>
`

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public')
  await mkdir(publicDir, { recursive: true })

  await sharp(Buffer.from(ICON_SVG)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'))
  console.log('✓ icon-192.png')
  await sharp(Buffer.from(ICON_SVG)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'))
  console.log('✓ icon-512.png')
  await sharp(Buffer.from(ICON_SVG)).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'))
  console.log('✓ favicon-32.png')
  await sharp(Buffer.from(ICON_SVG)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('✓ apple-touch-icon.png')
  await writeFile(path.join(publicDir, 'icon.svg'), ICON_SVG)
  console.log('✓ icon.svg')
}

generateIcons().catch(console.error)
