# EggForm Mobile App — Port Guide

This document describes how to port the EggForm web platform to native mobile apps (Flutter or React Native) using the same design system, API, and backend.

## Why Two Approaches?

The web app already works great on mobile (PWA installable, responsive, bottom nav). A native mobile app adds value when you need:

- **Push notifications** (PWA support is limited on iOS)
- **Biometric login** (Face ID, fingerprint) — PWA has Web Authn but native is smoother
- **Offline-first** access to wallet + farm
- **Native performance** for animations (especially the farm view with many sprites)
- **App store distribution** (Play Store, App Store)

For most MVP use cases, **PWA is sufficient** and ships faster. Only go native when you have a clear product reason.

---

## Option A: Flutter (Recommended)

**Why:** Single codebase for Android + iOS + Web. Great performance for 2D game animations. Mature ecosystem.

### Project Structure

```
eggform_mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── theme/
│   │   │   ├── colors.dart         # Mirror of CSS variables (Farm Green #18A957)
│   │   │   ├── typography.dart     # Plus Jakarta Sans
│   │   │   └── spacings.dart
│   │   ├── router.dart             # GoRouter config
│   │   └── providers.dart          # Riverpod providers
│   ├── features/
│   │   ├── auth/                   # Login, OTP, Register screens
│   │   ├── dashboard/              # Home dashboard
│   │   ├── farm/                   # Farm view (use Flame engine for 2D)
│   │   ├── eggs/                   # Egg shop + my eggs
│   │   ├── incubators/
│   │   ├── animals/
│   │   ├── inventory/
│   │   ├── marketplace/
│   │   ├── missions/
│   │   ├── events/
│   │   ├── wallet/                 # Game + PKR wallets
│   │   ├── kyc/                    # 4-step KYC flow
│   │   ├── support/                # Tickets
│   │   └── profile/
│   ├── services/
│   │   ├── api_client.dart         # Dio HTTP client
│   │   ├── auth_service.dart       # NextAuth integration
│   │   ├── websocket_service.dart  # Socket.io client
│   │   ├── storage_service.dart    # Hive for offline cache
│   │   └── notification_service.dart
│   ├── models/                     # Freezed data classes (mirror Prisma schema)
│   └── widgets/                    # Reusable UI components (mirror shadcn/ui)
├── assets/
│   ├── images/
│   │   ├── eggs/                   # 5 rarity eggs (PNG @2x, @3x)
│   │   ├── animals/                # Chicken, Phoenix, Dragon etc
│   │   ├── buildings/              # Barn, Incubator, Windmill
│   │   └── icons/                  # App icon, splash
│   ├── fonts/
│   │   └── PlusJakartaSans-*.ttf
│   └── animations/
│       └── egg_hatch.riv           # Rive animations
└── pubspec.yaml
```

### Key Packages

```yaml
# pubspec.yaml
dependencies:
  flutter_riverpod: ^2.4.0       # State management (mirror Zustand)
  dio: ^5.4.0                     # HTTP client (with interceptors for auth)
  socket_io_client: ^2.0.0       # Real-time notifications
  go_router: ^12.0.0              # Navigation
  freezed: ^2.4.0                 # Immutable data classes
  hive: ^2.2.0                    # Offline storage
  flame: ^1.10.0                  # 2D game engine (for farm view)
  rive: ^0.12.0                   # Vector animations (egg hatch sequence)
  local_auth: ^2.1.0              # Biometric login
  flutter_local_notifications: ^16.0.0  # Push notifications
  url_launcher: ^6.2.0            # Open payment provider URLs
  webview_flutter: ^4.4.0         # In-app payment provider pages

dev_dependencies:
  build_runner: ^2.4.0
  freezed_codegen: ^2.4.0
  json_serializable: ^6.7.0
  flutter_test:                   # Unit + widget tests
  integration_test:               # E2E tests
```

### Design Token Sync

Export from web to Flutter:

```dart
// lib/app/theme/colors.dart
import 'package:flutter/material.dart';

class EggFormColors {
  // Primary (per design spec §2)
  static const farmGreen = Color(0xFF18A957);
  static const farmGreenDark = Color(0xFF087A3D);
  static const farmGreenLight = Color(0xFFE8F8EF);

  // Secondary
  static const golden = Color(0xFFF7B928);
  static const eggCream = Color(0xFFFFF8E8);
  static const skyBlue = Color(0xFF4A90E2);
  static const purple = Color(0xFF7957D5);
  static const orange = Color(0xFFF59E42);
  static const red = Color(0xFFE55353);

  // Neutrals
  static const background = Color(0xFFF7F9FC);
  static const white = Color(0xFFFFFFFF);
  static const darkText = Color(0xFF172033);
  static const secondaryText = Color(0xFF697386);
  static const border = Color(0xFFE6EAF0);

  // Rarity
  static const rarityCommon = Color(0xFF6B7280);
  static const rarityUncommon = Color(0xFF18A957);
  static const rarityRare = Color(0xFF4A90E2);
  static const rarityEpic = Color(0xFF7957D5);
  static const rarityLegendary = Color(0xFFF7B928);

  // Dark mode
  static const darkBackground = Color(0xFF0B1418);
  static const darkCard = Color(0xFF131E25);
}
```

### API Integration

The mobile app uses the **same REST API** as the web:

```dart
// lib/services/api_client.dart
class ApiClient {
  static const baseUrl = 'https://eggform.pk/api/v1';

  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 30),
  ));

  ApiClient() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await StorageService.getAuthToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired — refresh or logout
          AuthService.logout();
        }
        handler.next(error);
      },
    ));
  }

  Future<List<EggType>> getEggTypes() async {
    final res = await _dio.get('/eggs');
    return (res.data['eggTypes'] as List)
        .map((j) => EggType.fromJson(j))
        .toList();
  }

  Future<Egg> buyEgg(String eggTypeId) async {
    final res = await _dio.post('/eggs', data: {'eggTypeId': eggTypeId});
    return Egg.fromJson(res.data['egg']);
  }
  // ... etc
}
```

