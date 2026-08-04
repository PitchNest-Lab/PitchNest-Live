# PitchNest Mobile — Build Guide & Planning Doc

How we went from **web-only PitchNest** to a **native iOS + Android app** using **Expo + React Native**, while keeping the existing Node backend and Supabase database.

**Companion docs:** [MOBILE_STORE_PLAN.md](./MOBILE_STORE_PLAN.md) · [MOBILE_FEATURE_MAP.md](./MOBILE_FEATURE_MAP.md)

---

## Table of contents

1. [Decision summary](#1-decision-summary)
2. [Languages & skills needed](#2-languages--skills-needed)
3. [Architecture overview](#3-architecture-overview)
4. [Packages & libraries](#4-packages--libraries)
5. [Storage planning](#5-storage-planning)
6. [Step-by-step build plan](#6-step-by-step-build-plan)
7. [File structure & what each file does](#7-file-structure--what-each-file-does)
8. [How to code each major feature](#8-how-to-code-each-major-feature)
9. [Web → mobile mapping](#9-web--mobile-mapping)
10. [Design system (Aurora Boardroom)](#10-design-system-aurora-boardroom)
11. [Environment & backend requirements](#11-environment--backend-requirements)
12. [Testing & store build](#12-testing--store-build)
13. [Known limitations & next steps](#13-known-limitations--next-steps)

---

## 1. Decision summary

| Question | Decision |
|----------|----------|
| Native vs WebView wrapper? | **Native Expo app** — Apple rejects thin WebViews for core features (Guideline 4.2) |
| Reuse web frontend? | **No** — new `mobile/` folder; same **backend API** |
| Screen sharing on mobile? | **Removed** — iOS has no `getDisplayMedia`; replaced with **in-app PDF slide viewer** |
| Subscriptions v1? | **Free only** — no IAP; hide all paywall UI |
| Auth storage? | **`expo-secure-store`** — not `localStorage` or plain AsyncStorage |
| Live AI? | **WebSocket** to existing backend → Gemini (keys stay server-side) |
| Database? | **Same Supabase** — users, decks, sessions, profiles (no new DB) |

---

## 2. Languages & skills needed

| Language / tool | Used for |
|-----------------|----------|
| **TypeScript** | All mobile app code (`mobile/src/**/*.tsx`, `.ts`) |
| **React** | Components, hooks, context (same mental model as web) |
| **React Native** | Native UI (`View`, `Text`, `Pressable`, `FlatList`, etc.) |
| **Expo SDK 56** | Camera, audio, secure storage, document picker, builds |
| **JSON** | `app.json`, `eas.json`, `package.json` config |
| **Node.js** | Backend (unchanged) — Express, WebSockets, JWT |
| **SQL (Supabase)** | Database — already set up for web |

You do **not** need Swift/Kotlin for v1 if you stay in Expo managed workflow. Native modules are pulled in via Expo plugins.

---

## 3. Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  mobile/  (Expo React Native)                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Auth screens│  │ Bottom tabs  │  │ PitchStack          │ │
│  │ Login/Signup│→ │ Home·Pitch·  │→ │ Setup → LiveRoom    │ │
│  │ Onboarding  │  │ Decks·Hist·  │  │ (WebSocket + cam)   │ │
│  └─────────────┘  │ Profile      │  └─────────────────────┘ │
│                   └──────────────┘                          │
│  Secure Store (JWT) · PitchContext (session config)         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS REST + WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  backend/  (Render: pitchnest-live.onrender.com)            │
│  /api/auth · /api/decks · /api/sessions · /api/profile      │
│  WebSocket → liveSocket.ts → Google Gemini Live API         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL + Storage bucket pitchnest-media)     │
│  users · sessions · decks · profiles · password_resets      │
└─────────────────────────────────────────────────────────────┘
```

**Important:** The mobile app never talks to Supabase directly. All data goes through your Node API with a JWT.

---

## 4. Packages & libraries

### Core framework

| Package | Version (approx) | Purpose |
|---------|------------------|---------|
| `expo` | ~56 | App runtime, config, native modules |
| `react` | 19.x | UI layer |
| `react-native` | 0.85.x | Native primitives |
| `typescript` | ~6 | Type safety |

### Navigation

| Package | Purpose |
|---------|---------|
| `@react-navigation/native` | Navigation container |
| `@react-navigation/native-stack` | Auth stack, root stack, pitch stack |
| `@react-navigation/bottom-tabs` | Home / Pitch / Decks / History / Profile |
| `react-native-screens` | Native screen performance |
| `react-native-safe-area-context` | Notch / home indicator padding |

### Auth & config

| Package | Purpose |
|---------|---------|
| `expo-secure-store` | Encrypted JWT + user JSON on device |
| `expo-constants` | Read env / app config |

### Media & live pitch

| Package | Purpose |
|---------|---------|
| `expo-camera` | Camera preview + snapshot frames for AI vision |
| `expo-audio` | Mic recording chunks + AI audio playback (replaces deprecated `expo-av` on SDK 56) |
| `expo-document-picker` | Pick PDF/PPT for deck upload |
| `expo-file-system` | Read recorded audio / captured slide as base64 |
| `react-native-webview` | Embed PDF via Google gview in deck viewer |
| `react-native-view-shot` | Capture slide area as JPEG for WebSocket |

### UI polish

| Package | Purpose |
|---------|---------|
| `expo-linear-gradient` | Auth hero, CTA cards, setup header |
| `expo-splash-screen` | Native splash (via config plugin) |
| `expo-sharing` | Share session report links |
| `expo-status-bar` | Status bar styling |

### Install command (reference)

```bash
cd mobile
npx create-expo-app@latest mobile --template blank-typescript
npx expo install expo-secure-store expo-camera expo-audio expo-document-picker \
  expo-file-system expo-linking expo-constants react-native-screens \
  react-native-safe-area-context react-native-webview react-native-view-shot \
  expo-sharing expo-splash-screen expo-linear-gradient \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

---

## 5. Storage planning

### What lives where

| Data | Web (before) | Mobile (after) | Backend |
|------|--------------|----------------|---------|
| JWT token | `localStorage.token` | `expo-secure-store` key `pitchnest_token` | Signed with `JWT_SECRET` |
| User object | `localStorage.user` | Secure store `pitchnest_user` | `users` table |
| Onboarding done | `localStorage` flag | Secure store `pitchnest_onboarding_complete` | — |
| Startup name | `localStorage` | Secure store `pitchnest_startup_name` | `profiles` table |
| Pitch session config | `sessionStorage` + route state | `PitchContext` in memory | — |
| Deck files | Supabase Storage | Uploaded via API; URL in `decks.file_url` | `decks` + bucket |
| Sessions / reports | Supabase | Fetched via `/api/sessions` | `sessions` table |

### Why secure store?

- JWT in AsyncStorage is readable on rooted/jailbroken devices
- Apple/Google expect sensitive credentials in Keychain / EncryptedSharedPreferences
- `expo-secure-store` maps to those OS APIs

### Code: secure storage wrapper

File: `mobile/src/lib/storage.ts`

```typescript
import * as SecureStore from 'expo-secure-store';

export const storage = {
  async getToken() { return SecureStore.getItemAsync('pitchnest_token'); },
  async setToken(token: string) { await SecureStore.setItemAsync('pitchnest_token', token); },
  async getUserJson() { /* parse JSON from pitchnest_user */ },
  async setUserJson(user: object) { /* stringify + save */ },
  async clearAuth() { /* delete token + user */ },
};
```

### Code: auth context (same API as web, different storage)

File: `mobile/src/contexts/AuthContext.tsx`

- `login()` → `POST /api/auth/login` → `persistSession(user, token)`
- `signup()` → `POST /api/auth/signup` → same
- `authFetch(path)` → attach `Authorization: Bearer {token}` to all protected calls
- Boot: read secure store → show UI immediately → validate `/api/auth/me` in background

### Slow login note

Login/signup hit **Render + Supabase + bcrypt**. First request after idle can take **15–30 seconds** (cold start). This is not missing storage — it is server wake-up. Mitigations:

- Show loading copy in UI (`AuthShell` / login screen)
- 45s timeout in `mobile/src/lib/authApi.ts`
- Restore cached session on app open without blocking on `/me`

---

## 6. Step-by-step build plan

### Step 1 — Plan scope (before writing code)

Read web app and docs:

- [MOBILE_FEATURE_MAP.md](./MOBILE_FEATURE_MAP.md) — what to keep, rework, or skip
- [MOBILE_STORE_PLAN.md](./MOBILE_STORE_PLAN.md) — store blockers (privacy, delete account, no fake subscriptions)

**v1 MVP scope:**

1. Auth (login, signup, forgot password)
2. Onboarding → profile POST
3. Deck upload + list
4. Pre-pitch setup (no screen share)
5. Live room (WebSocket + mic + deck slides + optional camera)
6. Post-pitch report + history
7. Settings, legal pages, delete account

**Explicitly skip v1:** landing page, analytics charts, screen share, subscriptions, video upload.

---

### Step 2 — Scaffold Expo project

```bash
cd PitchNest-Live
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
# install packages (see section 4)
```

Configure `app.json`:

- `bundleIdentifier` / `package`: `com.pitchnest.app`
- Camera + microphone permission strings (required for App Store)
- Config plugins: `expo-secure-store`, `expo-camera`, `expo-audio`, `expo-splash-screen`

Create `.env.example`:

```env
EXPO_PUBLIC_API_URL=https://pitchnest-live.onrender.com
EXPO_PUBLIC_WS_URL=wss://pitchnest-live.onrender.com
```

File: `mobile/src/config/env.ts` — builds full URLs for REST and WebSocket (web used relative `/api`; mobile cannot).

---

### Step 3 — Auth + navigation shell

**Order of implementation:**

1. `types/index.ts` — `User`, `Deck`, `PitchConfig`, `Session`
2. `lib/storage.ts` — secure store keys
3. `contexts/AuthContext.tsx` — login, signup, logout, `authFetch`
4. `navigation/types.ts` — TypeScript route params
5. `navigation/AuthStack.tsx` — Login, Signup, ForgotPassword
6. `navigation/MainTabs.tsx` — 5 tabs
7. `navigation/PitchStack.tsx` — **Setup → LiveRoom** (critical: live room must live inside Pitch tab stack)
8. `navigation/RootNavigator.tsx` — Auth → Onboarding → MainTabs + modal screens (Report, Legal)

Wrap app in `App.tsx`:

```tsx
<AuthProvider>
  <PitchProvider>
    <RootNavigator />
  </PitchProvider>
</AuthProvider>
```

**Navigation bug we fixed:** LiveRoom was only on the root stack while Setup lived in tabs — `navigate('LiveRoom')` did nothing. **Fix:** nested `PitchStack` inside the Pitch tab.

---

### Step 4 — Feature screens (API parity with web)

Build in this order (each step testable against production API):

| Step | Screen(s) | API |
|------|-----------|-----|
| 4a | Login, Signup, ForgotPassword | `/api/auth/*` |
| 4b | Onboarding | `POST /api/profile` |
| 4c | DecksScreen | `GET/POST/DELETE /api/decks`, upload via FormData |
| 4d | SetupScreen | `GET /api/decks`, pass config via `PitchContext` |
| 4e | LiveRoomScreen | WebSocket + optional vision/audio chunks |
| 4f | ReportScreen, HistoryScreen | `GET /api/sessions`, `DELETE /api/sessions/:id` |
| 4g | ProfileScreen + legal | `DELETE /api/auth/account` |

---

### Step 5 — Polish, compliance, store prep

1. In-app Privacy, Terms, Support, Delete Account (required for stores)
2. AI disclaimer on setup + live room (“simulated investors, not financial advice”)
3. Design pass — Aurora Boardroom theme (`constants/theme.ts`, `AuthShell.tsx`)
4. `eas.json` for TestFlight / Play internal testing
5. Smoke test script: `mobile/scripts/smoke-test-api.mjs`
6. Remove emojis from tab bar → custom `TabIcon.tsx` components

---

## 7. File structure & what each file does

```
mobile/
├── App.tsx                 # Entry: AuthProvider + PitchProvider + RootNavigator
├── index.ts                # Expo registerRootComponent
├── app.json                # Bundle ID, permissions, Expo plugins
├── eas.json                # EAS Build profiles (preview, production)
├── .env.example            # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_WS_URL
├── package.json
├── scripts/
│   └── smoke-test-api.mjs  # Signup → profile → sessions → delete (CI/manual)
└── src/
    ├── config/
    │   └── env.ts          # apiPath(), resolveMediaUrl(), WS URL
    ├── constants/
    │   ├── theme.ts        # Colors, gradients, spacing, typography
    │   └── legal.ts        # Contact email, policy URLs
    ├── types/
    │   └── index.ts        # User, Deck, PitchConfig, Session, etc.
    ├── lib/
    │   ├── storage.ts      # expo-secure-store wrapper
    │   ├── authApi.ts      # fetch with timeout for login/signup
    │   └── utils.ts        # Scores, dates, base64, deck upload helper
    ├── contexts/
    │   ├── AuthContext.tsx # JWT session + authFetch
    │   └── PitchContext.tsx# In-memory pitchConfig for Setup → LiveRoom
    ├── hooks/
    │   └── useRootNavigation.ts  # Navigate to root screens from nested tabs
    ├── navigation/
    │   ├── types.ts
    │   ├── AuthStack.tsx
    │   ├── MainTabs.tsx
    │   ├── PitchStack.tsx  # Setup + LiveRoom
    │   └── RootNavigator.tsx
    ├── components/
    │   ├── AuthShell.tsx   # Gradient login/signup layout
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Screen.tsx      # Safe area + scroll wrapper
    │   ├── DeckSlideViewer.tsx  # WebView PDF + view-shot capture
    │   ├── ScoreBars.tsx
    │   ├── TabIcon.tsx
    │   └── LegalScreen.tsx
    └── screens/
        ├── LoginScreen.tsx
        ├── SignupScreen.tsx
        ├── ForgotPasswordScreen.tsx
        ├── OnboardingScreen.tsx
        ├── HomeScreen.tsx
        ├── SetupScreen.tsx
        ├── LiveRoomScreen.tsx   # Largest file — WebSocket + media
        ├── DecksScreen.tsx
        ├── HistoryScreen.tsx
        ├── ReportScreen.tsx
        ├── ProfileScreen.tsx
        ├── PrivacyScreen.tsx
        ├── TermsScreen.tsx
        ├── SupportScreen.tsx
        └── DeleteAccountScreen.tsx
```

---

## 8. How to code each major feature

### 8.1 Authentication

**Pattern:** Same endpoints as web; replace `localStorage` with secure store.

```typescript
// Login flow
const res = await authRequest('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { user, token } = await res.json();
await storage.setToken(token);
await storage.setUserJson(user);
```

Protected requests:

```typescript
const res = await authFetch('/api/decks', {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

### 8.2 Deck upload

Web uses `react-dropzone`. Mobile uses `expo-document-picker`:

```typescript
const result = await DocumentPicker.getDocumentAsync({
  type: ['application/pdf', 'application/vnd.ms-powerpoint', ...],
  copyToCacheDirectory: true,
});
const formData = new FormData();
formData.append('deck', { uri: asset.uri, name: asset.name, type: asset.mimeType });
await fetch(apiPath('/api/upload-deck'), {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

---

### 8.3 Pre-pitch setup → live room

**Web:** `navigate('/room', { state: { pitchConfig } })` + `sessionStorage`.

**Mobile:**

```typescript
// SetupScreen.tsx
const config: PitchConfig = { mode, businessName, ..., selectedDeck };
setPitchConfig(config);
navigation.navigate('LiveRoom');  // within PitchStack

// LiveRoomScreen.tsx
const { pitchConfig } = usePitchConfig();
// On live: send client_ready over WebSocket with config + userId
ws.send(JSON.stringify({
  type: 'client_ready',
  config: { ...pitchConfig, userId: user?.id, screenShareEnabled: false },
}));
```

---

### 8.4 Live pitch room (WebSocket)

**Connect:**

```typescript
const ws = new WebSocket(env.wsUrl); // wss://pitchnest-live.onrender.com
```

**Send mic audio (chunked):**

```typescript
// expo-audio: record short clip → read file as base64 → send
ws.send(JSON.stringify({
  realtimeInput: {
    mediaChunks: [{ mimeType: 'audio/mp4', data: base64Data }],
  },
}));
```

**Send deck/camera vision (every ~4s):**

```typescript
// Camera: CameraView.takePictureAsync({ base64: true })
// Deck: DeckSlideViewer.captureSlide() via view-shot
ws.send(JSON.stringify({
  realtimeInput: {
    mediaChunks: [{ mimeType: 'image/jpeg', data: base64Jpeg }],
  },
}));
```

**Receive AI audio:**

```typescript
// Server sends { type: 'audio', data: '<base64 PCM>' }
// Convert PCM → WAV → createAudioPlayer (expo-audio) → play
```

**End session:**

```typescript
ws.send(JSON.stringify({
  type: 'end_session',
  duration: secondsElapsed,
  transcript: messagesArray,
}));
// Server responds with { type: 'report', sessionId, data }
```

**Web replacements:**

| Web | Mobile |
|-----|--------|
| `useScreenCapture` | `DeckSlideViewer` + JPEG chunks |
| `useMediaRecorder` + `<video>` | `expo-camera` + `expo-audio` |
| `AudioContext` + PCM | `expo-audio` recording + playback |
| `SocketContext` (relative WS URL) | `env.wsUrl` from config |
| Browser TTS | Removed — use Gemini native audio only |

---

### 8.5 Reports & history

Same REST as web:

```typescript
const res = await authFetch(`/api/sessions/${sessionId}`);
const session = await res.json();
const report = session.evaluation_report;
// Render scores with ScoreBars component
```

Share on mobile:

```typescript
import { Share } from 'react-native';
await Share.share({ message: `https://pitchnestapp.vercel.app/report?session=${id}` });
```

---

### 8.6 Delete account

Two paths (same as web):

1. **Logged in:** `DELETE /api/auth/account` with `{ password }`
2. **Public flow:** `POST /api/auth/delete-account` with `{ email, password }`

After success: `logout()` → clear secure store.

---

## 9. Web → mobile mapping

| Web route | Mobile equivalent |
|-----------|-------------------|
| `/` landing | Skipped — App Store listing |
| `/login`, `/signup` | `AuthStack` + `AuthShell` UI |
| `/onboarding` | `OnboardingScreen` (full screen after first login) |
| `/dashboard` | `HomeScreen` tab |
| `/setup` | `SetupScreen` in Pitch tab |
| `/room` | `LiveRoomScreen` in `PitchStack` |
| `/decks` | `DecksScreen` tab |
| `/archive` | `HistoryScreen` tab |
| `/report` | `ReportScreen` (root stack) |
| `/settings` | `ProfileScreen` tab |
| `/privacy`, `/terms`, etc. | In-app screens + links to `pitchnestapp.vercel.app` |
| Sidebar `AppLayout` | Bottom tabs + stack navigators |

---

## 10. Design system (Aurora Boardroom)

Three directions were merged:

1. **Midnight Boardroom** — dark live room (`colors.roomBg`, `#0b1020`)
2. **Aurora Studio** — indigo/violet gradients on auth (`gradients.auth`, `AuthShell`)
3. **Clean Signal** — white cards, shadows on home/setup (`shadow.card`, `colors.surface`)

Central file: `mobile/src/constants/theme.ts`

```typescript
export const colors = {
  primary: '#6366f1',
  accent: '#22d3ee',
  background: '#f4f6fb',
  roomBg: '#0b1020',
  // ...
};
export const gradients = {
  auth: ['#1e1b4b', '#4338ca', '#0e7490'],
  hero: ['#4f46e5', '#7c3aed', '#0891b2'],
};
```

Reusable UI:

- `AuthShell` — gradient background + glass card + rotating feature pill
- `Button` — primary uses `LinearGradient`
- `Input` — focus ring on indigo border
- `TabIcon` — geometric icons (no emoji)

---

## 11. Environment & backend requirements

### Mobile env (public — safe on device)

```env
EXPO_PUBLIC_API_URL=https://pitchnest-live.onrender.com
EXPO_PUBLIC_WS_URL=wss://pitchnest-live.onrender.com
```

### Backend env (server only — never in app)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Database + storage |
| `SUPABASE_ANON_KEY` | Supabase client |
| `JWT_SECRET` | Sign login tokens |
| `GEMINI_API_KEY` | Live pitch + evaluation |
| `ALLOWED_ORIGIN` | CORS for web |

Mobile apps often send **no Origin** header — backend already allows that in `app.ts`.

### Supabase tables used by mobile (via API)

- `users` — auth
- `profiles` — onboarding
- `decks` — pitch deck metadata + `file_url`
- `sessions` — pitch history + `evaluation_report`
- Storage bucket `pitchnest-media` — PDF files

**You do not need a separate “mobile storage” setup** — same Supabase project as web.

---

## 12. Testing & store build

### Local dev

```bash
cd mobile
npm install
npm start
# Press i (iOS simulator) or scan QR with Expo Go
```

### API smoke test

```bash
node mobile/scripts/smoke-test-api.mjs
```

### Typecheck

```bash
cd mobile && npx tsc --noEmit
```

### Native iOS build (TestFlight path)

```bash
cd mobile
npx expo prebuild --platform ios
npx expo run:ios --device "iPhone 17 Pro"
# Or cloud: eas build --profile preview --platform ios
```

Requires: Apple Developer account, EAS login (`eas login`), bundle ID `com.pitchnest.app`.

---

## 13. Known limitations & next steps

| Item | Status | Next step |
|------|--------|-----------|
| Screen share | Removed | In-app PDF viewer only |
| Live mic format | Chunked MP4, not raw PCM | Tune for lower latency on device |
| PDF slides | Google gview WebView | Server-side thumbnails + native swipe |
| Render cold start | Slow first auth | Upgrade Render plan or keep-alive ping |
| Analytics tab | Not in v1 | Port charts or simplify stats on Home |
| Subscriptions | Hidden | Add Apple IAP + Google Billing when ready |
| `expo-av` | Removed (SDK 56 break) | Use `expo-audio` only |

---

## Quick checklist for a new developer

- [ ] Clone repo, `cd mobile && npm install`
- [ ] Copy `.env.example` → `.env` with production or local API URL
- [ ] Run `npm start`, create account, complete onboarding
- [ ] Upload PDF in **Decks** tab
- [ ] **Pitch** tab → configure → **Start live pitch**
- [ ] Allow microphone (and camera if enabled)
- [ ] End session → view **Report** in History
- [ ] Test delete account in **Profile**

---

*Last updated: May 2026 · Branch: `preston_mobileapp` · App folder: `mobile/`*
