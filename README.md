<p align="center">
  <img src="frontend/public/logo.svg" alt="PitchNest Logo" width="80" />
</p>

<h1 align="center">PitchNest</h1>

<p align="center">
  <strong>AI-Powered Pitch Simulation Platform for Startup Founders</strong>
</p>

<p align="center">
  <a href="#tech-stack"><img src="https://img.shields.io/badge/AI-Azure%20OpenAI%20%2B%20Azure%20Speech-0078D4" alt="AI Engine" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Stack-React%2019%20%7C%20Node.js%20%7C%20Supabase-success" alt="Tech Stack" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" /></a>
</p>

---

## Overview

PitchNest is a real-time, voice-driven AI platform that simulates a high-stakes
venture capital boardroom. Founders practice and refine their pitches by
presenting to a panel of AI investor personas that listen, push back, ask tough
questions, and debate — then deliver a structured readiness report scoring the
pitch on delivery, clarity, scalability, and investor readiness.

The live experience streams the founder's microphone audio to the backend over
WebSockets, transcribes it with **Azure Speech**, generates panelist responses
with **Azure OpenAI**, and speaks them back using distinct **Azure Neural
voices** — all with low enough latency to feel like a real conversation.

## Features

- **Real-Time Voice Conversation** — Speak naturally with an AI investor panel over a WebSocket bridge. Speech is transcribed live, answered, and spoken back with per-persona neural voices.
- **Distinct Investor Personas** — Multiple panelists (Marcus, Sarah, Chen, Riley, and more) each with their own personality and voice, from the numbers-obsessed VC to the supportive narrative coach.
- **Interruption Handling** — The panel stops talking the instant the founder jumps in, with active audio buffers terminated immediately for natural back-and-forth.
- **Deck-Aware Intelligence** — Upload a pitch deck (PDF); the backend parses it so the panel can ask slide-specific questions about TAM, unit economics, and go-to-market.
- **Post-Pitch Report** — Every session produces a structured evaluation: summary, scored metrics, strengths, risks, prioritized next steps, panelist sentiment quotes, topic coverage, SWOT, and questions to prepare.
- **Venture Readiness Analytics** — Track delivery, clarity, scalability, and readiness across sessions with calibrated, in-bounds scoring and interactive charts.
- **Session History & Replay** — Revisit past sessions with full transcript and AI commentary.
- **PDF Export & Secure Sharing** — Generate a downloadable PDF of any report and share it via link.
- **Accounts & Profiles** — JWT auth with email verification, password reset, editable profile/bio, and onboarding flow.

## Architecture

```
                  ┌──────────────────────────────────────────────┐
   Browser (SPA)  │  React 19 + Vite — captures mic audio,        │
                  │  renders panel, charts, reports               │
                  └───────────────┬──────────────────────────────┘
                                  │  WebSocket (audio in / events)
                                  │  REST (/api/*)
                  ┌───────────────▼──────────────────────────────┐
   Node Backend   │  Express + ws (restSocket.ts bridge)          │
                  │                                               │
                  │   Azure Speech STT ──► Azure OpenAI brain     │
                  │          ▲                     │              │
                  │          │                     ▼              │
                  │     mic PCM16          Azure Speech TTS ──► audio out
                  └───────────────┬──────────────────────────────┘
                                  │
                  ┌───────────────▼──────────────────────────────┐
   Data / Files   │  Supabase (Postgres)  ·  local/cloud uploads  │
                  └──────────────────────────────────────────────┘
```

The WebSocket bridge in [restSocket.ts](backend/src/sockets/restSocket.ts)
orchestrates the live loop: streaming microphone PCM16 into the Azure Speech
recognizer, feeding final transcripts to the Azure OpenAI brain, and synthesizing
each panelist reply back to the client.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, TypeScript, Tailwind CSS v4, Radix UI, Motion, Recharts, React Router v7, React Hook Form + Zod |
| **Backend** | Node.js, Express 4, TypeScript (run via `tsx`), `ws` WebSockets |
| **AI Brain** | Azure OpenAI (with OpenAI API fallback) for panel dialogue & evaluation |
| **Speech** | Azure Cognitive Services Speech SDK — streaming STT + neural TTS voices |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT + bcrypt, email verification via Nodemailer / Resend |
| **Documents** | `pdf-parse` (deck parsing), `pdfkit` (report export) |
| **Hardening** | `express-rate-limit`, CORS allow-list, JSON error envelope |

## Project Structure

```
PitchNest-Live/
├── frontend/                  # React SPA (Vite, dev port 5174)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # Auth, theme, socket providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities & API client
│   │   └── pages/             # Route-level pages (LivePitchRoom, Dashboard, …)
│   └── public/                # Static assets, PWA icons
├── backend/                   # Node.js API + WebSocket server (port 3000)
│   ├── src/
│   │   ├── config/            # env + Supabase client
│   │   ├── controllers/       # Route handlers (auth, decks, sessions, …)
│   │   ├── routes/            # Express routers
│   │   ├── services/          # aiService, sttService, ttsService, pdf, storage
│   │   ├── sockets/           # restSocket.ts — live audio/AI bridge
│   │   ├── middleware/        # Auth
│   │   └── utils/             # Mailer, sanitizers
│   ├── server.ts              # HTTP + WebSocket entry point
│   └── .env.example           # Environment template
├── dev.js                     # Runs frontend + backend together
├── Dockerfile                 # Multi-stage build (frontend → backend)
└── package.json               # Root orchestration scripts
```

