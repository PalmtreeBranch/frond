#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function checkJson(relPath, requiredKeys) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) {
    errors.push(`Missing manifest: ${relPath}`);
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    for (const key of requiredKeys) {
      if (!data[key]) errors.push(`${relPath}: missing required key "${key}"`);
    }
    return data;
  } catch (err) {
    errors.push(`${relPath}: invalid JSON (${err.message})`);
    return null;
  }
}

const agyManifest = checkJson('plugin.json', ['name', 'description']);
if (agyManifest) {
  const allowed = new Set([
    'name',
    'displayName',
    'version',
    'description',
    'logo',
    'suggestedPrompts',
    'author',
    'homepage',
    'repository',
    'disabled',
  ]);
  for (const key of Object.keys(agyManifest)) {
    if (!allowed.has(key)) {
      errors.push(`plugin.json: unsupported top-level key "${key}"`);
    }
  }
  if (agyManifest.logo && !fs.existsSync(path.join(root, agyManifest.logo))) {
    errors.push(`plugin.json: logo path does not exist (${agyManifest.logo})`);
  }
}

checkJson('.cursor-plugin/plugin.json', ['name', 'description', 'skills']);
checkJson('.claude-plugin/plugin.json', ['name', 'description', 'skills']);

const skillsDir = path.join(root, 'skills');
const skillFolders = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (skillFolders.length === 0) {
  errors.push('No skills found under skills/');
}

const linkRe = /\]\((\.\.?\/[^)#\s]+)\)/g;

for (const folder of skillFolders) {
  const skillPath = path.join(skillsDir, folder, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    errors.push(`skills/${folder}: missing SKILL.md`);
    continue;
  }
  const text = fs.readFileSync(skillPath, 'utf8');
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    errors.push(`skills/${folder}/SKILL.md: missing YAML frontmatter`);
    continue;
  }
  const fm = fmMatch[1];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  if (!nameMatch) {
    errors.push(`skills/${folder}/SKILL.md: missing frontmatter "name"`);
  } else if (nameMatch[1].trim().replace(/^["']|["']$/g, '') !== folder) {
    errors.push(
      `skills/${folder}/SKILL.md: name "${nameMatch[1].trim()}" does not match folder "${folder}"`
    );
  }
  if (!descMatch) {
    errors.push(`skills/${folder}/SKILL.md: missing frontmatter "description"`);
  }

  for (const match of text.matchAll(linkRe)) {
    const target = path.resolve(path.dirname(skillPath), match[1]);
    if (!fs.existsSync(target)) {
      errors.push(`skills/${folder}/SKILL.md: broken relative link "${match[1]}"`);
    }
  }
}

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
for (const match of readme.matchAll(linkRe)) {
  const target = path.resolve(root, match[1]);
  if (!fs.existsSync(target)) {
    errors.push(`README.md: broken relative link "${match[1]}"`);
  }
}

if (errors.length > 0) {
  console.error('frond validation failed:\n' + errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}

console.log(`frond validation passed (${skillFolders.length} skills: ${skillFolders.join(', ')})`);
