# PitchNest — Play Store Submission Runbook

**Branch:** `preston_mobileapp` · **App folder:** `mobile/` · **Bundle/package ID:** `com.pitchnest.app`
**Last updated:** Sep 19, 2026

This is the single doc to work from to submit. Everything else in `docs/` (`STORE_LISTING.md`,
`APP_STORE_COMPLIANCE.md`, `LEGAL_AUDIT.md`, `MOBILE_STORE_PLAN.md`) is reference detail this
runbook pulls from.

---

## 0. Do not merge `origin/main` into this branch before submitting

`origin/main` has a different mobile app wired to an Azure backend and a paid Flutterwave
subscription flow. This branch (`preston_mobileapp`) is the free, Gemini-backed app described in
`mobile/README.md`. Submit **this branch** as-is. Reconciling the two mobile apps is a separate,
later decision — don't block the Play submission on it.

---

## 1. Already done (verified in code)

| Item | Where |
|------|-------|
| Native Expo app, no WebView wrapper | `mobile/` |
| Auth with `expo-secure-store` | `mobile/src/contexts/AuthContext.tsx` |
| Camera/mic permission requested only when a pitch starts | `mobile/src/screens/LiveRoomScreen.tsx` |
| No screen-share toggle (removed, replaced with PDF deck viewer) | `mobile/src/components/DeckSlideViewer.tsx` |
| In-app Privacy / Terms / Support / Delete Account screens | `mobile/src/screens/{Privacy,Terms,Support,DeleteAccount}Screen.tsx` |
| Delete account API (in-app + web) | `DELETE /api/auth/account`, `POST /api/auth/delete-account` |
| Public hosted legal pages | `https://pitchnestapp.vercel.app/{privacy,terms,delete-account,support}` |
| AI disclosure text in setup, live room, and report | `SetupScreen`, `LiveRoomScreen`, `ReportScreen`, `PrivacyScreen` |
| Free app, no paywall / no IAP in this build | `mobile/src/screens/{ProfileScreen,LoginScreen,TermsScreen}.tsx` |
| Android `compileSdk`/`targetSdk` 36 (Expo SDK 56) — meets Google's Aug 2026 requirement | `mobile/package.json` (`expo ~56.0.20`) |
| **In-app "report AI content" flow** (new — required by Play's AI-Generated Content policy) | `mobile/src/components/ReportContentModal.tsx`, wired into `LiveRoomScreen` header and `ReportScreen` footer, backed by `POST /api/reports` |
| Unused `FOREGROUND_SERVICE*` Android permissions removed | `mobile/app.json` |
| Render cold-start keep-alive (opt-in via env var) | `backend/src/services/keepAliveService.ts` |

---

## 2. Run this migration before you deploy the backend

```sql
-- backend/migrations/001_content_reports.sql
-- Paste into Supabase SQL editor
```

Without this table the report button still works (it logs to the Render console and shows the
user a confirmation), but reports won't persist. Run the migration so your team can actually see
flagged sessions.

---

## 3. Set one environment variable on Render

Add to the Render service:

```
KEEP_ALIVE_URL=https://pitchnest-live.onrender.com
```

This makes the backend ping its own `/health` every 10 minutes so Apple/Google reviewers and
early users don't hit a 15–30s cold start. Leave it unset locally — it's a no-op without the var.

---

## 4. Things a human still has to do (cannot be scripted)

These need a real Google account, a real device, or a real decision — do them in this order.

1. **Create the Google Play Console app.**
   - Package name: `com.pitchnest.app`
   - $25 one-time developer fee if not already paid.

2. **Create a Play App Signing key** via Play Console (recommended: let Google manage it) —
   no local keystore needed for the first upload if you use `eas build`.

3. **Generate a Google Play service account** for automated submission (optional but recommended):
   - Play Console → Setup → API access → create service account → download JSON.
   - Save it as `mobile/google-play-service-account.json` (already gitignored — do **not** commit it).
   - `mobile/eas.json` already points `submit.production.android.serviceAccountKeyPath` at this file.

4. **Create a demo/reviewer account** in the live app (sign up through the app once) and record the
   email/password. Paste it into the "Notes for review" field described in `STORE_LISTING.md`.

5. **Screenshots + feature graphic.** Run the app on a phone/emulator and capture:
   - Dashboard, Pre-pitch setup, Live room, Report, Settings (5 phone screenshots, Play requires 2+)
   - 1024×500 feature graphic (`docs/STORE_LISTING.md` has copy suggestions)

6. **Fill the Data safety form and content rating (IARC) questionnaire** in Play Console using the
   tables already written out in `docs/STORE_LISTING.md`.

7. **Paste the store listing copy** (title, descriptions, category) from `docs/STORE_LISTING.md`
   directly into Play Console — it's already written and copy-paste ready.

---

## 5. Build and upload

```bash
cd mobile
npm install
npm install -g eas-cli
eas login

# Confirms your build config is valid before spending a build credit
eas build:configure

# Internal testing build first — do not go straight to production
eas build --profile production --platform android
```

When the build finishes, either:

- `eas submit --platform android` (uses the service account JSON from step 4.3), or
- manually upload the `.aab` to Play Console → **Internal testing** track.

`mobile/eas.json` is already set to the `internal` track — leave it there until you've smoke
tested the signed build on a real device.

---

## 6. Before you flip internal testing to production

Do this full pass on the **signed build** installed on a real Android phone, not Expo Go:

1. Sign up → onboarding → land on Home tab
2. Decks tab → upload a real PDF
3. Pitch tab → Setup → pick the deck → Start live pitch
4. Grant mic permission, optionally camera → confirm audio in/out works
5. End session → confirm the Report screen renders scores
6. Tap **"Report this AI feedback"** → confirm it submits (check Render logs or the
   `content_reports` table for the row)
7. Settings/Profile → open Privacy, Terms, Support → confirm each renders real text, not a blank
   screen
8. Profile → Delete Account → confirm it actually logs you out and the account is gone
9. Kill and reopen the app → confirm you land back on Login, not a crash

If any of steps 1–9 fail on a real device, do not promote to production — Play reviewers will
find the same thing.

---

## 7. Known limitations to disclose, not hide

Put these in the app's "Notes for review" field so reviewers don't flag them as bugs:

- No screen sharing on mobile — replaced by in-app PDF deck viewing (intentional, iOS/Android
  don't support `getDisplayMedia`).
- First login after backend idle can take up to 30 seconds if the keep-alive ping (`KEEP_ALIVE_URL`)
  isn't configured yet — configure it before submitting review builds.
- Video replay upload is not implemented on mobile v1 — only audio transcript and score report.
