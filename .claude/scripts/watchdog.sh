#!/usr/bin/env bash
# Zero-token watchdog. Replaces the LLM watchdog from the original setup.
# Prints one line per anomaly, nothing while healthy. Run via the Monitor tool:
#   .claude/scripts/watchdog.sh --loop
#   STALE <ID>  running ticket whose worktree has no file change for STALE_MIN minutes
#   LONG  <ID>  running ticket older than LONG_MIN minutes
STALE_MIN=${STALE_MIN:-15}
LONG_MIN=${LONG_MIN:-45}
INTERVAL=${INTERVAL:-600}
BOARD=${BOARD:-specs/tickets/board.md}

worktree_of() {  # $1 = ticket folder; finds worktree on branch ticket/<folder>[-part]
  git worktree list --porcelain | awk -v b="refs/heads/ticket/$1" '
    /^worktree / { p = $2 }
    /^branch /   { if (index($2, b) == 1) print p }'
}

check() {
  local now id t s started age wt
  now=$(date +%s)
  while IFS=$'\t' read -r id t s _ _ _ started; do
    [[ $s == running && $started =~ ^[0-9]+$ ]] || continue
    age=$(( (now - started) / 60 ))
    (( age >= LONG_MIN )) && echo "LONG $id (${age}m)"
    (( age < 5 )) && continue
    wt=$(worktree_of "$t")
    if [[ -z $wt ]]; then echo "STALE $id (no worktree on ticket/$t)"; continue; fi
    while read -r w; do
      [[ -n $(find "$w" -path "$w/.git" -prune -o -path '*/node_modules' -prune \
              -o -type f -mmin "-$STALE_MIN" -print -quit 2>/dev/null) ]] && continue 2
    done <<< "$wt"
    echo "STALE $id (no change ${STALE_MIN}m)"
  done < <(awk -F'|' '/^\| *[0-9]/ {
             for (i = 2; i <= 8; i++) gsub(/^ +| +$/, "", $i)
             print $2 "\t" $3 "\t" $4 "\t" $5 "\t" $6 "\t" $7 "\t" $8 }' "$BOARD")
}

if [[ ${1:-} == --loop ]]; then
  while true; do check; sleep "$INTERVAL"; done
else
  check
fi
