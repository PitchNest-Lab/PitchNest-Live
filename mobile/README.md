# PitchNest Mobile

Native iOS + Android app (Expo / React Native) for PitchNest pitch practice.

## Features

- Sign up / log in with secure JWT storage (`expo-secure-store`)
- Onboarding + profile sync to backend
- Bottom tabs: Home, Pitch, Decks, History, Profile
- Pre-pitch setup (panel / coach / solo)
- Live pitch room: WebSocket + Azure OpenAI / Azure Speech, deck slide viewer, camera, mic, chat
- Post-pitch reports + session history
- In-app Privacy, Terms, Support, Delete Account
- **Free app — no subscriptions**

## Backend

Uses production API by default:

- REST: `https://pitchnest-live.onrender.com`
- WebSocket: `wss://pitchnest-live.onrender.com` (JWT via `?token=` query param)

Copy `.env.example` to `.env` to override.

## Development

```bash
cd mobile
npm install
npm start
```

Press `i` for iOS simulator or scan QR with Expo Go.

## API smoke test

```bash
cd mobile
node scripts/smoke-test-api.mjs
```

## TestFlight / Play Store

See [docs/MOBILE_BUILD_GUIDE.md](../docs/MOBILE_BUILD_GUIDE.md) for the full release checklist.

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform ios
eas submit --platform ios
```

Update `eas.json` with your Apple Team ID and App Store Connect app ID before submit.

## Store checklist

- Bundle ID: `com.pitchnest.app`
- Privacy policy: in-app + https://pitchnestapp.vercel.app/privacy
- Delete account: Profile → Delete Account
- AI disclosure shown in setup and live room
- Demo account for App Review (create in-app or provide credentials in review notes)

## Platform notes

- **iOS** is the primary target for live voice pitch (16 kHz PCM via Azure STT).
- **Android** live voice is supported; best results on physical devices with microphone permissions granted.
