# Trade Assistant

Compact long-only futures trading discipline assistant. The app does not connect to a broker and does not place trades; it only judges setup quality, records entries/results, tracks failed attempts, and exports a daily Markdown review.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage only

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3001.

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
