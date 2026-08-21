/**
 * CYBERFORGE — Containment Console design.
 * A responsive legal cyber-learning workspace: graphite surfaces, Forge Lime signals,
 * compact monospace terminal output, and no real shell or external-target execution.
 */
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Tab = "overview" | "terminal" | "learn" | "tools" | "knowledge" | "progress";
type TerminalEntry = { type: "input" | "output" | "system"; text: string };

const nav: Array<{ id: Tab; label: string; glyph: string }> = [
  { id: "overview", label: "Overview", glyph: "⌁" },
  { id: "terminal", label: "Practice Terminal", glyph: "›_" },
  { id: "learn", label: "Learning Paths", glyph: "◇" },
  { id: "tools", label: "Defensive Tools", glyph: "◌" },
  { id: "knowledge", label: "Knowledge Base", glyph: "▤" },
  { id: "progress", label: "Progress", glyph: "◎" },
];

const lessons = [
  { id: "linux", title: "Linux Foundations", level: "Foundation", duration: "06 modules", tone: "lime", description: "Navigate a safe Linux workspace, read permissions, inspect processes, and learn clean command habits." },
  { id: "web", title: "Defensive Web Security", level: "Core", duration: "08 modules", tone: "blue", description: "Understand headers, sessions, input validation, and OWASP-aligned web testing methods." },
  { id: "soc", title: "Incident Response Basics", level: "Core", duration: "05 modules", tone: "amber", description: "Triage logs, identify signals, document findings, and escalate responsibly." },
  { id: "lab", title: "Authorized Lab Method", level: "Professional", duration: "04 modules", tone: "violet", description: "Scope an assessment, keep evidence, stay inside permission, and write a useful report." },
];

const knowledge = [
  { code: "WSTG-INFO", title: "Information Gathering", detail: "Learn what public information means in an authorized assessment — without collecting private data." },
  { code: "WSTG-CONF", title: "Configuration & Deployment", detail: "Review security headers, TLS basics, safe configuration, and common hardening priorities." },
  { code: "IR-01", title: "Incident Triage", detail: "Build calm, repeatable evidence collection and communication habits after a suspicious event." },
  { code: "LAB-BOUNDARY", title: "Scope & Authorization", detail: "Practice only in an owned, explicitly authorized, or intentionally vulnerable training environment." },
];

const initialTerminal: TerminalEntry[] = [
  { type: "system", text: "CYBERFORGE PRACTICE CONSOLE v1.0 · ISOLATED SIMULATION" },
  { type: "output", text: "This terminal is a safe in-browser lab. No external systems are reachable." },
  { type: "output", text: "Type `help` to see the learning-safe command set." },
];

function today() {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "2-digit" }).format(new Date());
}

function runSafeCommand(rawInput: string): string[] {
  const input = rawInput.trim();
  const [command, ...args] = input.split(/\s+/);
  const arg = args.join(" ");
  if (!input) return [];

  switch (command.toLowerCase()) {
    case "help":
      return [
        "SAFE COMMANDS",
        "  help                 show this list",
        "  ls [path]            list simulated lab files",
        "  pwd                  show current safe lab path",
        "  cat <file>           read a provided lab file",
        "  whoami               display training identity",
        "  ip addr              view isolated lab interface",
        "  find <path>          find provided evidence files",
        "  grep <term> <file>   search provided lab text",
        "  hint                 show the current lab hint",
        "  clear                clear terminal output",
      ];
    case "pwd":
      return ["/home/forge/authorized-lab"];
    case "ls":
      return [arg.includes("logs") ? "auth.log  web-access.log  alert-summary.txt" : "README.md  evidence/  labs/  logs/  tools/"];
    case "cat":
      if (arg === "README.md") return ["# Authorized Practice Lab", "Scope: localhost training materials only.", "Objective: identify a failed login pattern in logs/auth.log.", "Use: ls logs → cat logs/auth.log → grep failed logs/auth.log"];
      if (arg.includes("auth.log")) return ["08:42:11 login accepted user=analyst source=10.42.0.6", "08:44:03 login failed user=guest source=10.42.0.18", "08:44:07 login failed user=guest source=10.42.0.18", "08:44:14 login failed user=guest source=10.42.0.18", "08:45:09 login locked user=guest action=rate-limit"];
      if (arg.includes("alert-summary")) return ["LAB ALERT SUMMARY", "Repeated failed authentication attempt correctly rate-limited.", "No external target was contacted."];
      return [`cat: ${arg || "missing operand"}: no provided lab file found`];
    case "whoami":
      return ["forge-trainee (authorized simulated environment)"];
    case "ip":
      if (arg === "addr") return ["1: lo: 127.0.0.1/8", "2: lab0: 10.42.0.17/24", "scope: isolated training network · outbound access: blocked"];
      return ["Usage: ip addr"];
    case "find":
      return ["/home/forge/authorized-lab/logs/auth.log", "/home/forge/authorized-lab/logs/web-access.log", "/home/forge/authorized-lab/evidence/chain-of-custody.txt"];
    case "grep":
      if (arg.toLowerCase().includes("failed") && arg.includes("auth.log")) return ["08:44:03 login failed user=guest source=10.42.0.18", "08:44:07 login failed user=guest source=10.42.0.18", "08:44:14 login failed user=guest source=10.42.0.18"];
      return ["No matching sample evidence found. Try: grep failed logs/auth.log"];
    case "hint":
      return ["LAB HINT · Start with `ls logs`, then read `cat logs/auth.log`. Notice what changed after repeated failures."];
    case "clear":
      return ["__CLEAR__"];
    default:
      return [`${command}: disabled in CYBERFORGE’s public safe lab. Try \`help\` for supported practice commands.`];
  }
}

