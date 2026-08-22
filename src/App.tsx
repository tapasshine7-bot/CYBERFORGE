/**
 * CYBERFORGE — Containment Console design.
 * Graphite surfaces, Forge Lime signals, compact operational type, and a fully browser-local
 * Termux/Kali-inspired practice terminal plus a handwritten Study Library. Every command is interpreted against virtual lab data;
 * no device shell, external network target, credential test, or arbitrary code execution exists.
 * Additive updates reuse the established rail, card, and terminal patterns; the existing design is intentionally preserved.
 */
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { studyPages, studyVolumes } from "./studyBook";

type Tab = "overview" | "terminal" | "learn" | "library" | "tools" | "knowledge" | "progress";
type LabMode = "termux" | "kali";
type EntryTone = "default" | "success" | "error" | "warning" | "info" | "muted";
type TerminalEntry = { type: "input" | "output" | "system"; text: string; tone?: EntryTone };
type VirtualFile = { content: string; mode: string; owner: string };
type LabState = {
  mode: LabMode;
  cwd: string;
  dirs: string[];
  files: Record<string, VirtualFile>;
  installed: string[];
  env: Record<string, string>;
  aliases: Record<string, string>;
  mission: string;
};
type CommandResponse = { lines: TerminalEntry[]; state?: LabState; clear?: boolean };

const nav: Array<{ id: Tab; label: string; glyph: string }> = [
  { id: "overview", label: "Overview", glyph: "⌁" },
  { id: "terminal", label: "Practice Terminal", glyph: "›_" },
  { id: "learn", label: "Learning Paths", glyph: "◇" },
  { id: "library", label: "Study Library", glyph: "▤" },
  { id: "tools", label: "Defensive Tools", glyph: "◌" },
  { id: "knowledge", label: "Knowledge Base", glyph: "▤" },
  { id: "progress", label: "Progress", glyph: "◎" },
];

const lessons = [
  { id: "termux", title: "Termux Mobile Foundations", level: "Starter", duration: "05 modules", tone: "lime", description: "Use a mobile-oriented shell prompt, packages, storage concepts, and file navigation in a protected practice environment." },
  { id: "linux", title: "Linux Foundations", level: "Foundation", duration: "06 modules", tone: "blue", description: "Navigate a safe Linux workspace, inspect permissions, work with text, and learn clean command habits." },
  { id: "evidence", title: "Evidence & Log Triage", level: "Core", duration: "06 modules", tone: "amber", description: "Filter event records, recognize rate limits, preserve notes, and produce concise defensive findings." },
  { id: "web", title: "Defensive Web Security", level: "Core", duration: "08 modules", tone: "violet", description: "Understand headers, sessions, input validation, and an OWASP-aligned assessment workflow without scanning external sites." },
  { id: "kali", title: "Kali Tool Methodology", level: "Professional", duration: "07 modules", tone: "lime", description: "Learn when common Kali tools are appropriate, how scope protects people, and how to turn observations into remediation." },
  { id: "report", title: "CTF to Professional Report", level: "Advanced", duration: "05 modules", tone: "blue", description: "Work through contained scenarios, validate defensive controls, and write an evidence-led report for an authorized owner." },
];

const knowledge = [
  { code: "TERMUX-01", title: "Mobile Shell Safety", detail: "A mobile terminal is powerful. Practice package and storage concepts in CYBERFORGE before acting on a real device." },
  { code: "LINUX-02", title: "Paths, Files & Permissions", detail: "Use explicit paths, read before changing, and understand the effect of ownership and mode bits before applying them." },
  { code: "WSTG-INFO", title: "Information Gathering", detail: "Authorized discovery begins with written scope, named assets, a time window, and a contact for unexpected findings." },
  { code: "WSTG-CONF", title: "Configuration & Deployment", detail: "Review security headers, TLS basics, configuration drift, and the hardening priorities that reduce exposure." },
  { code: "IR-01", title: "Incident Triage", detail: "Build calm, repeatable evidence collection and communication habits after a suspicious event." },
  { code: "LAB-BOUNDARY", title: "Scope & Authorization", detail: "Practice only in an owned, explicitly authorized, or intentionally vulnerable training environment." },
  { code: "REPORT-04", title: "Evidence-led Reporting", detail: "Record what was observed, its impact, reproduction limits, the recommended fix, and who owns the next action." },
];

const TERMUX_HOME = "/data/data/com.termux/files/home/authorized-lab";
const KALI_HOME = "/home/forge/authorized-lab";

const initialTerminal: TerminalEntry[] = [
  { type: "system", text: "CYBERFORGE PRACTICE CONSOLE v2.0 · ISOLATED TERMUX / KALI SIMULATION", tone: "success" },
  { type: "output", text: "Browser-local learning environment ready. Your device, storage, and network are never accessed.", tone: "info" },
  { type: "output", text: "Start with `missions`, `help beginner`, or `termux-guide`.", tone: "default" },
];

const initialFiles = (): Record<string, VirtualFile> => ({
  "/README.md": { mode: "-rw-r--r--", owner: "forge:forge", content: "# Authorized Practice Lab\n\nScope: browser-local training materials only.\nObjective: investigate a controlled authentication event, preserve evidence, and identify the defensive control.\n\nStart: missions\nThen: mission 1\n" },
  "/logs/auth.log": { mode: "-rw-r-----", owner: "forge:analysts", content: "08:42:11 login accepted user=analyst source=10.42.0.6\n08:44:03 login failed user=guest source=10.42.0.18\n08:44:07 login failed user=guest source=10.42.0.18\n08:44:14 login failed user=guest source=10.42.0.18\n08:45:09 login locked user=guest action=rate-limit\n08:48:22 login accepted user=analyst source=10.42.0.6\n" },
  "/logs/web-access.log": { mode: "-rw-r-----", owner: "forge:analysts", content: "10.42.0.18 GET / HTTP/1.1 200 1184\n10.42.0.18 GET /login HTTP/1.1 200 941\n10.42.0.18 POST /login HTTP/1.1 429 133\n10.42.0.6 GET /health HTTP/1.1 200 82\n10.42.0.6 GET /dashboard HTTP/1.1 200 2310\n" },
  "/logs/system.log": { mode: "-rw-r-----", owner: "forge:analysts", content: "kernel: lab0 link up (10.42.0.17/24)\nservice: forge-auth rate limiter enabled\nservice: forge-web secure headers profile active\nmonitor: outbound egress policy = deny\n" },
  "/evidence/chain-of-custody.txt": { mode: "-rw-r-----", owner: "forge:analysts", content: "CASE: CF-LAB-042\nCOLLECTOR: forge-trainee\nSOURCE: /logs/auth.log\nSTATUS: training artifact\nRULE: do not copy real personal data into this workspace\n" },
  "/evidence/incident-notes.md": { mode: "-rw-r-----", owner: "forge:analysts", content: "# Incident notes\n\nObservation: repeated failed authentication attempts came from 10.42.0.18.\nControl: the service returned 429 and locked the account.\nNext step: document the rate-limit decision and verify alert routing.\n" },
  "/evidence/backup-manifest.txt": { mode: "-rw-r-----", owner: "forge:analysts", content: "ARTIFACT: training-logs-2026-08-21.zip\nSOURCE: authorized practice environment\nINTEGRITY: sample SHA-256 recorded in the training worksheet\nRETENTION: training artifact only — no personal or production data\nNEXT: compare the approved fingerprint before using the archive\n" },
  "/evidence/handoff-template.md": { mode: "-rw-r-----", owner: "forge:analysts", content: "# Authorized incident handoff\n\nScope: declared training environment only\nObserved: repeated authentication failures were rate-limited\nEvidence: auth.log, web-access.log, and the chain-of-custody note\nRecommendation: verify alert routing and document the control owner\nBoundary: no claims beyond the reviewed training artifacts\n" },
  "/web/public/index.html": { mode: "-rw-r--r--", owner: "forge:forge", content: "<!doctype html>\n<title>Forge Training Portal</title>\n<!-- Training sample: no live service is attached. -->\n" },
  "/web/config/headers.conf": { mode: "-rw-r-----", owner: "forge:analysts", content: "X-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nReferrer-Policy: strict-origin-when-cross-origin\nContent-Security-Policy: default-src 'self'\n" },
  "/scripts/triage.sh": { mode: "-rwxr-x---", owner: "forge:analysts", content: "#!/data/data/com.termux/files/usr/bin/bash\n# Training-only triage outline\ngrep failed logs/auth.log\ngrep 429 logs/web-access.log\n" },
  "/notes/termux-setup.md": { mode: "-rw-r--r--", owner: "forge:forge", content: "# Termux setup sequence (conceptual)\n1. Update package metadata.\n2. Review packages before installing.\n3. Grant storage access only when needed and only to trusted apps.\n4. Keep secrets out of shell history.\n" },
  "/samples/hashes.txt": { mode: "-rw-r-----", owner: "forge:analysts", content: "training-artifact: SHA-256 verification is discussed here.\nNo password hashes or credential material are supplied.\n" },
  "/samples/wordlist.txt": { mode: "-rw-r-----", owner: "forge:analysts", content: "This sample intentionally contains no password candidates.\nUse the lesson to learn password policy and rate-limiting, not guessing.\n" },
  "/.profile": { mode: "-rw-------", owner: "forge:forge", content: "export LAB_MODE=isolated\nalias ll='ls -la'\nalias c='clear'\n" },
});

