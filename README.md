# Trade Assistant

Compact long-only futures trading discipline assistant. The journal judges setup quality, records entries/results, tracks failed attempts, and exports a daily Markdown review. The chart analysis route evaluates screenshots against the same framework. The app never connects to a broker or places trades.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage only
- OpenAI Responses API for server-side screenshot analysis

## Run

```bash
npm install
cp .env.local.example .env.local
# Add OPENAI_API_KEY to .env.local
npm run dev
```

Open http://localhost:3001.

- Journal: http://localhost:3001/
- Chart analysis: http://localhost:3001/analyze

## Supported Instruments

- MNQ
- MGC
- MCL
- SIL

## Supported Setups

- 破底翻
- 2-2
- 互换
- 破小