## Getting Started

### Prerequisites

- **Node.js** v18 or higher (Docker image uses Node 22)
- **npm** v9 or higher
- A **Supabase** project ([create one](https://supabase.com))
- **Azure OpenAI** access (or an `OPENAI_API_KEY` as fallback)
- **Azure Speech** resource (key + region) for live transcription and voices

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PitchNest-Lab/PitchNest-Live.git
   cd PitchNest-Live
   ```

2. **Install dependencies**
   ```bash
   npm install                  # root orchestrator deps
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. **Configure environment variables**

   Copy the template and fill in your keys:
   ```bash
   cp backend/.env.example backend/.env
   ```

   | Variable | Required | Description |
   |----------|:--------:|-------------|
   | `SUPABASE_URL` | ✅ | Supabase project URL |
   | `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
   | `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service-role key (server-side) |
   | `JWT_SECRET` | ✅ | Strong random secret for signing JWTs |
   | `ALLOWED_ORIGIN` | ✅ | Frontend origin for CORS (default `http://localhost:5174`) |
   | `AZURE_OPENAI_ENDPOINT` | ✅* | Azure OpenAI resource endpoint |
   | `AZURE_OPENAI_API_KEY` | ✅* | Azure OpenAI key |
   | `AZURE_OPENAI_DEPLOYMENT` | ✅* | Azure OpenAI deployment name |
   | `AZURE_OPENAI_API_VERSION` | ⬜ | API version (default `2024-02-15-preview`) |
   | `OPENAI_API_KEY` | ⬜ | Fallback if Azure OpenAI is not configured |
   | `AZURE_SPEECH_KEY` | ✅ | Azure Speech key (STT + TTS) |
   | `AZURE_SPEECH_REGION` | ✅ | Azure Speech region (e.g. `eastus`) |
   | `MAIL_HOST` | ✅ | SMTP host (e.g. `smtp.gmail.com`) |
   | `MAIL_PORT` | ✅ | SMTP port (e.g. `587`) |
   | `MAIL_USER` | ✅ | SMTP account / sender address |
   | `MAIL_PASS` | ✅ | SMTP password or app password |
   | `CLIENT_URL` | ✅ | Public frontend URL for email links |
   | `PORT` | ⬜ | Backend port (default `3000`) |
   | `NODE_ENV` | ⬜ | `development` or `production` |

   \* Provide either the three `AZURE_OPENAI_*` values **or** `OPENAI_API_KEY`.

4. **Set up the database**

   Create the following tables in your Supabase project (used by the auth, deck,
   session, profile, and waitlist controllers):

   - `users` — accounts, profiles, and verification state
   - `sessions` — pitch session metadata, transcripts, and scores
   - `decks` — uploaded pitch deck references
   - `waitlist` — early-access signups

### Running Locally

From the project root, start both servers with one command:

```bash
npm run dev
```

This launches the backend on **http://localhost:3000** and the frontend on
**http://localhost:5174** (the Vite dev server proxies `/api` to the backend).

To run them separately:

```bash
# Terminal 1 — backend
npm run dev --prefix backend

# Terminal 2 — frontend
npm run dev --prefix frontend
```

Open [http://localhost:5174](http://localhost:5174) and allow microphone access
when prompted.

## Usage

1. **Sign up** and verify your email, then complete onboarding.
2. **Upload your pitch deck** (PDF) so the panel can reference your slides.
3. **Start a pitch session** — pick difficulty and investor personas.
4. **Present live** — speak to the panel; they listen, interject, and question.
5. **Get your report** — receive scores, strengths, risks, and next steps.
6. **Track progress** — review analytics and replays across sessions.

## Deployment

The app ships as a single Node service that serves both the API and the built
frontend, plus configs for a split Vercel + Render deployment.

- **Docker** — The [Dockerfile](Dockerfile) builds the frontend, then runs the
  backend (which serves `frontend/dist` if present):
  ```bash
  docker build -t pitchnest .
  docker run -p 3000:3000 --env-file backend/.env pitchnest
  ```
- **Render** — Backend host (`https://pitchnest-live.onrender.com`).
- **Vercel** — Frontend host; [vercel.json](vercel.json) rewrites `/api/*` to the
  Render backend and serves the SPA.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| root | `npm run dev` | Start frontend + backend together |
| root | `npm run build` | Install + build frontend, install backend |
| root | `npm start` | Start the backend (serves built frontend) |
| backend | `npm run dev` | Run the API + WebSocket server via `tsx` |
| backend | `npm run lint` | Type-check with `tsc --noEmit` |
| frontend | `npm run dev` | Vite dev server on port 5174 |
| frontend | `npm run build` | Production build to `frontend/dist` |
| frontend | `npm run preview` | Preview the production build |

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

- **Email:** pitchnestapp@gmail.com
- **WhatsApp:** [+234 905 871 8400](https://wa.me/2349058718400)
- **Twitter/X:** [@PitchNest](https://x.com/PitchNest)

---

<p align="center">
  Built with ❤️ by the PitchNest team
</p>