function createLabState(): LabState {
  return {
    mode: "termux",
    cwd: "/",
    dirs: ["/", "/logs", "/evidence", "/web", "/web/public", "/web/config", "/scripts", "/notes", "/samples", "/downloads"],
    files: initialFiles(),
    installed: ["bash", "coreutils", "grep", "nano", "openssl", "python", "termux-tools"],
    env: { HOME: "~", PREFIX: "/data/data/com.termux/files/usr", LAB_MODE: "isolated", SHELL: "/data/data/com.termux/files/usr/bin/bash" },
    aliases: { ll: "ls -la", c: "clear" },
    mission: "1",
  };
}

const shellCommands = ["help", "missions", "mission", "lab-status", "mode", "termux", "kali", "clear", "reset-lab", "ls", "pwd", "cd", "mkdir", "touch", "rm", "cp", "mv", "cat", "head", "tail", "less", "echo", "nano", "whoami", "id", "hostname", "uname", "date", "uptime", "history", "man", "ps", "top", "kill", "jobs", "chmod", "chown", "grep", "find", "locate", "which", "whereis", "wget", "curl", "tar", "zip", "unzip", "netstat", "ss", "ifconfig", "ip", "ping", "env", "export", "alias", "source", "nmap", "nikto", "gobuster", "dirb", "hydra", "sqlmap", "john", "hashcat", "msfconsole", "metasploit", "tcpdump", "wireshark", "airmon-ng", "airodump-ng", "burpsuite", "kali-tools", "pkg", "apt", "apt-get", "termux-setup-storage", "termux-info", "dpkg", "ssh", "python", "python3", "pip", "pip3", "bash", "sh", "awk", "sed", "cut", "sort", "uniq", "wc", "nc", "netcat", "openssl", "git", "exit"];

const manPages: Record<string, string[]> = {
  ls: ["NAME", "  ls — list virtual lab directory contents", "SAFE PRACTICE", "  ls -la logs", "  Lists browser-local sample artifacts only."],
  grep: ["NAME", "  grep — locate literal text in virtual lab evidence", "SAFE PRACTICE", "  grep failed logs/auth.log", "  Try -r with a virtual directory: grep -r rate-limit logs"],
  nmap: ["NAME", "  nmap — scoped network-observation concept", "SAFE PRACTICE", "  nmap 10.42.0.12", "  CYBERFORGE permits only the declared 10.42.0.0/24 simulated lab."],
  pkg: ["NAME", "  pkg — Termux package-management convenience command", "SAFE PRACTICE", "  pkg update", "  pkg install python", "  In this browser, package changes are recorded only as learning state."],
  chmod: ["NAME", "  chmod — alter virtual file permission bits", "SAFE PRACTICE", "  chmod 640 evidence/incident-notes.md", "  Read the mode before changing it: ls -la evidence"],
  termux: ["TERMUX", "  A mobile-friendly command-line environment. CYBERFORGE mirrors the workflow, not your Android device."],
};

const missions = [
  { id: "1", title: "Authentication triage", level: "BEGINNER", goal: "Identify the control that stopped repeated sign-in failures.", steps: ["ls logs", "cat logs/auth.log", "grep failed logs/auth.log", "grep 429 logs/web-access.log"] },
  { id: "2", title: "Termux workspace", level: "BEGINNER", goal: "Learn safe package and storage concepts without changing your phone.", steps: ["termux-info", "pkg update", "pkg install python", "termux-setup-storage"] },
  { id: "3", title: "Web hardening review", level: "INTERMEDIATE", goal: "Review training headers and record a remediation-minded observation.", steps: ["cat web/config/headers.conf", "nikto lab-web", "burpsuite", "cat evidence/incident-notes.md"] },
  { id: "4", title: "Scoped asset review", level: "PROFESSIONAL", goal: "Confirm the simulated lab scope and document a restrained observation.", steps: ["lab-status", "nmap 10.42.0.12", "tcpdump -i lab0", "cat evidence/chain-of-custody.txt"] },
  { id: "5", title: "Backup integrity review", level: "INTERMEDIATE", goal: "Review a contained backup manifest and explain why integrity and provenance matter before restoration.", steps: ["ls evidence", "cat evidence/backup-manifest.txt", "openssl dgst -sha256 evidence/backup-manifest.txt", "cat evidence/chain-of-custody.txt"] },
  { id: "6", title: "Defensive incident handoff", level: "ADVANCED", goal: "Prepare a scoped handoff using only the training evidence and a remediation-focused recommendation.", steps: ["cat evidence/incident-notes.md", "cat evidence/handoff-template.md", "grep rate-limit logs/auth.log", "cat evidence/chain-of-custody.txt"] },
];

function entry(text: string, tone: EntryTone = "default"): TerminalEntry { return { type: "output", text, tone }; }
function displayPath(cwd: string) { return cwd === "/" ? "~/authorized-lab" : `~/authorized-lab${cwd}`; }
function physicalPath(lab: LabState) { return `${lab.mode === "termux" ? TERMUX_HOME : KALI_HOME}${lab.cwd === "/" ? "" : lab.cwd}`; }
function prompt(lab: LabState) { return `${lab.mode === "termux" ? "u0_a417@localhost" : "forge@kali-lab"}:${displayPath(lab.cwd)} $`; }
function cloneLab(lab: LabState): LabState { return { ...lab, dirs: [...lab.dirs], files: { ...lab.files }, installed: [...lab.installed], env: { ...lab.env }, aliases: { ...lab.aliases } }; }
function resolvePath(rawPath: string | undefined, cwd: string): string {
  if (!rawPath || rawPath === "~") return "/";
  const cleaned = rawPath.replace(/^~\/authorized-lab/, "").replace(/^\/(?:data\/data\/com\.termux\/files\/home|home\/forge)\/authorized-lab/, "");
  const base = cleaned.startsWith("/") ? [] : cwd.split("/").filter(Boolean);
  cleaned.split("/").forEach((part) => { if (!part || part === ".") return; if (part === "..") base.pop(); else base.push(part); });
  return `/${base.join("/")}`.replace(/\/$/, "") || "/";
}
function fileName(path: string) { return path.split("/").filter(Boolean).at(-1) || "authorized-lab"; }
function parentPath(path: string) { const bits = path.split("/").filter(Boolean); bits.pop(); return `/${bits.join("/")}` || "/"; }
function contentLines(file?: VirtualFile) { return file ? file.content.replace(/\n$/, "").split("\n") : []; }
function isLabTarget(value: string) { return /^(10\.42\.0\.(?:12|17|18)|10\.42\.0\.0\/24|lab-web|forge-web)$/i.test(value); }
function listDirectory(lab: LabState, directory: string, detailed = false, all = false) {
  const children: Array<{ name: string; path: string; kind: "dir" | "file" }> = [];
  lab.dirs.filter((dir) => dir !== directory && parentPath(dir) === directory).forEach((dir) => children.push({ name: fileName(dir), path: dir, kind: "dir" }));
  Object.keys(lab.files).filter((path) => parentPath(path) === directory).forEach((path) => children.push({ name: fileName(path), path, kind: "file" }));
  const visible = children.filter((item) => all || !item.name.startsWith("."));
  if (!detailed) return visible.length ? [visible.map((item) => item.kind === "dir" ? `${item.name}/` : item.name).join("  ")] : ["(empty virtual directory)"];
  const special = all ? ["drwxr-x--- forge analysts .", "drwxr-x--- forge analysts .."] : [];
  return [...special, ...visible.map((item) => item.kind === "dir" ? `drwxr-x--- forge analysts ${item.name}/` : `${lab.files[item.path].mode} ${lab.files[item.path].owner.replace(":", " ")} ${item.name}`)];
}
function searchFiles(lab: LabState, term: string, location: string, recursive: boolean) {
  const needle = term.toLowerCase();
  const results: string[] = [];
  Object.entries(lab.files).forEach(([path, file]) => {
    const inLocation = path === location || (recursive && path.startsWith(`${location === "/" ? "" : location}/`));
    if (!inLocation) return;
    contentLines(file).forEach((lineText, index) => { if (lineText.toLowerCase().includes(needle)) results.push(`${path.replace(/^\//, "")}:${index + 1}:${lineText}`); });
  });
  return results;
}
function noExternal(command: string) { return [entry(`${command}: outbound network execution is disabled. No request was sent.`, "warning"), entry("Use the included lab targets, documentation, or a separately approved professional environment.", "muted")]; }
function blockedTool(tool: string, reason: string) { return [entry(`${tool}: ${reason}`, "warning"), entry("CYBERFORGE teaches the defensive purpose and safe operating boundary; it does not emulate offensive execution.", "muted")]; }

function runPipeline(raw: string, lab: LabState): CommandResponse | null {
  const parts = raw.split("|").map((part) => part.trim());
  if (parts.length < 2 || parts.length > 4) return null;
  const first = parts.shift() || "";
  const catMatch = first.match(/^cat\s+(.+)$/i);
  if (!catMatch) return { lines: [entry("pipeline: start with a virtual file, for example: cat logs/auth.log | grep failed", "warning")] };
  const sourcePath = resolvePath(catMatch[1], lab.cwd);
  const file = lab.files[sourcePath];
  if (!file) return { lines: [entry(`cat: ${catMatch[1]}: no such virtual file`, "error")] };
  let lines = contentLines(file);
  for (const segment of parts) {
    const [command, ...args] = segment.split(/\s+/);
    const argument = args.join(" ");
    if (command === "grep" && argument) lines = lines.filter((lineText) => lineText.toLowerCase().includes(argument.replace(/^-i\s*/, "").toLowerCase()));
    else if (command === "sort") lines = [...lines].sort();
    else if (command === "uniq") lines = lines.filter((lineText, index) => lineText !== lines[index - 1]);
    else if (command === "wc" && (argument === "-l" || !argument)) lines = [String(lines.length)];
    else return { lines: [entry(`pipeline: ${segment} is not available in the safe pipeline helper.`, "warning")] };
  }
  return { lines: lines.length ? lines.map((text) => entry(text)) : [entry("(no matching virtual-lab output)", "muted")] };
}

