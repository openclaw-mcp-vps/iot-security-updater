# iot-security-updater

PatchPilot for IoT is a Next.js 15 application that discovers IoT devices, tracks manufacturer security patches, and schedules patch rollouts during approved maintenance windows.

## Setup

1. Copy `.env.example` to `.env.local` and set values.
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

## Paywall flow

- Landing page opens Lemon Squeezy checkout overlay.
- Lemon Squeezy webhook calls `/api/webhooks/lemonsqueezy`.
- User verifies billing email at `/unlock` which sets a secure access cookie.
- `/dashboard`, `/devices`, `/patches`, and `/settings` are protected by middleware.

## Health check

`GET /api/health` returns:

```json
{"status":"ok"}
```