function ShieldMark() {
  return <span className="shield-mark" aria-hidden="true"><i>›</i></span>;
}

function Metric({ value, label, text }: { value: string; label: string; text: string }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span><small>{text}</small></div>;
}

function App() {
  const [active, setActive] = useState<Tab>("overview");
  const [terminal, setTerminal] = useState<TerminalEntry[]>(initialTerminal);
  const [command, setCommand] = useState("");
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("cyberforge-progress") || "[]") as string[]; } catch { return []; }
  });
  const [hashInput, setHashInput] = useState("");
  const [hashOutput, setHashOutput] = useState("");
  const [password, setPassword] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState("");
  const terminalEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem("cyberforge-progress", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { if (active === "terminal") terminalEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [terminal, active]);

  const passwordStatus = useMemo(() => {
    if (!password) return { label: "Waiting", score: 0 };
    const points = [password.length >= 12, /[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^\w]/.test(password)].filter(Boolean).length;
    return { score: points, label: points <= 2 ? "Weak" : points <= 3 ? "Improving" : points === 4 ? "Strong" : "Excellent" };
  }, [password]);

  const completionPercent = Math.round((completed.length / lessons.length) * 100);

  const submitCommand = (event: FormEvent) => {
    event.preventDefault();
    const raw = command;
    if (!raw.trim()) return;
    const output = runSafeCommand(raw);
    if (output.includes("__CLEAR__")) setTerminal([]);
    else setTerminal((entries) => [...entries, { type: "input", text: `forge@cyberforge:~/authorized-lab$ ${raw}` }, ...output.map((text) => ({ type: "output" as const, text }))]);
    setCommand("");
  };

  const doHash = async () => {
    if (!hashInput) { setHashOutput("Add text first. Your input stays in this browser."); return; }
    const data = new TextEncoder().encode(hashInput);
    const digest = await crypto.subtle.digest("SHA-256", data);
    setHashOutput([...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join(""));
  };

  const inspectUrl = () => {
    if (!urlInput.trim()) { setUrlResult("Enter a URL to evaluate its format locally."); return; }
    try {
      const parsed = new URL(urlInput.includes("://") ? urlInput : `https://${urlInput}`);
      const notices = [parsed.protocol === "https:" ? "HTTPS format detected" : "Use HTTPS for sensitive traffic", parsed.hostname.includes("@") ? "Review hostname carefully" : "Hostname format looks normal", "This local check does not contact the website."];
      setUrlResult(notices.join(" · "));
    } catch { setUrlResult("That does not look like a valid URL format."); }
  };

  const toggleLesson = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const goTerminal = () => setActive("terminal");

  return (
    <main className="app-shell">
      <aside className="side-rail">
        <div className="brand"><ShieldMark /><span>CYBER<span>FORGE</span></span></div>
        <div className="rail-divider" />
        <p className="rail-label">WORKSPACE</p>
        <nav aria-label="Primary navigation">
          {nav.map((item) => <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}><b>{item.glyph}</b><span>{item.label}</span></button>)}
        </nav>
        <div className="rail-footer"><span className="live-dot" />SAFE LAB MODE<div>v1.0.0</div></div>
      </aside>

      <section className="workspace">
        <header className="topbar"><div className="crumb"><span>LEGAL PRACTICE</span><i>/</i><strong>{nav.find((item) => item.id === active)?.label}</strong></div><div className="top-actions"><span className="date">{today()}</span><button className="profile" aria-label="Open profile">F</button></div></header>
        <div className="page-content">
          {active === "overview" && <Overview completionPercent={completionPercent} completed={completed.length} onTerminal={goTerminal} onNavigate={setActive} />}
          {active === "terminal" && <Terminal entries={terminal} command={command} onCommandChange={setCommand} onSubmit={submitCommand} />}
          {active === "learn" && <Learning completed={completed} onToggle={toggleLesson} />}
          {active === "tools" && <Tools hashInput={hashInput} setHashInput={setHashInput} hashOutput={hashOutput} doHash={doHash} password={password} setPassword={setPassword} passwordStatus={passwordStatus} urlInput={urlInput} setUrlInput={setUrlInput} urlResult={urlResult} inspectUrl={inspectUrl} />}
          {active === "knowledge" && <Knowledge />}
          {active === "progress" && <Progress completed={completed} completionPercent={completionPercent} onNavigate={setActive} />}
        </div>
      </section>
    </main>
  );
}