function runLabCommand(rawInput: string, lab: LabState, history: string[]): CommandResponse {
  const input = rawInput.trim();
  if (!input) return { lines: [] };
  const piped = runPipeline(input, lab);
  if (piped) return piped;

  const redirect = input.match(/^echo\s+(.+?)\s*(>>|>)\s*(\S+)$/i);
  if (redirect) {
    const next = cloneLab(lab);
    const target = resolvePath(redirect[3], lab.cwd);
    const parent = parentPath(target);
    if (!next.dirs.includes(parent)) return { lines: [entry(`echo: ${redirect[3]}: parent directory does not exist in the virtual lab`, "error")] };
    const text = redirect[1].replace(/^['"]|['"]$/g, "");
    const previous = next.files[target];
    next.files[target] = { content: redirect[2] === ">>" && previous ? `${previous.content.replace(/\n?$/, "\n")}${text}\n` : `${text}\n`, mode: previous?.mode || "-rw-r-----", owner: previous?.owner || "forge:forge" };
    return { lines: [entry(`virtual file written: ${redirect[3]} (browser-local only)`, "success")], state: next };
  }

  let [command, ...args] = input.split(/\s+/);
  const alias = lab.aliases[command];
  if (alias) {
    const expanded = `${alias}${args.length ? ` ${args.join(" ")}` : ""}`;
    const [expandedCommand, ...expandedArgs] = expanded.split(/\s+/);
    command = expandedCommand;
    args = expandedArgs;
  }
  const lower = command.toLowerCase();
  const arg = args.join(" ");
  const firstPath = args.find((item) => !item.startsWith("-"));
  const next = cloneLab(lab);

  switch (lower) {
    case "help": {
      const category = (args[0] || "").toLowerCase();
      const groups: Record<string, string[]> = {
        beginner: ["BEGINNER · pwd, ls, cd, mkdir, touch, cat, head, tail, echo, history, man", "Try: mission 1"],
        linux: ["LINUX · ps aux, top, chmod, grep -r, find, ip addr, ss, env, alias", "All results use virtual lab evidence."],
        termux: ["TERMUX · termux-info, pkg, apt, termux-setup-storage, dpkg -l, python3, ssh", "Try: termux-guide"],
        kali: ["KALI METHOD · kali-tools, nmap, nikto, gobuster, sqlmap, tcpdump, burpsuite", "Only named 10.42.0.0/24 lab targets have simulated observations."],
        advanced: ["ADVANCED · awk, sed, cut, sort, uniq, wc, openssl, git, bash", "No code, listeners, remote sessions, or external network actions execute."],
      };
      if (category && groups[category]) return { lines: groups[category].map((text, index) => entry(text, index === 0 ? "info" : "muted")) };
      return { lines: [entry("CYBERFORGE SAFE COMMAND DIRECTORY", "success"), entry("  help beginner | linux | termux | kali | advanced", "info"), entry("  missions / mission <1-6> / lab-status / mode termux|kali", "default"), entry("  File practice: pwd, ls, cd, mkdir, touch, rm, cp, mv, cat, grep, find", "default"), entry("  Shell concepts: ps, chmod, ip, env, pkg, apt, python3, awk, openssl, git", "default"), entry("  Security methodology: kali-tools, nmap, nikto, gobuster, sqlmap, tcpdump, burpsuite", "default"), entry("  Safety: every response is simulated; external targets, credential guessing, exploit execution, Wi-Fi capture, and device access are blocked.", "warning")] };
    }
    case "missions": return { lines: [entry("AVAILABLE PRACTICE MISSIONS", "success"), ...missions.flatMap((item) => [entry(`${item.id}. [${item.level}] ${item.title} — ${item.goal}`, "info"), entry(`   Start: mission ${item.id}`, "muted")]) ] };
    case "mission": {
      const selected = missions.find((item) => item.id === args[0]);
      if (!selected) return { lines: [entry("Usage: mission <1-6>. Run `missions` to view objectives.", "warning")] };
      next.mission = selected.id;
      return { lines: [entry(`MISSION ${selected.id} ACTIVATED · ${selected.title.toUpperCase()}`, "success"), entry(selected.goal, "info"), ...selected.steps.map((step, index) => entry(`${index + 1}. ${step}`, "default")), entry("All commands act only on local training artifacts.", "muted")], state: next };
    }
    case "hint": {
      const selected = missions.find((item) => item.id === lab.mission) || missions[0];
      return { lines: [entry(`MISSION ${selected.id} HINT · ${selected.steps[0]} → ${selected.steps[1] || "review the evidence"}`, "info")] };
    }
    case "lab-status": return { lines: [entry("LAB STATUS · CONTAINMENT NOMINAL", "success"), entry(`Mode: ${lab.mode.toUpperCase()} simulation · Prompt: ${prompt(lab)}`, "info"), entry("Network: 10.42.0.0/24 virtual training segment · External egress: DENY", "default"), entry(`Filesystem: ${Object.keys(lab.files).length} virtual files · Storage: browser memory only`, "default"), entry(`Active mission: ${lab.mission} · ${missions.find((item) => item.id === lab.mission)?.title || "None"}`, "default")] };
    case "mode":
      if (args[0] === "termux" || args[0] === "kali") { next.mode = args[0]; return { lines: [entry(`Switched to ${args[0].toUpperCase()}-style prompt. Virtual files and safety boundary remain unchanged.`, "success")], state: next }; }
      return { lines: [entry(`Current mode: ${lab.mode}. Usage: mode termux | mode kali`, "info")] };
    case "termux": next.mode = "termux"; return { lines: [entry("TERMUX-STYLE MODE READY · Use `termux-info` or `termux-guide`.", "success")], state: next };
    case "kali": next.mode = "kali"; return { lines: [entry("KALI-STYLE MODE READY · Use `kali-tools` for the scoped methodology catalog.", "success")], state: next };
    case "clear": return { lines: [], clear: true };
    case "reset-lab": return { lines: [entry("Virtual lab reset. Browser-local files, packages, and aliases returned to the safe baseline.", "success")], state: createLabState() };
    case "pwd": return { lines: [entry(physicalPath(lab), "info")] };
    case "ls": {
      const detailed = args.some((item) => item.includes("l")); const all = args.some((item) => item.includes("a")); const target = resolvePath(firstPath, lab.cwd);
      if (!lab.dirs.includes(target)) return { lines: [entry(`ls: cannot access '${firstPath || "."}': no such virtual directory`, "error")] };
      return { lines: listDirectory(lab, target, detailed, all).map((text) => entry(text)) };
    }
    case "cd": {
      const target = resolvePath(args[0], lab.cwd);
      if (!lab.dirs.includes(target)) return { lines: [entry(`cd: ${args[0] || "~"}: no such virtual directory`, "error")] };
      next.cwd = target; return { lines: [], state: next };
    }
    case "mkdir": {
      const targets = args.filter((item) => !item.startsWith("-"));
      if (!targets.length) return { lines: [entry("mkdir: missing operand", "error")] };
      const made: string[] = [];
      for (const targetArg of targets) { const target = resolvePath(targetArg, lab.cwd); const parent = parentPath(target); if (!next.dirs.includes(parent) && !args.some((item) => item.includes("p"))) return { lines: [entry(`mkdir: cannot create directory '${targetArg}': parent does not exist`, "error")] }; if (!next.dirs.includes(target)) { if (args.some((item) => item.includes("p"))) { let partial = "/"; target.split("/").filter(Boolean).forEach((bit) => { partial = `${partial === "/" ? "" : partial}/${bit}`; if (!next.dirs.includes(partial)) next.dirs.push(partial); }); } else next.dirs.push(target); made.push(targetArg); } }
      return { lines: [entry(made.length ? `created virtual directory: ${made.join(", ")}` : "mkdir: directory already exists", made.length ? "success" : "warning")], state: next };
    }
    case "touch": {
      const targets = args.filter((item) => !item.startsWith("-")); if (!targets.length) return { lines: [entry("touch: missing file operand", "error")] };
      for (const targetArg of targets) { const target = resolvePath(targetArg, lab.cwd); if (!next.dirs.includes(parentPath(target))) return { lines: [entry(`touch: cannot touch '${targetArg}': parent does not exist`, "error")] }; if (!next.files[target]) next.files[target] = { content: "", mode: "-rw-r-----", owner: "forge:forge" }; }
      return { lines: [entry(`updated virtual file timestamp: ${targets.join(", ")}`, "success")], state: next };
    }
    case "rm": {
      const targetArg = args.find((item) => !item.startsWith("-")); if (!targetArg) return { lines: [entry("rm: missing operand", "error")] };
      const target = resolvePath(targetArg, lab.cwd); if (target === "/") return { lines: [entry("rm: refusing to remove the virtual lab root", "warning")] };
      if (next.files[target]) { delete next.files[target]; return { lines: [entry(`removed virtual file: ${targetArg}`, "success")], state: next }; }
      if (next.dirs.includes(target)) { if (!args.some((item) => item.includes("r"))) return { lines: [entry(`rm: cannot remove '${targetArg}': is a directory (use -r only for virtual practice data)`, "warning")] }; next.dirs = next.dirs.filter((dir) => !dir.startsWith(`${target}/`)); next.dirs = next.dirs.filter((dir) => dir !== target); Object.keys(next.files).filter((path) => path.startsWith(`${target}/`)).forEach((path) => delete next.files[path]); return { lines: [entry(`removed virtual directory tree: ${targetArg}`, "success")], state: next }; }
      return { lines: [entry(`rm: cannot remove '${targetArg}': no such virtual file or directory`, "error")] };
    }
    case "cp": case "mv": {
      const [sourceArg, destinationArg] = args.filter((item) => !item.startsWith("-")); if (!sourceArg || !destinationArg) return { lines: [entry(`Usage: ${lower} <virtual-file> <destination>`, "warning")] };
      const source = resolvePath(sourceArg, lab.cwd); let destination = resolvePath(destinationArg, lab.cwd); if (!next.files[source]) return { lines: [entry(`${lower}: cannot stat '${sourceArg}': no such virtual file`, "error")] }; if (next.dirs.includes(destination)) destination = `${destination === "/" ? "" : destination}/${fileName(source)}`; if (!next.dirs.includes(parentPath(destination))) return { lines: [entry(`${lower}: destination parent does not exist`, "error")] }; next.files[destination] = { ...next.files[source] }; if (lower === "mv") delete next.files[source]; return { lines: [entry(`${lower === "cp" ? "copied" : "moved"} virtual file: ${sourceArg} → ${destinationArg}`, "success")], state: next };
    }
    case "cat": {
      if (!args.length) return { lines: [entry("cat: missing file operand", "error")] }; const output: TerminalEntry[] = []; for (const targetArg of args) { const target = resolvePath(targetArg, lab.cwd); const file = lab.files[target]; if (!file) output.push(entry(`cat: ${targetArg}: no such virtual file`, "error")); else output.push(...contentLines(file).map((text) => entry(text))); } return { lines: output };
    }
    case "head": case "tail": case "less": {
      const targetArg = firstPath; const file = targetArg ? lab.files[resolvePath(targetArg, lab.cwd)] : undefined; if (!file) return { lines: [entry(`${lower}: ${targetArg || "missing operand"}: no such virtual file`, "error")] }; const lines = contentLines(file); const countValue = Number(args.find((item) => /^-n?\d+$/.test(item))?.replace(/\D/g, "")) || 10; const shown = lower === "tail" ? lines.slice(-countValue) : lines.slice(0, countValue); return { lines: [ ...(lower === "less" ? [entry("less: simulated pager · q would return to the prompt in a real terminal", "info")] : []), ...shown.map((text) => entry(text)), ...(lower === "less" && lines.length > shown.length ? [entry(`… ${lines.length - shown.length} more virtual lines`, "muted")] : []) ] };
    }
    case "echo": return { lines: [entry(arg.replace(/^['"]|['"]$/g, ""))] };
    case "nano": return { lines: [entry(`nano: ${args[0] || "new-file"} would open a local editor in Termux. This browser terminal is non-editing by design.`, "info"), entry("Practice safe file creation with: echo 'note' > notes/my-note.txt", "muted")] };
    case "whoami": return { lines: [entry(lab.mode === "termux" ? "u0_a417 (simulated Android app sandbox)" : "forge-trainee (authorized simulated environment)", "info")] };
    case "id": return { lines: [entry(lab.mode === "termux" ? "uid=10417(u0_a417) gid=10417(u0_a417) groups=10417(u0_a417) context=isolated-browser" : "uid=1001(forge) gid=1001(forge) groups=1001(forge),1002(analysts) context=isolated-browser", "info")] };
    case "hostname": return { lines: [entry(lab.mode === "termux" ? "localhost" : "kali-lab", "info")] };
    case "uname": return { lines: [entry(args.includes("-a") ? (lab.mode === "termux" ? "Linux localhost 5.10.0-android14-gki aarch64 Android (simulated)" : "Linux kali-lab 6.6.0-kali-amd64 x86_64 GNU/Linux (simulated)") : "Linux", "info")] };
    case "date": return { lines: [entry(`${new Date().toString()} (browser local time)`, "info")] };
    case "uptime": return { lines: [entry(" 09:42:11 up training-session, 1 user, load average: 0.04, 0.03, 0.01 (simulated)", "info")] };
    case "history": return { lines: history.length ? history.map((item, index) => entry(`${String(index + 1).padStart(4, " ")}  ${item}`)) : [entry("No commands in this browser session yet.", "muted")] };
    case "man": { const page = manPages[(args[0] || "").toLowerCase()]; return { lines: page ? page.map((text, index) => entry(text, index === 0 ? "success" : "default")) : [entry(`No CYBERFORGE manual entry for '${args[0] || ""}'. Try: man ls, man grep, man nmap, man pkg, man chmod`, "warning")] }; }
    case "ps": return { lines: [entry("USER       PID %CPU %MEM   VSZ  RSS TTY      STAT START   TIME COMMAND", "info"), entry("forge        1  0.0  0.1  9824 2360 pts/0    Ss   09:40   0:00 forge-shell"), entry("forge       22  0.1  0.2 14400 4100 pts/0    S+   09:42   0:00 training-session"), entry("forge       39  0.0  0.1  6900 1900 pts/0    S    09:42   0:00 audit-agent (simulated)")] };
    case "top": return { lines: [entry("top - 09:42:11 up training-session, 1 user, load average: 0.04, 0.03, 0.01", "info"), entry("Tasks: 3 total, 1 running, 2 sleeping, 0 stopped, 0 zombie"), entry("%Cpu(s): 1.2 us, 0.4 sy, 98.4 id     MiB Mem : 1024.0 total, 710.4 free"), entry(" PID USER     %CPU %MEM COMMAND"), entry("  22 forge     0.1  0.2 training-session")] };
    case "kill": return { lines: [entry("kill: process control is unavailable in a browser simulation. Review process ownership and signals conceptually with `man kill` in a real approved shell.", "warning")] };
    case "jobs": return { lines: [entry("No background jobs in this browser-local terminal.", "muted")] };
    case "chmod": { const [mode, targetArg] = args; const target = targetArg ? resolvePath(targetArg, lab.cwd) : ""; if (!mode || !targetArg || !next.files[target]) return { lines: [entry("Usage: chmod <mode> <virtual-file>, for example: chmod 640 evidence/incident-notes.md", "warning")] }; next.files[target] = { ...next.files[target], mode: `-${mode === "600" ? "rw-------" : mode === "640" ? "rw-r-----" : mode === "644" ? "rw-r--r--" : mode === "755" ? "rwxr-xr-x" : next.files[target].mode.slice(1)}` }; return { lines: [entry(`permissions updated in virtual lab: ${targetArg} → ${mode}`, "success")], state: next }; }
    case "chown": return { lines: [entry("chown: ownership changes are explained but not applied in the shared public lab. Principle: grant the least privilege needed.", "info")] };
    case "grep": {
      const recursive = args.includes("-r") || args.includes("-R"); const cleaned = args.filter((item) => !item.startsWith("-")); const term = cleaned[0]; const location = resolvePath(cleaned[1] || ".", lab.cwd); if (!term) return { lines: [entry("Usage: grep [-r] <literal-text> <virtual-file-or-directory>", "warning")] }; const output = searchFiles(lab, term, location, recursive || lab.dirs.includes(location)); return { lines: output.length ? output.map((text) => entry(text)) : [entry("No matching virtual-lab evidence found.", "muted")] };
    }
    case "find": { const root = resolvePath(firstPath || ".", lab.cwd); const nameArgIndex = args.indexOf("-name"); const pattern = nameArgIndex >= 0 ? args[nameArgIndex + 1]?.replace(/["']/g, "") : ""; const paths = [...lab.dirs, ...Object.keys(lab.files)].filter((path) => path !== "/" && (path === root || path.startsWith(`${root === "/" ? "" : root}/`))).filter((path) => !pattern || new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(fileName(path))); return { lines: paths.length ? paths.map((path) => entry(`${displayPath(path).replace("~/authorized-lab", lab.mode === "termux" ? TERMUX_HOME : KALI_HOME)}${lab.dirs.includes(path) ? "/" : ""}`)) : [entry("find: no matching virtual files", "muted")] }; }
    case "locate": { const query = arg.toLowerCase(); const paths = [...lab.dirs, ...Object.keys(lab.files)].filter((path) => path.toLowerCase().includes(query)); return { lines: query && paths.length ? paths.map((path) => entry(path.replace(/^\//, "authorized-lab/"))) : [entry("locate: no matching virtual index entries", "muted")] }; }
    case "which": { const tool = args[0]; return { lines: tool && shellCommands.includes(tool) ? [entry(lab.mode === "termux" ? `/data/data/com.termux/files/usr/bin/${tool}` : `/usr/bin/${tool}`, "info")] : [entry(`which: no ${tool || "command"} in simulated PATH`, "error")] }; }
    case "whereis": { const tool = args[0] || ""; return { lines: [entry(`${tool}: ${lab.mode === "termux" ? `/data/data/com.termux/files/usr/bin/${tool}` : `/usr/bin/${tool}`} /usr/share/man/man1/${tool}.1.gz (reference path)`, "info")] }; }
    case "wget": case "curl": return { lines: noExternal(lower) };
    case "tar": case "zip": case "unzip": return { lines: [entry(`${lower}: archive operation recognized. In CYBERFORGE, archive extraction and creation are not executed.`, "info"), entry("Practice the syntax on a disposable local lab or review the relevant manual entry before handling untrusted archives.", "muted")] };
    case "netstat": case "ss": return { lines: [entry("Netid State  Recv-Q Send-Q Local Address:Port   Peer Address:Port Process", "info"), entry("tcp   LISTEN 0      128    10.42.0.17:8080    0.0.0.0:*         forge-web (simulated)"), entry("tcp   ESTAB  0      0      10.42.0.17:22      10.42.0.6:51432     forge-ssh (simulated)"), entry("Policy: this view is static training evidence; no sockets are opened.", "muted")] };
    case "ifconfig": return { lines: [entry("lab0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500", "info"), entry("        inet 10.42.0.17  netmask 255.255.255.0  broadcast 10.42.0.255"), entry("        RX packets 148  TX packets 121  (simulated)")] };
    case "ip": return { lines: arg === "addr" || arg === "a" ? [entry("1: lo: <LOOPBACK,UP> mtu 65536", "info"), entry("    inet 127.0.0.1/8 scope host lo"), entry("2: lab0: <BROADCAST,MULTICAST,UP> mtu 1500"), entry("    inet 10.42.0.17/24 scope global lab0"), entry("    scope: isolated training network · outbound access: blocked", "muted")] : [entry("Usage: ip addr", "warning")] };
    case "ping": { const target = args.find((item) => !item.startsWith("-")) || ""; return isLabTarget(target) ? { lines: [entry(`PING ${target} (${target === "lab-web" ? "10.42.0.12" : target}) 56(84) bytes of data.`, "info"), entry(`64 bytes from ${target === "lab-web" ? "10.42.0.12" : target}: icmp_seq=1 ttl=64 time=0.421 ms`), entry(`64 bytes from ${target === "lab-web" ? "10.42.0.12" : target}: icmp_seq=2 ttl=64 time=0.398 ms`), entry("--- virtual lab ping statistics ---"), entry("2 packets transmitted, 2 received, 0% packet loss (simulated)", "success")] } : { lines: noExternal("ping") }; }
    case "env": return { lines: Object.entries(lab.env).map(([key, value]) => entry(`${key}=${value}`, "info")) };
    case "export": { const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/); if (!match) return { lines: [entry("Usage: export NAME=value — values remain in this browser session only.", "warning")] }; next.env[match[1]] = match[2].replace(/^['"]|['"]$/g, ""); return { lines: [entry(`exported ${match[1]} to virtual shell session`, "success")], state: next }; }
    case "alias": { if (!arg) return { lines: Object.entries(lab.aliases).map(([name, value]) => entry(`alias ${name}='${value}'`, "info")) }; const match = arg.match(/^([^=]+)=['"]?(.+?)['"]?$/); if (!match) return { lines: [entry("Usage: alias name='command'", "warning")] }; next.aliases[match[1]] = match[2]; return { lines: [entry(`alias added for this browser session: ${match[1]}`, "success")], state: next }; }
    case "source": return { lines: [entry(`source: ${args[0] || ".profile"} reviewed as a virtual configuration file. No script is executed.`, "info"), entry("Safer habit: read a script before sourcing it; inspect its path, permissions, and intent.", "muted")] };
    case "nmap": { const target = args.at(-1) || ""; if (!isLabTarget(target)) return { lines: [entry("nmap: only declared CYBERFORGE target 10.42.0.0/24, 10.42.0.12, 10.42.0.17, or lab-web can be observed.", "warning")] }; return { lines: [entry("Starting Nmap 7.95 ( https://nmap.org ) at training-time [SIMULATED]", "info"), entry(`Nmap scan report for ${target === "lab-web" ? "lab-web (10.42.0.12)" : target}`), entry("Host is up (0.00042s latency)."), entry("PORT     STATE SERVICE  SAFE LEARNING NOTE"), entry("22/tcp   open  ssh      Access is scoped to lab identities; key hygiene is covered in the lesson."), entry("80/tcp   open  http     Training portal; review security headers and authorization first."), entry("8080/tcp open  http-alt Internal health endpoint; confirm asset owner before any test."), entry("Nmap done: 1 IP address (1 host up) scanned. No network activity occurred.", "success")] }; }
    case "nikto": { const target = args.at(-1) || ""; if (!isLabTarget(target)) return { lines: [entry("nikto: select the named virtual target `lab-web` only. No URL is requested by the browser.", "warning")] }; return { lines: [entry("- Nikto v2.5.0 · TRAINING OBSERVATION ONLY", "info"), entry("+ Target: lab-web (10.42.0.12) · simulated response profile"), entry("+ Server: Forge-Training-Web"), entry("+ X-Frame-Options: DENY observed"), entry("+ Content-Security-Policy: default-src 'self' observed"), entry("+ Training note: confirm headers across every route, then document gaps and remediation owners."), entry("+ No HTTP request was issued outside this browser simulation.", "success")] }; }
    case "gobuster": case "dirb": { const target = args.at(-1) || "lab-web"; if (!isLabTarget(target)) return { lines: [entry(`${lower}: only the declared lab web target is available for a contained directory-discovery demonstration.`, "warning")] }; return { lines: [entry(`${lower.toUpperCase()} · simulated route inventory for lab-web`, "info"), entry("/                    (Status: 200) [Training landing page]"), entry("/login               (Status: 200) [Rate-limited authentication example]"), entry("/health              (Status: 200) [Internal operational endpoint]"), entry("/admin               (Status: 403) [Access control working]"), entry("Learning point: route inventory is valuable only with written authorization and a remediation plan.", "success")] }; }
    case "hydra": return { lines: blockedTool("hydra", "credential-guessing exercises are not offered, even against this demo") };
    case "sqlmap": return { lines: [entry("sqlmap: training review mode — payload delivery and database probing are disabled.", "warning"), entry("Scenario result: the sample login flow uses parameterized queries and rejects malformed fields.", "info"), entry("Defensive checks: parameterized queries, server-side validation, least-privilege DB users, useful error handling, and monitoring.", "success")] };
    case "john": case "hashcat": return { lines: blockedTool(lower, "hash cracking and credential-recovery simulations are not included") };
    case "msfconsole": case "metasploit": return { lines: blockedTool("metasploit", "exploit-framework execution is disabled in the public learning console") };
    case "tcpdump": case "wireshark": return { lines: [entry(`${lower}: simulated metadata capture on lab0 — no interface is opened.`, "info"), entry("09:44:02.145820 IP 10.42.0.6.51432 > 10.42.0.17.22: TCP ACK (training metadata)"), entry("09:44:03.011402 IP 10.42.0.18.40216 > 10.42.0.12.80: HTTP POST /login (rate-limited sample)"), entry("09:44:03.013025 IP 10.42.0.12.80 > 10.42.0.18.40216: HTTP/1.1 429 (defensive control)"), entry("Practice goal: identify protocol, source, destination, event, and protection—not personal data.", "success")] };
    case "airmon-ng": case "airodump-ng": return { lines: blockedTool(lower, "Wi-Fi capture, monitor-mode control, and radio analysis require explicit physical-environment authorization and are not simulated") };
    case "burpsuite": return { lines: [entry("BURP SUITE · SAFE LEARNING WORKFLOW", "success"), entry("1. Define the web asset and written scope."), entry("2. Use an approved test account; never intercept another person’s session."), entry("3. Review requests for validation, authorization, session, and header controls."), entry("4. Report a minimal reproduction and remediation—not destructive payloads."), entry("CYBERFORGE does not create an intercept proxy or send browser traffic.", "muted")] };
    case "kali-tools": return { lines: [entry("KALI TOOL METHOD CATALOG · CONTAINED LEARNING", "success"), entry("nmap       scoped asset observation on the virtual 10.42.0.0/24 lab", "info"), entry("nikto      safe web-hardening observation for lab-web", "info"), entry("gobuster   contained route-inventory demonstration", "info"), entry("sqlmap     defensive parameterized-query lesson; no payload delivery", "info"), entry("tcpdump    packet-metadata interpretation on a sample lab interface", "info"), entry("burpsuite  authorized web-testing workflow and documentation model", "info"), entry("hydra, john, hashcat, metasploit, and wireless tooling are intentionally non-operational in the public console.", "warning")] };
    case "termux-guide": return { lines: [entry("TERMUX-STYLE STARTER GUIDE · DEVICE-SAFE", "success"), entry("1. `pkg update` — understand package metadata refresh."), entry("2. `pkg install python` — record an educational package install in this simulation."), entry("3. `termux-setup-storage` — learn why storage permission should be intentional."), entry("4. `pwd`, `ls -la`, `cat notes/termux-setup.md` — work inside a dedicated project folder."), entry("5. Keep API keys and personal files out of command history; use a password manager and least privilege."), entry("CYBERFORGE never asks Android for storage, camera, contacts, SMS, or shell access.", "warning")] };
    case "pkg": case "apt": case "apt-get": { const action = args[0]; const packages = args.slice(1).filter((item) => !item.startsWith("-")); if (action === "update" || action === "upgrade") return { lines: [entry(`${lower}: package metadata refresh simulated.`, "info"), entry("Hit:1 https://packages.termux.dev stable InRelease [SIMULATED]"), entry("Reading package lists... Done"), entry("0 packages downloaded · no device package database changed.", "success")] }; if (action === "install" && packages.length) { const added = packages.filter((pkg) => !next.installed.includes(pkg)); next.installed.push(...added); return { lines: [entry(`Preparing virtual package state for: ${packages.join(", ")}`, "info"), entry(`Installed in browser-local learning profile: ${added.length ? added.join(", ") : "already present"}`, "success"), entry("No package archive, binary, service, or network connection was created.", "muted")], state: next }; } return { lines: [entry(`Usage: ${lower} update | ${lower} upgrade | ${lower} install <package>`, "warning")] }; }
    case "termux-setup-storage": { if (!next.dirs.includes("/storage")) { next.dirs.push("/storage", "/storage/shared"); } return { lines: [entry("termux-setup-storage: simulated storage mapping prepared at ~/authorized-lab/storage/shared", "success"), entry("No Android permission prompt appears because CYBERFORGE cannot access your device storage.", "warning")], state: next }; }
    case "termux-info": return { lines: [entry("Termux Variables:", "success"), entry("TERMUX_VERSION=0.118.0 (simulated)"), entry("TERMUX_ARCH=aarch64 (simulated)"), entry("TERMUX_PREFIX=/data/data/com.termux/files/usr"), entry("TERMUX_HOME=/data/data/com.termux/files/home"), entry("CYBERFORGE_MODE=browser-local-isolated", "info"), entry("System information is illustrative only; no Android properties are read.", "muted")] };
    case "dpkg": return args[0] === "-l" ? { lines: [entry("Desired=Unknown/Install/Remove/Purge/Hold", "info"), entry("||/ Name          Version       Architecture Description"), ...lab.installed.map((pkg) => entry(`ii  ${pkg.padEnd(13)} simulated     ${lab.mode === "termux" ? "aarch64" : "amd64"}      CYBERFORGE learning package`))] } : { lines: [entry("Usage: dpkg -l", "warning")] };
    case "ssh": { const target = args.at(-1) || ""; return isLabTarget(target) || /lab-(web|analyst)/.test(target) ? { lines: [entry(`ssh: simulated connection request to ${target}`, "info"), entry("The public console does not open remote sessions, forward ports, or process keys."), entry("Lesson: verify hostname, pin trusted keys, use least privilege, and obtain written authorization before any real connection.", "success")] } : { lines: noExternal("ssh") }; }
    case "python": case "python3": return { lines: [entry(`${lower}: Python syntax workspace is conceptual in this public console. Code is not evaluated.`, "info"), entry("Practice pattern: create a small script in a disposable project, read inputs carefully, and avoid running copied snippets with secrets or elevated privileges.", "muted")] };
    case "pip": case "pip3": return { lines: [entry(`${lower}: package installation is simulated. No package index is contacted.`, "warning"), entry("Safe habit: read a package’s source, maintainer, release history, and dependency list before installing it in a dedicated environment.", "info")] };
    case "bash": case "sh": return { lines: [entry(`${lower}: interactive shell spawning is not required—the CYBERFORGE prompt already accepts its safe practice subset.`, "info"), entry("Bash outline: #!/bin/bash · variables · quoted arguments · exit codes · controlled loops · logging.", "muted")] };
    case "./scripts/triage.sh": return { lines: [entry("triage.sh: safe script review mode", "info"), entry("1. Found 3 failed logins from 10.42.0.18"), entry("2. Found HTTP 429 rate-limit response"), entry("3. Record evidence source and confirm the alert owner"), entry("No shell script was executed.", "success")] };
    case "awk": case "sed": case "cut": return { lines: [entry(`${lower}: text-processing concept recognized. The public console does not evaluate arbitrary programs or expressions.`, "info"), entry("Use `grep`, `sort`, `uniq`, and `wc` against the provided sample logs, then compare the result with the mission objective.", "muted")] };
    case "sort": case "uniq": return { lines: [entry(`${lower}: use the safe pipeline helper, for example: cat logs/auth.log | grep failed | sort | uniq`, "info")] };
    case "wc": { const targetArg = firstPath; const file = targetArg ? lab.files[resolvePath(targetArg, lab.cwd)] : undefined; if (!file) return { lines: [entry("Usage: wc <virtual-file>, for example: wc logs/auth.log", "warning")] }; const lines = contentLines(file); const words = file.content.trim().split(/\s+/).filter(Boolean).length; return { lines: [entry(`${String(lines.length).padStart(7)} ${String(words).padStart(7)} ${String(file.content.length).padStart(7)} ${targetArg}`, "info")] }; }
    case "nc": case "netcat": return { lines: [entry(`${lower}: listener, remote connection, and transfer behavior are disabled in the public terminal.`, "warning"), entry("Defensive lesson: understand port ownership, firewall policy, logs, and explicit authorization before using connection tools.", "info")] };
    case "openssl": { const targetArg = args.at(-1) || ""; const file = lab.files[resolvePath(targetArg, lab.cwd)]; if (args.includes("dgst") && file) return { lines: [entry(`SHA2-256(${targetArg})= 2d3db4983cf5d1dbe33f45d0f68f7e8e90d9b7e466d0a6b7b7a6d0c3e1a5c812 (training fingerprint)`, "success"), entry("Use hashes to verify approved artifacts; do not treat a hash as a password-protection mechanism.", "muted")] }; return { lines: [entry("openssl: certificate and hash concepts are supported as safe references. Try: openssl dgst -sha256 README.md", "info")] }; }
    case "git": { const subcommand = args[0]; if (subcommand === "status") return { lines: [entry("On branch training-lab", "info"), entry("nothing to commit, working tree clean (virtual repository)", "success")] }; if (subcommand === "log") return { lines: [entry("commit 3f0rge42 (HEAD -> training-lab)", "info"), entry("Author: CYBERFORGE Training <lab@local>"), entry("Date:   training-time"), entry("    Establish isolated evidence triage exercise")] }; if (subcommand === "clone") return { lines: noExternal("git clone") }; return { lines: [entry("Usage: git status | git log. Clone and remote actions are blocked in the browser-local lab.", "warning")] }; }
    case "exit": return { lines: [entry("This is a browser learning console; there is no device shell session to close. Use another workspace tab when finished.", "info")] };
    default: return { lines: [entry(`${command}: command not found in CYBERFORGE's safe interpreter.`, "error"), entry("Try `help`, `missions`, or `termux-guide`. Tab reveals command matches; ↑ / ↓ recalls history.", "muted")] };
  }
}

function completionCandidates(value: string, lab: LabState) {
  const trimmed = value.trimStart();
  if (!trimmed.includes(" ")) return shellCommands.filter((item) => item.startsWith(trimmed.toLowerCase())).map((item) => `${item} `);
  const [command, partial = ""] = trimmed.split(/\s+/, 2);
  if (["cd", "cat", "head", "tail", "less", "rm", "chmod", "wc", "openssl"].includes(command)) {
    const candidates = [...lab.dirs, ...Object.keys(lab.files)].filter((path) => parentPath(path) === lab.cwd || path.startsWith(resolvePath(partial || ".", lab.cwd))).map((path) => `${command} ${path.replace(`${lab.cwd === "/" ? "" : lab.cwd}/`, "").replace(/^\//, "")}${lab.dirs.includes(path) ? "/" : ""}`);
    return candidates.filter((item) => item.toLowerCase().startsWith(trimmed.toLowerCase()));
  }
  return [];
}

function today() { return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "2-digit" }).format(new Date()); }
function ShieldMark() { return <span className="shield-mark" aria-hidden="true"><i>›</i></span>; }
function Metric({ value, label, text }: { value: string; label: string; text: string }) { return <div className="metric"><strong>{value}</strong><span>{label}</span><small>{text}</small></div>; }

function App() {
  const [active, setActive] = useState<Tab>("overview");
  const [terminal, setTerminal] = useState<TerminalEntry[]>(initialTerminal);
  const [command, setCommand] = useState("");
  const [lab, setLab] = useState<LabState>(createLabState);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [completionHint, setCompletionHint] = useState("Tab: complete command · ↑/↓: history · Ctrl+L: clear");
  const [completed, setCompleted] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("cyberforge-progress") || "[]") as string[]; } catch { return []; } });
  const [studyPage, setStudyPage] = useState(1);
  const [hashInput, setHashInput] = useState(""); const [hashOutput, setHashOutput] = useState(""); const [password, setPassword] = useState(""); const [urlInput, setUrlInput] = useState(""); const [urlResult, setUrlResult] = useState("");

  useEffect(() => { localStorage.setItem("cyberforge-progress", JSON.stringify(completed)); }, [completed]);
  const passwordStatus = useMemo(() => { if (!password) return { label: "Waiting", score: 0 }; const points = [password.length >= 12, /[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^\w]/.test(password)].filter(Boolean).length; return { score: points, label: points <= 2 ? "Weak" : points <= 3 ? "Improving" : points === 4 ? "Strong" : "Excellent" }; }, [password]);
  const completionPercent = Math.round((completed.length / lessons.length) * 100);

  const submitCommand = (event: FormEvent) => {
    event.preventDefault(); const raw = command.trim(); if (!raw) return;
    const response = runLabCommand(raw, lab, commandHistory);
    if (response.clear) setTerminal([]); else setTerminal((entries) => [...entries, { type: "input", text: `${prompt(lab)} ${raw}` }, ...response.lines]);
    if (response.state) setLab(response.state);
    setCommandHistory((current) => [...current, raw]); setHistoryIndex(-1); setCompletionHint("Command executed in the browser-local training lab."); setCommand("");
  };
  const handleTerminalKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey && event.key.toLowerCase() === "l") { event.preventDefault(); setTerminal([]); setCompletionHint("Terminal output cleared. History remains available with ↑."); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); if (!commandHistory.length) return; const nextIndex = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1); setHistoryIndex(nextIndex); setCommand(commandHistory[nextIndex]); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); if (historyIndex < 0) return; const nextIndex = historyIndex + 1; if (nextIndex >= commandHistory.length) { setHistoryIndex(-1); setCommand(""); } else { setHistoryIndex(nextIndex); setCommand(commandHistory[nextIndex]); } return; }
    if (event.key === "Tab") { event.preventDefault(); const candidates = completionCandidates(command, lab); if (candidates.length === 1) { setCommand(candidates[0]); setCompletionHint(`Completed: ${candidates[0].trim()}`); } else if (candidates.length > 1) setCompletionHint(`Matches: ${candidates.slice(0, 8).map((item) => item.trim()).join(" · ")}`); else setCompletionHint("No safe command or virtual-path match."); }
  };
  const changeMode = (mode: LabMode) => { setLab((current) => ({ ...current, mode })); setCompletionHint(`${mode.toUpperCase()}-style prompt selected. The lab remains browser-local and isolated.`); };
  const doHash = async () => { if (!hashInput) { setHashOutput("Add text first. Your input stays in this browser."); return; } const data = new TextEncoder().encode(hashInput); const digest = await crypto.subtle.digest("SHA-256", data); setHashOutput([...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")); };
  const inspectUrl = () => { if (!urlInput.trim()) { setUrlResult("Enter a URL to evaluate its format locally."); return; } try { const parsed = new URL(urlInput.includes("://") ? urlInput : `https://${urlInput}`); setUrlResult([parsed.protocol === "https:" ? "HTTPS format detected" : "Use HTTPS for sensitive traffic", parsed.hostname.includes("@") ? "Review hostname carefully" : "Hostname format looks normal", "This local check does not contact the website."].join(" · ")); } catch { setUrlResult("That does not look like a valid URL format."); } };
  const toggleLesson = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const openLessonLab = (lessonId: string) => {
    const missionId: Record<string, string> = { termux: "2", linux: "1", evidence: "1", web: "3", kali: "4", report: "6" };
    const response = runLabCommand(`mission ${missionId[lessonId] || "1"}`, lab, commandHistory);
    if (response.state) setLab(response.state);
    setTerminal((entries) => [...entries, { type: "system", text: "LEARNING PATH LAUNCHED · SAFE MISSION READY", tone: "success" }, ...response.lines]);
    setCompletionHint("Path opened in the browser-local practice terminal. Follow the mission steps in order.");
    setActive("terminal");
  };

  return <main className="app-shell"><aside className="side-rail"><div className="brand"><ShieldMark /><span>CYBER<span>FORGE</span></span></div><div className="rail-divider" /><p className="rail-label">WORKSPACE</p><nav aria-label="Primary navigation">{nav.map((item) => <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}><b>{item.glyph}</b><span>{item.label}</span></button>)}</nav><div className="rail-footer"><span className="live-dot" />SAFE LAB MODE<div>v2.2.0 · ISOLATED</div></div></aside><section className="workspace"><header className="topbar"><div className="crumb"><span>LEGAL PRACTICE</span><i>/</i><strong>{nav.find((item) => item.id === active)?.label}</strong></div><div className="top-actions"><span className="date">{today()}</span><button className="profile" aria-label="Open local profile">F</button></div></header><div className="page-content">{active === "overview" && <Overview completionPercent={completionPercent} completed={completed.length} onTerminal={() => setActive("terminal")} onNavigate={setActive} />}{active === "terminal" && <Terminal entries={terminal} command={command} lab={lab} completionHint={completionHint} onCommandChange={setCommand} onSubmit={submitCommand} onKeyDown={handleTerminalKey} onModeChange={changeMode} />}{active === "learn" && <Learning completed={completed} onToggle={toggleLesson} onOpenLab={openLessonLab} />}{active === "library" && <StudyLibrary selectedPage={studyPage} onSelectPage={setStudyPage} />}{active === "tools" && <Tools hashInput={hashInput} setHashInput={setHashInput} hashOutput={hashOutput} doHash={doHash} password={password} setPassword={setPassword} passwordStatus={passwordStatus} urlInput={urlInput} setUrlInput={setUrlInput} urlResult={urlResult} inspectUrl={inspectUrl} />}{active === "knowledge" && <Knowledge />}{active === "progress" && <Progress completed={completed} completionPercent={completionPercent} onNavigate={setActive} onReset={() => setCompleted([])} />}</div></section></main>;
}

function Overview({ completionPercent, completed, onTerminal, onNavigate }: { completionPercent: number; completed: number; onTerminal: () => void; onNavigate: (tab: Tab) => void }) { return <><section className="hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="live-dot" />SYSTEM STATUS · READY</p><h1>Build security skill<br /><em>with discipline.</em></h1><p className="hero-text">A contained workspace for legal learning, defensive analysis, and authorized practice. Work through a Termux-style or Kali-style prompt without opening a device shell or reaching an external target.</p><div className="hero-buttons"><button className="primary-btn" onClick={onTerminal}>Open practice console <span>→</span></button><button className="ghost-btn" onClick={() => onNavigate("learn")}>View learning paths</button></div></div><div className="status-panel"><div className="panel-head"><span>ENVIRONMENT STATUS</span><i>ISOLATED</i></div><div className="status-grid"><Metric value="06" label="Learning paths" text="Starter to advanced" /><Metric value="00" label="External targets" text="Outbound blocked" /><Metric value="100%" label="Local practice" text="Browser-contained" /><Metric value={`${completionPercent}%`} label="Progress" text={`${completed} paths complete`} /></div><div className="signal-line"><span>LAB INTEGRITY</span><div><i /><i /><i /><i /><i /><i /><i /><i /></div><b>NOMINAL</b></div></div></section><section className="overview-grid"><article className="module-card large-card"><div className="card-kicker">ACTIVE PRACTICE · MISSION 01</div><div className="terminal-preview"><p><b>u0_a417@localhost</b>:<span>~/authorized-lab</span>$ grep failed logs/auth.log</p><p className="faded">08:44:03 login failed user=guest</p><p className="faded">08:44:14 login failed user=guest</p><p className="lime-text">08:45:09 login locked · rate-limit</p></div><div className="card-bottom"><div><strong>Evidence triage</strong><span>Identify the defensive control in a safe authentication-log exercise.</span></div><button onClick={onTerminal}>Launch lab <span>→</span></button></div></article><article className="module-card"><div className="card-kicker">TERMINAL STRUCTURE</div><div className="milestone"><div className="ring"><span>02</span></div><div><strong>Termux → Kali method</strong><p>Begin with paths and packages, then learn scoped observations, hardening, and reporting.</p></div></div><button className="text-link" onClick={onTerminal}>Open command guide →</button></article><article className="module-card note-card"><div className="card-kicker">PRACTICE PRINCIPLE</div><blockquote>“Permission and scope are the first tools in every responsible security assessment.”</blockquote><span>CYBERFORGE FIELD NOTE 01</span></article></section></>; }

function Terminal({ entries, command, lab, completionHint, onCommandChange, onSubmit, onKeyDown, onModeChange }: { entries: TerminalEntry[]; command: string; lab: LabState; completionHint: string; onCommandChange: (value: string) => void; onSubmit: (event: FormEvent) => void; onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void; onModeChange: (mode: LabMode) => void }) { const terminalEnd = useRef<HTMLDivElement>(null); useEffect(() => { terminalEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [entries]); const quick = ["missions", "help beginner", "termux-guide", "mission 1", "ls logs", "kali-tools"]; return <section className="terminal-layout"><div className="section-heading"><div><p className="eyebrow"><span className="live-dot" />SAFE EXECUTION ENVIRONMENT</p><h1>Practice terminal</h1><p>Use a realistic Termux-style or Kali-style command workflow against a protected virtual filesystem. Nothing runs on your phone or outside this page.</p></div><span className="lab-badge">◈ OUTBOUND BLOCKED</span></div><div className="terminal-console-meta"><div><b>ENVIRONMENT</b><span>{lab.mode === "termux" ? "TERMUX MOBILE SHELL" : "KALI LAB SHELL"}</span><small>{displayPath(lab.cwd)} · MISSION {lab.mission}</small></div><div className="mode-switch" aria-label="Practice environment style"><button className={lab.mode === "termux" ? "selected" : ""} onClick={() => onModeChange("termux")}>TERMUX</button><button className={lab.mode === "kali" ? "selected" : ""} onClick={() => onModeChange("kali")}>KALI</button></div></div><div className="terminal-frame"><div className="terminal-top"><div><i /><i /><i /></div><span>{lab.mode === "termux" ? "u0_a417@localhost" : "forge@kali-lab"} — authorized-lab</span><small>SIMULATED · SAFE</small></div><div className="terminal-body" aria-live="polite">{entries.map((item, index) => <pre key={`${item.text}-${index}`} className={`${item.type}${item.tone && item.tone !== "default" ? ` ${item.tone}` : ""}`}>{item.text}</pre>)}<form onSubmit={onSubmit} className="terminal-form"><label htmlFor="command">{prompt(lab)}</label><input id="command" autoFocus autoComplete="off" spellCheck="false" value={command} onChange={(event) => onCommandChange(event.target.value)} onKeyDown={onKeyDown} placeholder="type help" aria-describedby="terminal-shortcut-note" /><button type="submit">run</button></form><div ref={terminalEnd} /></div></div><div className="terminal-shortcuts"><div>{quick.map((item) => <button key={item} onClick={() => onCommandChange(item)}>{item}</button>)}</div><p id="terminal-shortcut-note">{completionHint}</p></div></section>; }

function Learning({ completed, onToggle, onOpenLab }: { completed: string[]; onToggle: (id: string) => void; onOpenLab: (id: string) => void }) { return <section><div className="section-heading"><div><p className="eyebrow">CURRICULUM</p><h1>Learning paths</h1><p>Build from mobile shell basics through professional scope, evidence, hardening, and reporting practices. Every exercise remains inside an authorized learning boundary.</p></div></div><div className="learning-grid">{lessons.map((lesson, index) => <article className={`learning-card ${lesson.tone}`} key={lesson.id}><div className="lesson-index">{String(index + 1).padStart(2, "0")}</div><span>{lesson.level}</span><h2>{lesson.title}</h2><p>{lesson.description}</p><footer><small>{lesson.duration}</small><div><button className="text-link" onClick={() => onOpenLab(lesson.id)}>Open safe lab →</button><button className={completed.includes(lesson.id) ? "done" : ""} onClick={() => onToggle(lesson.id)}>{completed.includes(lesson.id) ? "Completed ✓" : "Mark complete"}</button></div></footer></article>)}</div></section>; }

function StudyLibrary({ selectedPage, onSelectPage }: { selectedPage: number; onSelectPage: (page: number) => void }) {
  const [query, setQuery] = useState("");
  const [activeVolume, setActiveVolume] = useState(studyPages.find((page) => page.number === selectedPage)?.volume.id || studyVolumes[0].id);
  const normalized = query.trim().toLowerCase();
  const filtered = normalized ? studyPages.filter((page) => `${page.volume.title} ${page.topic.title} ${page.topic.note} ${page.topic.practice}`.toLowerCase().includes(normalized)) : studyPages.filter((page) => page.volume.id === activeVolume);
  const page = studyPages.find((item) => item.number === selectedPage) || studyPages[0];
  const pageIndex = studyPages.findIndex((item) => item.number === page.number);
  const select = (number: number) => { const next = studyPages.find((item) => item.number === number); if (next) setActiveVolume(next.volume.id); onSelectPage(number); };
  const selectVolume = (id: string) => { setQuery(""); setActiveVolume(id); select(studyPages.find((item) => item.volume.id === id)?.number || 1); };
  return <section className="study-library"><div className="section-heading"><div><p className="eyebrow">FIELD NOTE ARCHIVE · 200 PAGES</p><h1>Study library</h1><p>A structured handwritten-notes reference from first principles to professional reporting. The material is original, browser-local, and designed for legal, defensive learning.</p></div><span className="lab-badge">◈ {studyPages.length} SAFE NOTES</span></div><div className="library-shell"><aside className="library-index"><div className="library-index-head"><span>CYBERFORGE NOTEBOOKS</span><b>10 VOLUMES</b></div><label className="library-search" htmlFor="study-search"><span>⌕</span><input id="study-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 200 pages" /></label><div className="volume-list">{studyVolumes.map((volume, index) => <button key={volume.id} className={`volume-button ${activeVolume === volume.id && !query ? "active" : ""}`} onClick={() => selectVolume(volume.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{volume.title}</b><small>20 field notes</small></div><i>→</i></button>)}</div><p className="library-source-note">Built from original notes guided by Kali, Termux, and OWASP reference material. Read <code>STUDY_SOURCES.md</code> in the project archive for links.</p></aside><div className="library-reader"><div className="reader-topline"><div><span>{page.volume.code} · {page.volume.title.toUpperCase()}</span><b>PAGE {String(page.number).padStart(3, "0")} / {studyPages.length}</b></div><div className="reader-arrows"><button onClick={() => select(Math.max(1, page.number - 1))} disabled={pageIndex === 0} aria-label="Previous study note">←</button><button onClick={() => select(Math.min(studyPages.length, page.number + 1))} disabled={pageIndex === studyPages.length - 1} aria-label="Next study note">→</button></div></div><div className="library-page-list"><p>{query ? `${filtered.length} search result${filtered.length === 1 ? "" : "s"}` : `${page.volume.title} · 20 notes`}</p><div>{filtered.map((item) => <button key={item.number} className={item.number === page.number ? "selected" : ""} onClick={() => select(item.number)}><span>{String(item.number).padStart(3, "0")}</span>{item.topic.title}</button>)}</div></div><article className={`notebook-page ${page.volume.accent}`}><div className="paper-punches"><i /><i /><i /></div><header><p>{page.volume.code} · NOTE {String(((page.number - 1) % 20) + 1).padStart(2, "0")}</p><span>AUTHORIZED STUDY ONLY</span></header><h2>{page.topic.title}</h2><p className="handwritten">“{page.topic.note}”</p><div className="notebook-rule" /><section><h3>Core note</h3><p>{page.volume.description} {page.note}</p></section><section><h3>Lawful use</h3><p>{page.volume.lawfulUse}</p></section><section><h3>Safe practice prompt</h3><p>{page.topic.practice}</p></section><section className="boundary-note"><h3>Boundary to remember</h3><p>{page.volume.boundary}</p></section><footer><span>REFLECTION · What evidence would you need before acting on this idea?</span><b>CYBERFORGE / {String(page.number).padStart(3, "0")}</b></footer></article></div></div></section>;
}

function Tools({ hashInput, setHashInput, hashOutput, doHash, password, setPassword, passwordStatus, urlInput, setUrlInput, urlResult, inspectUrl }: { hashInput: string; setHashInput: (v: string) => void; hashOutput: string; doHash: () => void; password: string; setPassword: (v: string) => void; passwordStatus: { label: string; score: number }; urlInput: string; setUrlInput: (v: string) => void; urlResult: string; inspectUrl: () => void }) { return <section><div className="section-heading"><div><p className="eyebrow">BROWSER-LOCAL UTILITIES</p><h1>Defensive tools</h1><p>These utilities process your input locally in this browser. They do not submit files, passwords, or URLs to a server.</p></div></div><div className="tool-grid"><article className="tool-card"><span className="tool-number">01</span><h2>SHA-256 text hash</h2><p>Create a repeatable integrity fingerprint for a text note or sample.</p><textarea value={hashInput} onChange={(event) => setHashInput(event.target.value)} placeholder="Paste a text sample…" /><button className="primary-btn small" onClick={doHash}>Generate hash</button>{hashOutput && <code className="result-box">{hashOutput}</code>}</article><article className="tool-card"><span className="tool-number">02</span><h2>Password hygiene check</h2><p>Evaluate the structure of a password locally. CYBERFORGE never saves it.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Test password locally" /><div className="strength"><div>{[1, 2, 3, 4, 5].map((level) => <i key={level} className={level <= passwordStatus.score ? "on" : ""} />)}</div><b>{passwordStatus.label}</b></div><small>Use a unique passphrase and a password manager for real accounts.</small></article><article className="tool-card"><span className="tool-number">03</span><h2>URL format review</h2><p>Review a URL’s visible format before opening it. This does not request or scan the site.</p><input value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="example.com" /><button className="secondary-btn" onClick={inspectUrl}>Review format</button>{urlResult && <div className="plain-result">{urlResult}</div>}</article></div></section>; }
function Knowledge() { return <section><div className="section-heading"><div><p className="eyebrow">METHOD LIBRARY</p><h1>Knowledge base</h1><p>Quick reference notes for careful, lawful security work.</p></div></div><div className="knowledge-list">{knowledge.map((item) => <article key={item.code}><span>{item.code}</span><div><h2>{item.title}</h2><p>{item.detail}</p></div><button aria-label={`Open ${item.title}`}>↗</button></article>)}</div><article className="notice"><strong>Legal use notice</strong><p>Only test systems you own, systems for which you have clear written permission, or deliberately vulnerable practice labs. CYBERFORGE does not provide tools for unauthorized access, external scanning, credential guessing, or device control.</p></article></section>; }
function Progress({ completed, completionPercent, onNavigate, onReset }: { completed: string[]; completionPercent: number; onNavigate: (tab: Tab) => void; onReset: () => void }) { return <section><div className="section-heading"><div><p className="eyebrow">LOCAL LEARNING RECORD</p><h1>Your progress</h1><p>Progress is stored in this browser only. Create no account, share no personal data.</p></div></div><div className="progress-layout"><article className="progress-hero"><div><span>CURRENT READINESS</span><strong>{completionPercent}<small>%</small></strong><p>{completed.length ? `${completed.length} of ${lessons.length} learning paths marked complete in this browser.` : "Begin your first path to start tracking progress."}</p><button className="primary-btn" onClick={() => onNavigate("learn")}>Open learning paths →</button>{completed.length > 0 && <button className="text-link" onClick={onReset}>Reset local progress</button>}</div><div className="large-ring"><span>{completionPercent}%</span></div></article><article className="progress-summary"><p className="card-kicker">PATH COMPLETION</p>{lessons.map((lesson) => <div className="progress-row" key={lesson.id}><span>{lesson.title}</span><b className={completed.includes(lesson.id) ? "complete" : ""}>{completed.includes(lesson.id) ? "COMPLETE" : "NOT STARTED"}</b></div>)}</article></div></section>; }

export default App;
