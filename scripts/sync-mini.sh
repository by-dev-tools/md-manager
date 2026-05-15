#!/usr/bin/env bash
# Re-sync Mini's "track closely" files. Fork-and-own files are not touched.
#
# SAFETY: Mini's upstream update.sh uses `rsync --delete` on .claude/skills/,
# which would clobber this project's local skills (link, ship, staff-review,
# accessibility-review, security-review). We snapshot project-owned skills
# into a temp dir before the sync and restore them afterwards. Update the
# PROJECT_SKILLS list whenever a new project-owned skill is added.
#
# Configure MINI_PATH below if you move Mini somewhere else.

set -euo pipefail

PROJECT_SKILLS=(
  link
  ship
  staff-review
  accessibility-review
  security-review
)

MINI_PATH="${MINI_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && grep -oE '^\- \*\*Source:\*\* .+$' packages/ui/MINI-VERSION.md 2>/dev/null | awk '{print $NF}' || echo '')}"
if [[ -z "${MINI_PATH}" || ! -d "${MINI_PATH}" ]]; then
  echo "Set MINI_PATH to the mini-design-system checkout path." >&2
  exit 2
fi

DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$DEST/.claude/skills"
BACKUP_DIR="$(mktemp -d -t mini-sync-skills.XXXXXX)"

cleanup() {
  rm -rf "$BACKUP_DIR"
}
trap cleanup EXIT

echo "→ snapshotting project-owned skills to $BACKUP_DIR"
for skill in "${PROJECT_SKILLS[@]}"; do
  if [[ -d "$SKILLS_DIR/$skill" ]]; then
    cp -R "$SKILLS_DIR/$skill" "$BACKUP_DIR/"
  fi
done

"$MINI_PATH/tools/sync/update.sh" "$DEST" "$@"

echo "→ restoring project-owned skills"
for skill in "${PROJECT_SKILLS[@]}"; do
  if [[ -d "$BACKUP_DIR/$skill" ]]; then
    rm -rf "$SKILLS_DIR/$skill"
    cp -R "$BACKUP_DIR/$skill" "$SKILLS_DIR/"
  fi
done

echo "✅ Mini sync complete; project skills preserved."
