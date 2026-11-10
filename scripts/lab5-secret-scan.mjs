import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
}

const findings = [];
const seen = new Set();
function flag(location, rule) {
  const key = `${location}|${rule}`;
  if (!seen.has(key)) { seen.add(key); findings.push(`${location}: ${rule}`); }
}

function secretRules(text) {
  const rules = [];
  if (/sb_secret_[A-Za-z0-9_-]{16,}/.test(text)) rules.push("Supabase secret-key pattern");
  if (/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b|github_pat_[A-Za-z0-9_]{30,}/.test(text)) rules.push("GitHub-token pattern");
  if (/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/.test(text)) rules.push("AWS access-key pattern");
  if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(text)) rules.push("private-key header");
  for (const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) ?? []) {
    try {
      const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
      if (claims.role === "service_role") rules.push("service-role JWT");
    } catch { /* Not a decodable JWT; do not print candidate bytes. */ }
  }
  if (/process\.env\.NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY)/i.test(text)) {
    rules.push("publicly prefixed privileged environment reference");
  }
  return [...new Set(rules)];
}

// Compare sensitive local configuration values without ever printing them.
const localValues = [];
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!match) continue;
    const [, name, raw] = match;
    const value = raw.replace(/^(['"])(.*)\1$/, "$2");
    if (/SERVICE_ROLE|SECRET|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN|DATABASE_URL/i.test(name) && value.length >= 12 &&
        !/YOUR_|PLACEHOLDER|EXAMPLE|REPLACE_|<|>/i.test(value)) localValues.push(value);
    if (/^NEXT_PUBLIC_.*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY)/i.test(name)) flag("local configuration", "privileged variable has public prefix");
  }
}

function scan(text, location) {
  for (const rule of secretRules(text)) flag(location, rule);
  if (localValues.some((value) => text.includes(value))) flag(location, "matches a sensitive local configuration value");
}

function credentialPath(file) {
  return /(^|\/)\.env(?:\..+)?$/.test(file) && !/(^|\/)\.env\.example$/.test(file);
}

try {
  const head = git(["rev-parse", "HEAD"]).trim();
  const files = git(["ls-files", "-z"]).split("\0").filter(Boolean);
  for (const file of files) {
    if (credentialPath(file)) flag(file, "tracked environment file");
    if (!fs.existsSync(file) || fs.statSync(file).size > 2 * 1024 * 1024) continue;
    const bytes = fs.readFileSync(file);
    if (!bytes.includes(0)) scan(bytes.toString("utf8"), `working tree ${file}`);
  }

  const historyPaths = new Set(git(["log", "--all", "--format=", "--name-only"]).split(/\r?\n/).filter(Boolean));
  for (const file of historyPaths) if (credentialPath(file)) flag(file, "environment file appears in reachable Git history");

  // Examine additions AND deletions across all reachable refs, not just HEAD.
  const patches = git(["log", "--all", "--format=commit:%H", "--patch", "--no-ext-diff", "--no-textconv"]);
  let commit = "unknown";
  let file = "unknown";
  for (const line of patches.split(/\r?\n/)) {
    if (line.startsWith("commit:")) commit = line.slice(7, 19);
    else if (line.startsWith("diff --git ")) file = line.slice(11);
    else if ((line.startsWith("+") && !line.startsWith("+++")) || (line.startsWith("-") && !line.startsWith("---"))) {
      scan(line.slice(1), `history ${commit} ${file}`);
    }
  }

  const ignore = spawnSync("git", ["check-ignore", "-q", "--no-index", ".env.local"]);
  const ignored = ignore.status === 0;
  if (!ignored) flag(".env.local", "ignore rule not confirmed");
  const count = git(["rev-list", "--all", "--count"]).trim();
  const lines = [
    "Lab 5 secret-pattern scan and Git-history review",
    `HEAD: ${head}`,
    `Tracked paths inspected: ${files.length}`,
    `Reachable commits included (--all): ${count}`,
    `.env.local ignore rule confirmed: ${ignored}`,
    `Placeholder .env.example tracked: ${files.includes(".env.example")}`,
    `Flagged locations: ${findings.length}`,
    ...findings,
    findings.length ? "RESULT: REVIEW REQUIRED. Do not open the PR until findings are resolved." : "RESULT: No findings for the rules checked.",
    "Scope: tracked working files up to 2 MiB and all-ref textual patch history (128 MiB command limit).",
    "Rules: recognizable secret keys/tokens, private-key headers, service-role JWTs, credential-path history, public privileged variable names, and sensitive local-value matches.",
    "Limitations: pattern checks cannot prove all secrets absent; encoded, split, binary, unknown-format and unreachable-history secrets may be missed. No credential values are included in this report.",
  ];
  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(path.join("docs", "lab5-secret-scan.txt"), lines.join("\n") + "\n");
  console.log(lines.join("\n"));
  if (findings.length) process.exitCode = 1;
} catch {
  console.error("SCAN DID NOT COMPLETE. Check that Git is available and the terminal is in the repository. No passing report was generated.");
  process.exitCode = 2;
}
