import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export interface SignPlateProps {
  tone?: "rambu" | "info";
  level?: 1 | 2;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

/** Direction-sign panel: coloured plate with a 2px white inner border inset 6px (outline, no nested div). */
export function SignPlate({ tone = "rambu", level = 1, arrow = false, className = "", children }: SignPlateProps) {
  const Tag = level === 1 ? "h1" : "h2";
  const bg = tone === "rambu" ? "bg-rambu" : "bg-info";
  return (
    <Tag
      className={`flex items-center justify-between gap-4 rounded-xl px-6 py-4 font-display font-extrabold text-white outline-2 -outline-offset-6 outline-white ${bg} ${
        level === 1 ? "text-2xl" : "text-xl"
      } ${className}`}
    >
      <span>{children}</span>
      {arrow && <ArrowRight size={32} aria-hidden="true" className="shrink-0" />}
    </Tag>
  );
}
