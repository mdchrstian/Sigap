import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

export interface MarkaStep {
  title: string;
  description?: string;
  state: "done" | "current" | "upcoming";
  meta?: ReactNode;
}

export interface MarkaRouteProps {
  steps: MarkaStep[];
  animate?: boolean;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function MarkaRoute({ steps, animate = false }: MarkaRouteProps) {
  const maskId = `marka-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<HTMLOListElement>(null);
  const shouldAnimate = animate && !prefersReducedMotion() && typeof IntersectionObserver !== "undefined";
  const [drawn, setDrawn] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate || !ref.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setDrawn(true);
        io.disconnect();
      }
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shouldAnimate]);

  return (
    <ol ref={ref} className="relative m-0 flex list-none flex-col gap-8 p-0">
      <svg className="absolute left-0 top-0 h-full w-8" aria-hidden="true" focusable="false">
        <defs>
          <mask id={maskId}>
            <line
              x1="16"
              x2="16"
              y1="0"
              y2="100%"
              stroke="white"
              strokeWidth="8"
              pathLength={1}
              strokeDasharray="1"
              style={{
                strokeDashoffset: drawn ? 0 : 1,
                transition: shouldAnimate ? "stroke-dashoffset 600ms ease-out" : "none",
              }}
            />
          </mask>
        </defs>
        <line x1="16" x2="16" y1="0" y2="100%" className="stroke-line" strokeWidth="4" />
        <g mask={`url(#${maskId})`}>
          <line
            x1="16"
            x2="16"
            y1="0"
            y2="100%"
            className="stroke-marka"
            strokeWidth="4"
            strokeDasharray="8 8"
          />
        </g>
      </svg>
      {steps.map((s, i) => (
        <li
          key={i}
          className="relative pl-12"
          aria-current={s.state === "current" ? "step" : undefined}
        >
          <span
            className={`absolute left-1 top-1 flex size-6 items-center justify-center rounded-full ${
              s.state === "done"
                ? "bg-rambu text-white"
                : s.state === "current"
                  ? "border-2 border-ink bg-marka"
                  : "border-2 border-line-strong bg-surface"
            }`}
            aria-hidden="true"
          >
            {s.state === "done" && <Check size={16} />}
          </span>
          <p className={`text-base font-semibold ${s.state === "upcoming" ? "text-muted" : "text-ink"}`}>
            {s.title}
          </p>
          {s.description && <p className="text-sm text-muted">{s.description}</p>}
          {s.meta && <div className="text-xs text-muted">{s.meta}</div>}
        </li>
      ))}
    </ol>
  );
}