function Overview({ completionPercent, completed, onTerminal, onNavigate }: { completionPercent: number; completed: number; onTerminal: () => void; onNavigate: (tab: Tab) => void }) {
  return <>
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot" />SYSTEM STATUS · READY</p>
        <h1>Build security skill<br /><em>with discipline.</em></h1>
        <p className="hero-text">A contained workspace for legal learning, defensive analysis, and authorized practice. No unsafe targets. No real-world scanning.</p>
        <div className="hero-buttons"><button className="primary-btn" onClick={onTerminal}>Open practice console <span>→</span></button><button className="ghost-btn" onClick={() => onNavigate("learn")}>View learning paths</button></div>
      </div>
      <div className="status-panel">
        <div className="panel-head"><span>ENVIRONMENT STATUS</span><i>ISOLATED</i></div>
        <div className="status-grid"><Metric value="04" label="Learning paths" text="Structured modules" /><Metric value="00" label="External targets" text="Outbound blocked" /><Metric value="100%" label="Local practice" text="Browser-contained" /><Metric value={`${completionPercent}%`} label="Progress" text={`${completed} paths started`} /></div>
        <div className="signal-line"><span>LAB INTEGRITY</span><div><i /><i /><i /><i /><i /><i /><i /><i /></div><b>NOMINAL</b></div>
      </div>
    </section>
    <section className="overview-grid">
      <article className="module-card large-card"><div className="card-kicker">ACTIVE PRACTICE</div><div className="terminal-preview"><p><b>forge@cyberforge</b>:<span>~/authorized-lab</span>$ cat logs/auth.log</p><p className="faded">08:44:03 login failed user=guest</p><p className="faded">08:44:14 login failed user=guest</p><p className="lime-text">08:45:09 login locked · rate-limit</p></div><div className="card-bottom"><div><strong>Evidence triage</strong><span>Identify the defensive control in a safe log exercise.</span></div><button onClick={onTerminal}>Launch lab <span>→</span></button></div></article>
      <article className="module-card"><div className="card-kicker">NEXT MILESTONE</div><div className="milestone"><div className="ring"><span>{completionPercent}%</span></div><div><strong>First defensive path</strong><p>Complete Linux Foundations to unlock evidence review workflows.</p></div></div><button className="text-link" onClick={() => onNavigate("learn")}>Continue path →</button></article>
      <article className="module-card note-card"><div className="card-kicker">PRACTICE PRINCIPLE</div><blockquote>“Permission and scope are the first tools in every responsible security assessment.”</blockquote><span>CYBERFORGE FIELD NOTE 01</span></article>
    </section>
  </>;
}

