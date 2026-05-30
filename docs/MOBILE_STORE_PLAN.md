# PitchNest Mobile — App Store & Play Store Plan

**Audience:** Product & engineering team  
**Goal:** Ship an iOS + Android app that passes Apple App Store and Google Play review.  
**Current state:** React web app with live camera, mic, screen share, WebSockets, and Gemini AI.

---

## Bottom line

- Build a **native mobile app** (recommended: **Expo / React Native**), not a thin wrapper around the current website.
- **Screen sharing does not work on mobile** — replace with in-app PDF slide viewing + voice (optional camera).
- Fix **legal & account** requirements before submission; several items are **automatic rejections** today.

**Rough timeline:** ~10–14 weeks (small team), after scope is agreed.

---

## Mobile MVP (v1.0)

| Include | Defer |
|---------|--------|
| Sign up / login | Desktop screen share |
| Upload / select pitch deck | Full analytics parity |
| Voice pitch to AI (+ optional camera) | Complex web-only layouts |
| Swipe through deck slides in-app | |
| Post-pitch report & session history | |
| Settings: privacy links, **delete account** | |

---

## Technical approach

| Layer | Decision |
|-------|----------|
| Mobile app | New `mobile/` folder — **Expo + React Native** |
| Backend | Keep existing Node API + WebSockets; no Gemini keys on device |
| Web app | Keep `frontend/` for desktop/browser |
| Builds | EAS Build → TestFlight (iOS) / Play internal testing → store submit |

**Replace on mobile:** `getDisplayMedia` (screen share) → PDF slide images; browser recording/TTS → Expo media APIs.

---

## Store approval blockers (must fix)

| Item | Status today | Action |
|------|--------------|--------|
| Privacy Policy & Terms | Implemented at `/privacy`, `/terms` | Deploy + link in store consoles |
| Delete account | Implemented (Settings + `/delete-account` + API) | Deploy backend + test |
| AI disclosure | — | Store copy + in-app: feedback is **AI-generated**, not real VCs |
| Permissions | — | Request camera/mic only when starting a pitch; clear purpose strings (iOS) |
| Subscriptions | UI exists | **v1:** go free OR use Apple IAP + Google Play Billing — no web-only paywall in app |
| API keys | Server-side ✓ | Never ship Gemini/Supabase secrets in the app binary |

---

## Apple vs Google — shared checklist

- [ ] Developer accounts (Apple $99/yr, Google $25 one-time)
- [ ] Bundle ID e.g. `com.pitchnest.app`
- [ ] Privacy Policy URL (HTTPS) + Terms + support email — **done in app; deploy required**
- [ ] App Privacy labels (Apple) + Data safety form (Google) — match actual data use
- [ ] Demo account for reviewers (in App Review notes)
- [ ] Icons, screenshots, honest description (no “guaranteed funding” claims)
- [ ] Age rating questionnaire (likely 12+ or 17+)

---

## Phased roadmap

| Phase | Focus | ~Duration |
|-------|--------|-----------|
| **0** | Agree mobile MVP; privacy/terms pages; account deletion | 1–2 weeks |
| **1** | Expo scaffold, auth, API integration | 2–3 weeks |
| **2** | Pitch room (deck viewer + voice, no screen share) | 3–4 weeks |
| **3** | Compliance, demo account, privacy labels | 2 weeks |
| **4** | TestFlight + Play internal test → submit v1.0 | 1–2 weeks |

---

## Risks to avoid

- Wrapping the website in WebView without native pitch flow → **Apple 4.2 rejection**
- Relying on screen share on iOS → **broken core feature**
- Submitting with broken privacy links or non-working “Subscribe” → **rejection**
- Misleading marketing (“real investors”) → **policy violation**

---

## Immediate next steps

1. Team sign-off on **mobile MVP scope** (table above).
2. Ship **Privacy Policy**, **Terms**, and **delete account** on web + API.
3. Create **Expo** project; validate: login → deck → short voice pitch → report.
4. Register **Apple Developer** and **Google Play Console**; reserve app ID.
5. Decide **v1 pricing** (free with limits vs in-app subscriptions).

---

## Questions for team discussion

1. Is v1 **free only**, or do we need subscriptions at launch?
2. Is **camera required** for v1, or voice + deck slides only?
3. Who owns **legal copy** (privacy policy) and **store listings**?

---

**See also:** [MOBILE_FEATURE_MAP.md](./MOBILE_FEATURE_MAP.md) · [APP_STORE_COMPLIANCE.md](./APP_STORE_COMPLIANCE.md) · [LEGAL_AUDIT.md](./LEGAL_AUDIT.md)

*Last updated: May 2026 · Repo: PitchNest-Live*
