#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"

link_dir() {
  local dest="$1"
  mkdir -p "$(dirname "$dest")"
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -e "$dest" ]; then
    echo "skip: $dest already exists and is not a symlink"
    return 0
  fi
  ln -s "$REPO_DIR" "$dest"
  echo "linked: $dest -> $REPO_DIR"
}

link_skills() {
  local skills_root="$1"
  mkdir -p "$skills_root"
  for skill_dir in "$REPO_DIR"/skills/*; do
    [ -d "$skill_dir" ] || continue
    local name
    name="$(basename "$skill_dir")"
    local dest="$skills_root/$name"
    if [ -L "$dest" ]; then
      rm "$dest"
    elif [ -e "$dest" ]; then
      echo "skip: $dest already exists and is not a symlink"
      continue
    fi
    ln -s "$skill_dir" "$dest"
    echo "linked skill: $dest -> $skill_dir"
  done
}

case "$TARGET" in
  antigravity)
    link_dir "$HOME/.gemini/config/plugins/frond"
    ;;
  cursor)
    link_dir "$HOME/.cursor/plugins/frond"
    ;;
  claude)
    link_skills "$HOME/.claude/skills"
    ;;
  codex)
    link_skills "$HOME/.codex/skills"
    ;;
  opencode)
    link_skills "$HOME/.config/opencode/skills"
    ;;
  copilot)
    link_skills "$HOME/.copilot/skills"
    ;;
  windsurf)
    link_skills "$HOME/.codeium/windsurf/skills"
    ;;
  gemini-cli)
    link_skills "$HOME/.gemini/skills"
    ;;
  agents)
    link_skills "$HOME/.agents/skills"
    ;;
  all)
    link_dir "$HOME/.gemini/config/plugins/frond"
    [ -d "$HOME/.cursor" ] && link_dir "$HOME/.cursor/plugins/frond" || true
    [ -d "$HOME/.claude" ] && link_skills "$HOME/.claude/skills" || true
    [ -d "$HOME/.codex" ] && link_skills "$HOME/.codex/skills" || true
    [ -d "$HOME/.config/opencode" ] && link_skills "$HOME/.config/opencode/skills" || true
    [ -d "$HOME/.copilot" ] && link_skills "$HOME/.copilot/skills" || true
    [ -d "$HOME/.codeium/windsurf" ] && link_skills "$HOME/.codeium/windsurf/skills" || true
    [ -d "$HOME/.gemini" ] && link_skills "$HOME/.gemini/skills" || true
    [ -d "$HOME/.agents" ] && link_skills "$HOME/.agents/skills" || true
    ;;
  *)
    echo "Usage: $0 [all|antigravity|cursor|claude|codex|opencode|copilot|windsurf|gemini-cli|agents]" >&2
    exit 1
    ;;
esac
