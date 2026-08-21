# CYBERFORGE Architecture and Safety Basis

CYBERFORGE is a separate legal cybersecurity learning platform. The first release is designed as a responsive web application with a deterministic, browser-based practice terminal. It does not execute arbitrary operating-system commands, scan third-party systems, collect credentials, or provide access to external targets. This creates an approachable mobile experience while preserving a clear legal and safety boundary.

## Product Boundary

The application is designed around defensive learning, authorized security validation, public vulnerability education, and isolated exercises. The terminal accepts an allow-listed set of simulated Linux commands, presents realistic output from an in-browser virtual filesystem, and provides guided practice prompts. It therefore provides an interactive experience without turning a public website into remote command execution infrastructure.

For a future real terminal product, every session should be created as an isolated, disposable environment with strict outbound network controls, per-session limits, audit logging, and a fixed list of intentionally vulnerable local targets. It must never expose a general-purpose Kali host, arbitrary target scanning, credential collection, malware tooling, or unrestricted internet access.

## Learning Reference Model

CYBERFORGE will reference the OWASP Web Security Testing Guide as a structured source for web-security learning scenarios. The guide describes itself as a comprehensive resource for testing web applications and web services, with versioned scenario identifiers suitable for stable learning references.[1]

The practice interface uses the design approach of a browser terminal front end. Xterm.js documents browser-terminal components, terminal APIs, add-ons, link handling, and security guidance; CYBERFORGE uses the visual model only in the first release, with its own safe command interpreter rather than an external shell.[2]

Kali Linux is positioned as a security-professional distribution with options such as virtual machines and containers. CYBERFORGE will teach safe usage concepts and practice commands in a sandbox; it will not host an unrestricted Kali instance in the public frontend.[3]

## References

[1]: https://owasp.org/www-project-web-security-testing-guide/ "OWASP Web Security Testing Guide"
[2]: https://xtermjs.org/docs/ "Xterm.js Documentation"
[3]: https://www.kali.org/ "Kali Linux"
