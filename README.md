# LIVAITHON

LIVAITHON is a mobile-friendly, legal cybersecurity learning workspace. It provides guided Linux-style practice, browser-local defensive utilities, structured learning paths, and local-only progress tracking.

> **Legal-use boundary:** Use LIVAITHON only to learn, protect systems you own, assess systems for which you have clear written permission, or work in intentionally vulnerable training labs. This project does not provide arbitrary command execution, external scanning, credential collection, or attack tooling.

## Included in this release

| Area | Included capability |
|---|---|
| Practice terminal | A browser-contained terminal simulation with allow-listed Linux and evidence-review commands |
| Learning paths | Linux foundations, defensive web security, incident response, and authorized-lab method |
| Defensive tools | Local SHA-256 hashing, password-structure feedback, and URL-format review |
| Knowledge base | Short legal-practice, configuration, triage, and scope references |
| Progress | Browser-local lesson completion state; no account and no server-side personal data |

## Run locally

```bash
pnpm install
pnpm dev
```

Open the local address printed by Vite.

## Production build

```bash
pnpm run build
```

The deployment folder is `dist/`. It is suitable for a standard static host such as Cloudflare Pages, Vercel, or Netlify.

## Future real lab terminal

The visible terminal in this version is deliberately simulated so a public website cannot become a remote command server. A future real isolated Kali/Linux practice environment must follow the controls in [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Technology

React, TypeScript, Vite, and browser-native Web Crypto APIs.
