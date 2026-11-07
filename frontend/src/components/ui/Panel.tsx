import type { ElementType, ReactNode } from "react";

export interface PanelProps {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

export function Panel({ as: Tag = "div", className = "", children }: PanelProps) {
  return <Tag className={`rounded-xl border border-line bg-surface p-6 ${className}`}>{children}</Tag>;
}
