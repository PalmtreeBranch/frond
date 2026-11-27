#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
let filesChecked = 0;

const ALLOWED_EXTENSIONS = new Set(['.md', '.json', '.mjs', '.sh', '.svg', '.png', '']);
const ALLOWED_URL_HOSTS = new Set([
  'github.com',
  'x.com',
  'youtube.com',
  'trustmrr.com',
  'vocasolutions.com',
  'arboristbutiken.se',
  'treenerdacademy.com',
  'isaflashcards.com',
  'apps.apple.com',
  'frondframe.io',
  'mobilaunch.io',
  'localhost',
  '127.0.0.1',
]);

// Hidden Unicode: zero-width spaces/joiners and bidi overrides (Trojan Source / prompt injection)
const HIDDEN_UNICODE_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/;

// Dangerous remote execution or exfiltration patterns
const DANGEROUS_PATTERNS = [
  { name: 'curl/wget pipe to shell', re: /\b(?:curl|wget)\b[^\n|]*\|\s*(?:ba)?sh\b/i },
  { name: 'encoded shell payload', re: /\bbase64\s+(?:-d|--decode)\b[^\n|]*\|\s*(?:ba)?sh\b/i },
  { name: 'HTML comment hiding text', re: /<!--[\s\S]*?-->/ },
  { name: 'leaked private key header', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'leaked API token shape', re: /\b(?:ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{35})\b/ },
];

// Scripts must make zero network calls and zero dynamic eval
const SCRIPT_BANNED_PATTERNS = [
  { name: 'network fetch in script', re: /\b(?:fetch\(|http\.request|https\.request|curl\s|wget\s)/ },
  { name: 'dynamic eval in script', re: /\b(?:eval\(|new Function\()/ },
];

// Required safety invariants in high-impact skills
const REQUIRED_SKILL_GUARDRAILS = [
  {
    file: 'skills/stakeholder-reply/SKILL.md',
    mustMatch: /never send without an explicit yes/i,
    reason: 'must forbid sending messages without explicit approval in the current turn',
  },
  {
    file: 'skills/stakeholder-reply/SKILL.md',
    mustMatch: /untrusted data,\s*never instructions/i,
    reason: 'must treat inbound messages as untrusted data, not instructions',
  },
  {
    file: 'skills/land-pr/SKILL.md',
    mustMatch: /never.*admin bypass/i,
    reason: 'must forbid admin bypass and disabling branch protection',
  },
  {
    file: 'skills/strongman/SKILL.md',
    mustMatch: /never bypass access controls/i,
    reason: 'must forbid bypassing access controls, permissions, or CAPTCHAs',
  },
  {
    file: 'skills/beta-testers/SKILL.md',
    mustMatch: /never touch real customer data/i,
    reason: 'must forbid testing against real customer data or paid side effects',
  },
  {
    file: 'skills/replay-customer-bug/SKILL.md',
    mustMatch: /strip all personal data/i,
    reason: 'must require stripping customer PII before creating test fixtures',
  },
  {
    file: 'skills/system-audit/SKILL.md',
    mustMatch: /strictly read-only/i,
    reason: 'must stay strictly read-only',
  },
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// 1. Ensure zero package.json / third-party npm dependencies
if (fs.existsSync(path.join(root, 'package.json')) || fs.existsSync(path.join(root, 'package-lock.json'))) {
  failures.push('Repository should remain zero-dependency (unexpected package.json found)');
}

const urlRe = /https?:\/\/([a-zA-Z0-9.-]+)(?:[:/]|$)/g;

for (const full of walk(root)) {
  const rel = path.relative(root, full);
  const ext = path.extname(full);
  const base = path.basename(full);

  // Allow LICENSE, .gitignore, .yml (CI workflow)
  if (!ALLOWED_EXTENSIONS.has(ext) && ext !== '.yml' && base !== 'LICENSE' && base !== '.gitignore') {
    failures.push(`${rel}: unexpected file extension "${ext}" (only plain text/markdown/scripts/assets allowed)`);
    continue;
  }

  if (ext === '.png') {
    if (!rel.startsWith('assets/')) {
      failures.push(`${rel}: binary image only allowed under assets/`);
      continue;
    }
    const buf = fs.readFileSync(full);
    const isPng =
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47;
    if (!isPng) {
      failures.push(`${rel}: invalid PNG file header`);
    }
    filesChecked++;
    continue;
  }

  const text = fs.readFileSync(full, 'utf8');
  filesChecked++;

  if (HIDDEN_UNICODE_RE.test(text)) {
    failures.push(`${rel}: contains hidden zero-width or bidirectional Unicode characters`);
  }

  // Skip self-regex definitions inside security-audit.mjs when scanning patterns
  if (rel !== 'scripts/security-audit.mjs') {
    for (const rule of DANGEROUS_PATTERNS) {
      if (rule.re.test(text)) {
        failures.push(`${rel}: failed safety check (${rule.name})`);
      }
    }

    if (rel.startsWith('scripts/')) {
      for (const rule of SCRIPT_BANNED_PATTERNS) {
        if (rule.re.test(text)) {
          failures.push(`${rel}: failed script isolation check (${rule.name})`);
        }
      }
    }

    for (const match of text.matchAll(urlRe)) {
      const host = match[1].toLowerCase().replace(/^www\./, '');
      if (!ALLOWED_URL_HOSTS.has(host)) {
        failures.push(`${rel}: unallowlisted external host "${host}"`);
      }
    }
  }
}

for (const check of REQUIRED_SKILL_GUARDRAILS) {
  const full = path.join(root, check.file);
  if (!fs.existsSync(full)) {
    failures.push(`${check.file}: missing required guarded skill`);
    continue;
  }
  const text = fs.readFileSync(full, 'utf8');
  if (!check.mustMatch.test(text)) {
    failures.push(`${check.file}: missing guardrail (${check.reason})`);
  }
}

if (failures.length > 0) {
  console.error('frond security audit FAILED:\n' + failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}

console.log(
  `frond security audit passed (${filesChecked} files checked, 0 hidden Unicode, 0 unallowlisted URLs, 0 external deps, ${REQUIRED_SKILL_GUARDRAILS.length}/${REQUIRED_SKILL_GUARDRAILS.length} safety guardrails verified)`
);