### Animations

For the egg hatch sequence, use **Rive** (vector animations, smaller than sprite sheets):

1. Create the hatch animation in Rive editor (free)
2. Export as `.riv` file
3. Use `rive` package to play state-machine transitions:
   - `idle` → `shake` → `crack` → `burst` → `reveal`

For animal idle animations, use sprite sheets or Lottie.

---

## Option B: React Native (Expo)

**Why:** Reuse TypeScript skills from web. Same mental model. Faster onboarding for web devs.

### Project Structure

```
eggform_mobile/
├── app/                            # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── otp.tsx
│   ├── (app)/
│   │   ├── dashboard.tsx
│   │   ├── farm.tsx
│   │   ├── eggs/
│   │   │   ├── index.tsx           # Egg shop
│   │   │   └── [eggId].tsx         # Formation detail
│   │   ├── incubators.tsx
│   │   ├── animals.tsx
│   │   ├── marketplace.tsx
│   │   ├── wallet/
│   │   │   ├── game.tsx
│   │   │   └── pkr.tsx
│   │   ├── missions.tsx
│   │   ├── kyc.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── src/
│   ├── components/                 # Reusable UI (mirror shadcn/ui)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EggCard.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts                  # fetch wrapper
│   │   ├── auth.ts                 # NextAuth token storage
│   │   └── theme.ts                # Mirror of Tailwind config
│   ├── stores/                     # Zustand (same as web!)
│   │   └── eggform.ts
│   └── hooks/
│       ├── useRealtime.ts          # Socket.io client
│       └── useSoundEffects.ts
├── assets/
│   ├── images/
│   └── sounds/
├── app.json
├── package.json
└── tsconfig.json
```

### Key Packages

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "expo-secure-store": "~12.8.0",
    "expo-notifications": "~0.27.0",
    "expo-local-authentication": "~13.8.0",
    "expo-haptics": "~12.8.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "socket.io-client": "^4.7.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "@shopify/restyle": "^2.0.0",
    "react-native-svg": "15.0.0",
    "lottie-react-native": "^6.5.0"
  }
}
```

### Native Module Highlights

- **`expo-secure-store`** — Stores NextAuth JWT in iOS Keychain / Android Keystore
- **`expo-local-authentication`** — Face ID / Touch ID / Fingerprint
- **`expo-notifications`** — Push notifications via APNs (iOS) + FCM (Android)
- **`expo-haptics`** — Subtle vibration feedback on button taps, egg hatches
- **`react-native-reanimated`** — Smooth 60fps animations (better than web framer-motion)
- **`@shopify/restyle`** — Type-safe design tokens (mirror of Tailwind config)
- **`react-native-svg`** — Render the SAME SVG components as web (almost no changes!)

### Reusing SVG Components

The big win: **the SVG components from `src/components/svg-assets.tsx` can be copied almost verbatim** to React Native with minor syntax changes:

```tsx
// Web (current):
import { motion } from 'framer-motion'
<svg viewBox="0 0 100 100">...</svg>

// React Native:
import { Svg, Circle, Path, Ellipse } from 'react-native-svg'
import Animated, { useAnimatedStyle, withRepeat } from 'react-native-reanimated'
<Svg viewBox="0 0 100 100">...</Svg>
```

90% of the SVG paths stay the same. Only the wrapper changes.

### Reusing the Zustand Store

The web store at `src/lib/store.ts` is **directly reusable** in React Native — Zustand works the same way. Just swap the `persist` storage from `localStorage` to `AsyncStorage`:

```ts
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useEggForm = create<EggFormState>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'eggform-store',
      storage: createJSONStorage(() => AsyncStorage),  // Only change
    }
  )
)
```

### Native Payments

For in-app purchases (deposits), iOS App Store and Google Play require:
- Digital goods → must use Apple/Google IAP (30% fee)
- Physical goods or services → can use third-party (JazzCash/Easypaisa directly)

EggForm eggs/coins are digital goods → on iOS you'd need to route through Apple IAP. On Android, Play Store Billing. To avoid the 30% fee, consider:
- Web-only purchases (open browser to web app for deposits)
- Hybrid: PWA + native shell (Capacitor)

---

## Migration Steps (Either Approach)

1. **Export design tokens** — colors, typography, spacing from web → mobile theme file
2. **Build API client** — TypeScript types from `src/lib/types.ts` are reusable
3. **Port Zustand store** — works as-is on RN, slight changes for Flutter (use Riverpod)
4. **Port SVG assets** — direct copy for RN, re-implement for Flutter
5. **Set up push notifications** — FCM for Android, APNs for iOS
6. **Implement biometric login** — `expo-local-authentication` or `local_auth` (Flutter)
7. **Add offline cache** — Hive (Flutter) or AsyncStorage + React Query (RN)
8. **Build screens** — 18 screens mirror the web app
9. **Test on real devices** — payment flows especially need real-device testing
10. **Submit to stores** — review guidelines (Apple is strict about IAP for digital goods)

## Recommendation

For EggForm specifically:
1. **Phase 1 (now)**: Ship PWA — installable, works offline, push notifications on Android
2. **Phase 2 (next quarter)**: React Native app with Expo — reuses 70% of code
3. **Phase 3 (when scale demands)**: Consider Flutter if performance becomes an issue

The PWA + RN combo gives you 90% of native app benefits at 30% of the cost.
