#!/usr/bin/env bash
# Board helper. The router calls this instead of reading/editing board.md itself,
# so it only ever sees a few compact lines.
#   board.sh next | set <ID> <status> | show [status] | folder <ID> | commit
set -euo pipefail
BOARD="${BOARD:-specs/tickets/board.md}"
[[ -f "$BOARD" ]] || { echo "board not found: $BOARD" >&2; exit 1; }

# Ticket rows only: lines starting with "| <digit>". Columns:
# ID | Ticket | Status | Mode | Runs | UI | Started
rows() {
  awk -F'|' '/^\| *[0-9]/ {
    for (i = 2; i <= 8; i++) gsub(/^ +| +$/, "", $i)
    print $2 "\t" $3 "\t" $4 "\t" $5 "\t" $6 "\t" $7 "\t" $8
  }' "$BOARD"
}

cmd_next() {
  local all
  all=$(rows)
  status_of() { printf '%s\n' "$all" | awk -F'\t' -v id="$1" '$1 == id { print $3; exit }'; }
  while IFS=$'\t' read -r id t s m r u _; do
    [[ $s == ready ]] || continue
    r=${r%% *}                       # "after:01 (reason)" -> "after:01"
    ok=1
    if [[ $r == after:* ]]; then
      IFS=',' read -ra deps <<< "${r#after:}"
      for d in "${deps[@]}"; do [[ $(status_of "$d") == done ]] || ok=0; done
    fi
    (( ok )) && printf '%s\t%s\t%s\tui=%s\n' "$id" "$t" "$m" "$u"
  done < <(rows)
  return 0
}

cmd_set() {
  local id=$1 new=$2 ts
  [[ $new =~ ^(draft|ready|running|done|blocked)$ ]] || { echo "bad status: $new" >&2; exit 1; }
  ts=$(date +%s)
  awk -F'|' -v OFS='|' -v id="$id" -v new="$new" -v ts="$ts" '
    /^\| *[0-9]/ {
      x = $2; gsub(/ /, "", x)
      if (x == id) { $4 = " " new " "; $8 = (new == "running") ? " " ts " " : " - " }
    }
    { print }' "$BOARD" > "$BOARD.tmp" && mv "$BOARD.tmp" "$BOARD"
  echo "$id -> $new"
}

cmd_show() {
  local f=${1:-}
  rows | awk -F'\t' -v f="$f" 'f == "" || $3 == f { printf "%-4s %-28s %-8s %-5s %s\n", $1, $2, $3, $4, $5 }'
}

cmd_folder() { rows | awk -F'\t' -v id="$1" '$1 == id { print $2 }'; }

cmd_commit() {
  git add specs >/dev/null 2>&1 || true
  git diff --cached --quiet && { echo "specs already committed"; return 0; }
  git commit -q -m "chore(specs): sync tickets and board" && echo "specs committed"
}

case "${1:-show}" in
  next)   cmd_next ;;
  set)    cmd_set "$2" "$3" ;;
  show)   cmd_show "${2:-}" ;;
  folder) cmd_folder "$2" ;;
  commit) cmd_commit ;;
  *) echo "usage: board.sh next|set <ID> <status>|show [status]|folder <ID>|commit" >&2; exit 1 ;;
esac