function Terminal({ entries, command, onCommandChange, onSubmit }: { entries: TerminalEntry[]; command: string; onCommandChange: (value: string) => void; onSubmit: (event: FormEvent) => void }) {
  const terminalEnd = useRef<HTMLDivElement>(null);
  useEffect(() => { terminalEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [entries]);
  return <section className="terminal-layout"><div className="section-heading"><div><p className="eyebrow"><span className="live-dot" />SAFE EXECUTION ENVIRONMENT</p><h1>Practice terminal</h1><p>Try guided Linux and evidence-review commands against a local simulated filesystem.</p></div><span className="lab-badge">◈ OUTBOUND BLOCKED</span></div><div className="terminal-frame"><div className="terminal-top"><div><i /><i /><i /></div><span>forge@cyberforge — authorized-lab</span><small>SIMULATED</small></div><div className="terminal-body" aria-live="polite">{entries.map((entry, index) => <pre key={`${entry.text}-${index}`} className={entry.type}>{entry.text}</pre>)}<form onSubmit={onSubmit} className="terminal-form"><label htmlFor="command">forge@cyberforge:~/authorized-lab$</label><input id="command" autoFocus autoComplete="off" spellCheck="false" value={command} onChange={(event) => onCommandChange(event.target.value)} placeholder="type help" /><button type="submit">run</button></form><div ref={terminalEnd} /></div></div><div className="terminal-help"><span>Suggested: <button onClick={() => onCommandChange("help")}>help</button> <button onClick={() => onCommandChange("ls logs")}>ls logs</button> <button onClick={() => onCommandChange("cat logs/auth.log")}>cat logs/auth.log</button> <button onClick={() => onCommandChange("grep failed logs/auth.log")}>grep failed logs/auth.log</button></span><span>Session: Browser-local · No account required</span></div></section>;
}

function Learning({ completed, onToggle }: { completed: string[]; onToggle: (id: string) => void }) {
  return <section><div className="section-heading"><div><p className="eyebrow">CURRICULUM</p><h1>Learning paths</h1><p>Start with defensive foundations. Every exercise stays inside an authorized learning boundary.</p></div></div><div className="learning-grid">{lessons.map((lesson, index) => <article className={`learning-card ${lesson.tone}`} key={lesson.id}><div className="lesson-index">0{index + 1}</div><span>{lesson.level}</span><h2>{lesson.title}</h2><p>{lesson.description}</p><footer><small>{lesson.duration}</small><button className={completed.includes(lesson.id) ? "done" : ""} onClick={() => onToggle(lesson.id)}>{completed.includes(lesson.id) ? "Completed ✓" : "Mark complete"}</button></footer></article>)}</div></section>;
}

function Tools({ hashInput, setHashInput, hashOutput, doHash, password, setPassword, passwordStatus, urlInput, setUrlInput, urlResult, inspectUrl }: { hashInput: string; setHashInput: (v: string) => void; hashOutput: string; doHash: () => void; password: string; setPassword: (v: string) => void; passwordStatus: { label: string; score: number }; urlInput: string; setUrlInput: (v: string) => void; urlResult: string; inspectUrl: () => void }) {
  return <section><div className="section-heading"><div><p className="eyebrow">BROWSER-LOCAL UTILITIES</p><h1>Defensive tools</h1><p>These utilities process your input locally in this browser. They do not submit files, passwords, or URLs to a server.</p></div></div><div className="tool-grid"><article className="tool-card"><span className="tool-number">01</span><h2>SHA-256 text hash</h2><p>Create a repeatable integrity fingerprint for a text note or sample.</p><textarea value={hashInput} onChange={(event) => setHashInput(event.target.value)} placeholder="Paste a text sample…" /><button className="primary-btn small" onClick={doHash}>Generate hash</button>{hashOutput && <code className="result-box">{hashOutput}</code>}</article><article className="tool-card"><span className="tool-number">02</span><h2>Password hygiene check</h2><p>Evaluate the structure of a password locally. CYBERFORGE never saves it.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Test password locally" /><div className="strength"><div>{[1, 2, 3, 4, 5].map((level) => <i key={level} className={level <= passwordStatus.score ? "on" : ""} />)}</div><b>{passwordStatus.label}</b></div><small>Use a unique passphrase and a password manager for real accounts.</small></article><article className="tool-card"><span className="tool-number">03</span><h2>URL format review</h2><p>Review a URL’s visible format before opening it. This does not request or scan the site.</p><input value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="example.com" /><button className="secondary-btn" onClick={inspectUrl}>Review format</button>{urlResult && <div className="plain-result">{urlResult}</div>}</article></div></section>;
}

function Knowledge() {
  return <section><div className="section-heading"><div><p className="eyebrow">METHOD LIBRARY</p><h1>Knowledge base</h1><p>Quick reference notes for careful, lawful security work.</p></div></div><div className="knowledge-list">{knowledge.map((item) => <article key={item.code}><span>{item.code}</span><div><h2>{item.title}</h2><p>{item.detail}</p></div><button aria-label={`Open ${item.title}`}>↗</button></article>)}</div><article className="notice"><strong>Legal use notice</strong><p>Only test systems you own, systems for which you have clear written permission, or deliberately vulnerable practice labs. CYBERFORGE does not provide tools for unauthorized access or external scanning.</p></article></section>;
}

function Progress({ completed, completionPercent, onNavigate }: { completed: string[]; completionPercent: number; onNavigate: (tab: Tab) => void }) {
  return <section><div className="section-heading"><div><p className="eyebrow">LOCAL LEARNING RECORD</p><h1>Your progress</h1><p>Progress is stored in this browser only. Create no account, share no personal data.</p></div></div><div className="progress-layout"><article className="progress-hero"><div><span>CURRENT READINESS</span><strong>{completionPercent}<small>%</small></strong><p>{completed.length ? "Keep stacking safe practice sessions." : "Begin your first path to start tracking progress."}</p><button className="primary-btn" onClick={() => onNavigate("learn")}>Open learning paths →</button></div><div className="large-ring"><span>{completionPercent}%</span></div></article><article className="progress-summary"><p className="card-kicker">PATH COMPLETION</p>{lessons.map((lesson) => <div className="progress-row" key={lesson.id}><span>{lesson.title}</span><b className={completed.includes(lesson.id) ? "complete" : ""}>{completed.includes(lesson.id) ? "COMPLETE" : "NOT STARTED"}</b></div>)}</article></div></section>;
}

export default App;
