# CYBERFORGE Verification Notes

## Terminal Upgrade — Local Verification

The v2 practice terminal loaded locally on 21 August 2026. The Overview page rendered the existing graphite-and-Forge-Lime dashboard without changes to the sidebar structure. The Practice Terminal showed the new environment switcher, the Termux-style prompt, mission shortcuts, and the clear boundary that the console cannot access a visitor’s device, storage, or an external target.

The command `help beginner` returned the expected beginner command group and guided the learner to Mission 1. Switching the mode control from **TERMUX** to **KALI** changed the prompt and environment label while retaining the same browser-local virtual lab and safety notice.

The simulated command `nmap 10.42.0.12` returned an explicitly labeled, limited observation of the declared 10.42.0.0/24 learning range and stated that no network activity occurred. Returning to the Termux mode and running `pkg install python` produced a realistic package workflow while confirming that no archive, binary, service, or network connection was created.

The Learning Paths workspace displays six structured tracks: Termux Mobile Foundations, Linux Foundations, Evidence & Log Triage, Defensive Web Security, Kali Tool Methodology, and CTF to Professional Report. The Knowledge Base separately presents mobile shell safety, permissions, authorized information gathering, configuration hardening, incident triage, scope, and evidence-led reporting, followed by a clear legal-use notice.

## Remaining Checks

- [x] Verify an authorized virtual-lab tool observation and a Termux package-management response.
- [x] Verify the expanded curriculum and method-library content in the browser.
- [ ] Verify small-screen rendering and keyboard history/completion behavior.
- [ ] Build production files and inspect the deployed CYBERFORGE site.
