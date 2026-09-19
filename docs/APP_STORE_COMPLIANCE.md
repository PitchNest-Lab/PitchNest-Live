# App Store & Google Play — Submission Checklist

**Full copy-paste listings:** see [STORE_LISTING.md](./STORE_LISTING.md)  
**Contact:** prestonjaysusanto@gmail.com · **Age rating:** 13+ · **Violence/profanity:** None

**Last updated:** May 29, 2026

---

## Public URLs (replace `pitchnestapp.vercel.app`)

| Purpose | URL |
|---------|-----|
| Privacy Policy | `https://pitchnestapp.vercel.app/privacy` |
| Terms of Service | `https://pitchnestapp.vercel.app/terms` |
| Delete Account (Google required) | `https://pitchnestapp.vercel.app/delete-account` |
| Support (Apple Support URL) | `https://pitchnestapp.vercel.app/support` |
| Support email | `prestonjaysusanto@gmail.com` |

**In-app:** Settings → Account → Privacy & Legal / Delete Account

---

## Quick status

**Full step-by-step runbook: [PLAY_STORE_READY.md](./PLAY_STORE_READY.md)**

| Requirement | Status |
|-------------|--------|
| Privacy Policy | Done — `/privacy` |
| Terms of Service | Done — `/terms` |
| Delete account (in-app + web) | Done — Settings + `/delete-account` |
| Support page | Done — `/support` |
| Store descriptions & AI disclosure | Done — `STORE_LISTING.md` |
| Age 13+ rating answers | Done — `STORE_LISTING.md` |
| In-app report/flag for AI content (Play policy requirement) | Done — see `PLAY_STORE_READY.md` §1 |
| Render cold-start keep-alive | Done — set `KEEP_ALIVE_URL` env var before submit |
| App Privacy / Data safety forms | **Paste answers in consoles** |
| Demo account for Apple/Google review | **You create** |
| Screenshots + feature graphic | **You create** |
| Deploy to production | **Required before submit** |

---

## Apple App Store — essentials

- Privacy Policy URL → `/privacy`
- Support URL → `/support`
- User Privacy Choices URL → `/delete-account`
- Age rating → **13+** (no violence, no profanity — see STORE_LISTING.md)
- AI disclosure in description → copy from STORE_LISTING.md
- Account deletion → Settings → Delete Account

References: [Account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/) · [Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## Google Play — essentials

- Privacy Policy → `/privacy`
- Delete Account URL → `/delete-account`
- Data safety form → answers in STORE_LISTING.md
- AI-generated content → disclosed in full description
- Content rating (IARC) → 13+, no mature content

References: [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111) · [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311)

---

## Code locations

| Item | Path |
|------|------|
| Contact constant | `frontend/src/lib/legal.ts` |
| Legal pages | `frontend/src/pages/legal/` |
| Delete API | `DELETE /api/auth/account`, `POST /api/auth/delete-account` |
| Settings delete UI | `frontend/src/pages/SettingsPage.tsx` |

---

## Before you submit

1. Deploy frontend + backend  
2. Replace `pitchnestapp.vercel.app` in STORE_LISTING.md with live URL  
3. Copy descriptions into App Store Connect & Play Console  
4. Create demo account for Apple Review  
5. Test `https://pitchnestapp.vercel.app/delete-account` on production  
