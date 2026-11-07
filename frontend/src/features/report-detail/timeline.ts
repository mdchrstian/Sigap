import { createElement } from "react";
import type { MarkaStep } from "../../components/ui";
import { STATUS_MAP, type ReportStatus } from "../../lib/status";
import { fmtDateTime, type DetailReport } from "./api";

export const FLOW: ReportStatus[] = ["submitted", "under_review", "verified", "in_progress", "completed"];

/** Build MarkaRoute steps: passed history entries, the latest as current, then the remaining flow. */
export function buildTimeline(r: Pick<DetailReport, "history" | "status">): MarkaStep[] {
  const last = r.history.length - 1;
  const steps: MarkaStep[] = r.history.map((h, i) => {
    const state = i === last ? "current" : "done";
    const when = [fmtDateTime(h.created_at), h.note].filter(Boolean).join(" · ");
    const rejected = h.to_status === "rejected";
    return {
      title: rejected ? "Ditolak" : h.status_label,
      state,
      meta: rejected
        ? createElement("span", { className: "font-semibold text-danger" }, when)
        : when,
    };
  });
  if (steps.length === 0) steps.push({ title: STATUS_MAP[r.status].label, state: "current" });
  if (r.status === "rejected") return steps;
  const from = FLOW.indexOf(r.status);
  FLOW.slice(from + 1).forEach((s) =>
    steps.push({ title: STATUS_MAP[s].label, state: "upcoming" }),
  );
  return steps;
}
