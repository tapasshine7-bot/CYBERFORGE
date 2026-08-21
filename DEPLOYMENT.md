# CYBERFORGE Deployment and Future Lab Controls

## Static dashboard deployment

This version is a static React application. Create a production build with:

```bash
pnpm install --frozen-lockfile
pnpm run build
```

Deploy the contents of `dist/` to a static host. No credentials, tokens, API keys, or databases are required for the current browser-local release.

## Future real practice terminal: non-negotiable controls

A real Linux/Kali training terminal must be a separate backend product, not a shell attached directly to this public frontend. Before it is enabled, implement every control below.

| Control | Requirement |
|---|---|
| Isolation | Start one disposable container or VM per practice session. Never share a host shell between users. |
| Network | Default-deny outbound network access. Permit only internal, intentionally vulnerable targets created for the lesson. |
| Command boundary | Expose course-defined lab activities only. Do not offer a general-purpose root shell, arbitrary package installation, or unrestricted tools. |
| Targets | Use only locally hosted teaching targets or systems explicitly owned and authorized by the operator. |
| Limits | Enforce short session expiry, CPU/memory limits, process limits, and automatic destruction on exit. |
| Authentication | Require a user session before creating lab infrastructure; rate-limit creation and monitor abuse. |
| Observability | Keep security audit events without recording passwords, tokens, or sensitive user input. |
| Review | Conduct security review and abuse testing before launching a public real terminal. |

## Explicitly excluded

CYBERFORGE must not be configured as a system for external reconnaissance, arbitrary target scanning, credential acquisition, account bypass, malware execution, or unauthorized access.
