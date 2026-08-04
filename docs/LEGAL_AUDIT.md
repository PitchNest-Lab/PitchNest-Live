# Legal Documentation Audit

**Audit date:** May 29, 2026  
**Contact:** prestonjaysusanto@gmail.com  
**Min age:** 13+ · **Violence/profanity:** None declared

---

## Summary

| Area | Status |
|------|--------|
| Privacy Policy | Complete |
| Terms of Service | Complete |
| Delete Account (web + API) | Complete |
| Support page | Complete |
| In-app links | Complete |
| Store listing copy | Complete (`STORE_LISTING.md`) |
| Production deploy | **Pending** — URLs return 404 until deployed |
| Lawyer review | **Recommended** before public launch |

---

## Live pages & routes

| Document | Route | Source file |
|----------|-------|-------------|
| Privacy Policy | `/privacy` | `frontend/src/pages/legal/PrivacyPolicy.tsx` |
| Terms of Service | `/terms` | `frontend/src/pages/legal/TermsOfService.tsx` |
| Delete Account | `/delete-account` | `frontend/src/pages/legal/DeleteAccount.tsx` |
| Support | `/support` | `frontend/src/pages/legal/Support.tsx` |

All registered in `frontend/src/App.tsx` as **public routes** (no login required).

Shared constants: `frontend/src/lib/legal.ts`

---

## Where users find legal docs

| Location | Links |
|----------|--------|
| Landing footer | Privacy, Terms, Delete Account, Support + email |
| Sign up | Terms + Privacy agreement text |
| Log in | Privacy · Terms · Support footer |
| Settings → Account | Privacy, Terms, Support, Delete Account + in-app delete modal |
| Each legal page | Cross-links in footer nav + related policies |

---

## Privacy Policy coverage

| Topic | Covered? |
|-------|----------|
| Data collected (account, profile, pitch, media) | Yes |
| AI / Gemini processing | Yes |
| Third parties (Supabase, Google, hosting) | Yes |
| Data retention & deletion (30 days) | Yes |
| User rights (access, delete, permissions) | Yes |
| Children (13+) | Yes |
| Cookies / local storage | Yes |
| Content rating (no violence/profanity) | Yes |
| Security & international transfers | Yes |
| Contact email | prestonjaysusanto@gmail.com |
| Cross-links to Terms, Delete, Support | Yes |

---

## Terms of Service coverage

| Topic | Covered? |
|-------|----------|
| Service description | Yes |
| Not financial/investment advice | Yes |
| Eligibility (13+) | Yes |
| Account & deletion | Yes |
| User content license | Yes |
| Acceptable use | Yes |
| Subscriptions / cancel separately | Yes |
| Disclaimers & liability limits | Yes |
| Contact + Privacy/Support links | Yes |

---

## Delete account (Apple 5.1.1(v) + Google Play)

| Requirement | Implementation |
|-------------|----------------|
| In-app deletion | Settings → Account → **Delete Account** (password + confirm) |
| Web deletion without app | `/delete-account` (email + password) |
| API (authenticated) | `DELETE /api/auth/account` |
| API (public web) | `POST /api/auth/delete-account` |
| Data removed | User, profile, sessions, decks, password resets, storage files |
| Subscription note | Cancel Apple/Google billing separately |
| Retention disclosure | 30 days; minimal logs may remain |

Backend: `backend/src/controllers/authController.ts` → `purgeUserAccount()`

---

## Store submission docs

| File | Purpose |
|------|---------|
| `docs/STORE_LISTING.md` | Copy-paste descriptions, 13+ rating answers, AI disclosure |
| `docs/APP_STORE_COMPLIANCE.md` | Checklist + URLs for consoles |

Replace `YOUR_DOMAIN` with production URL before submitting.

---

## Gaps & recommendations

### Must do before store submit
- [ ] **Deploy** frontend + backend so `/privacy`, `/terms`, `/delete-account`, `/support` are live on HTTPS
- [ ] Fill **App Store Connect** privacy labels + **Play Console** data safety form (use `STORE_LISTING.md`)
- [ ] Create **demo account** for Apple App Review
- [ ] Test delete flow on production with a throwaway account

### Optional improvements
- [ ] Dedicated **Cookie Policy** page (currently covered in Privacy §8)
- [ ] **CCPA “Do Not Sell”** statement if you sell/share data for ads (you don’t today)
- [ ] **Legal entity name** and registered address in policies (currently “PitchNest” + email only)
- [ ] **In-app AI banner** on live pitch screen (“AI-generated, not real investors”)
- [ ] Have a **lawyer review** policies for your jurisdiction

### Not required for current app
- Cookie consent banner (no ad/tracking cookies)
- Separate EULA (Terms covers this)
- GDPR DPO (unless EU scale operations)

---

## Email consistency check

All legal surfaces use **prestonjaysusanto@gmail.com** via `CONTACT_EMAIL` in `legal.ts`.  
No remaining references to `pitchnest@gmail.com` in the repo.

---

## Quick test after deploy

```bash
curl -I https://YOUR_DOMAIN/privacy
curl -I https://YOUR_DOMAIN/terms
curl -I https://YOUR_DOMAIN/delete-account
curl -I https://YOUR_DOMAIN/support
```

Then: sign up → Settings → Account → Delete Account (test account only).
