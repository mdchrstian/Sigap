---
name: ticket
description: Turn a feature request or PRD into self-contained tickets (spec.md + eval.md) and a board, so workers never need to ask the user anything. Use when the user runs /ticket or asks to write tickets.
---

# Goal
Every ticket must be buildable by a Sonnet worker that has never seen this conversation,
reading only its own folder. Short and exact beats long and vague: workers pay tokens
for every line they read.

# Steps
1. Split the request (or PRD file) into features. One ticket = one mergeable feature,
   ideally under ~400 changed lines. Bigger: split it.
2. Map the codebase with `Explore` (Haiku), never by reading files yourself. Ask it for:
   stack, test command, dev server command, and the files each feature will touch.
3. Ask the user questions until nothing is ambiguous. Batch them: up to 4 questions per
   AskUserQuestion call, multiple-choice with your recommended option first. Do not ask
   what the code already answers.
4. For each ticket create `specs/tickets/<NN>-<slug>/` with:
   - `spec.md` from `templates/spec.md` (hard limit 80 lines)
   - `eval.md` from `templates/eval.md` (hard limit 40 lines, every check runnable)
   - `contract.md` from `templates/contract.md` only when Mode = team
5. Create or update `specs/tickets/board.md` from `templates/board.md`. New tickets start
   as `draft`. Fill Runs with `alongside` or `after:<IDs> (<reason>)`.
6. Mode: default `solo`. Use `team` only when one feature has 2+ parts that can be built
   in parallel against a fixed interface (for example API + UI). Team costs more tokens.
7. Show the user the board (`board.sh show`) and tell them to mark tickets ready with
   `.claude/scripts/board.sh set <ID> ready`.

# Rules for spec.md
- "Touch" lists exact paths. "Do not touch" lists what must stay unchanged.
- "Decisions" records every choice made with the user, so the worker never re-asks.
- No background essays, no restating the PRD. Bullets.
