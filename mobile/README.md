# PitchNest Mobile

Native iOS + Android app (Expo / React Native) for PitchNest pitch practice.

## Features

- Sign up / log in with secure JWT storage (`expo-secure-store`)
- Onboarding + profile sync to backend
- Bottom tabs: Home, Pitch, Decks, History, Profile
- Pre-pitch setup (panel / coach / solo) — **no screen sharing**
- Live pitch room: WebSocket + Gemini AI, deck slide viewer, camera, mic, chat
- Post-pitch reports + session history
- In-app Privacy, Terms, Support, Delete Account
- **Free app — no subscriptions**

## Backend

Uses production API by default:

- REST: `https://pitchnest-live.onrender.com`
- WebSocket: `wss://pitchnest-live.onrender.com`

Copy `.env.example` to `.env` to override.

## Development

```bash
cd mobile
npm install
npm start
```

Press `i` for iOS simulator or scan QR with Expo Go.

## TestFlight / Play Store

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
