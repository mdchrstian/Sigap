import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
  to?: string;
  className?: string;
  children?: ReactNode;
}

const variants = {
  primary: "bg-rambu text-white hover:bg-rambu-dark border border-transparent",
  secondary: "bg-surface text-ink border border-ink hover:bg-ground",
  quiet: "bg-transparent text-ink border border-transparent hover:bg-line",
  danger: "bg-danger text-white border border-transparent hover:opacity-90",
};

const sizes = { md: "h-12", lg: "h-14" };

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  to,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = `inline-flex ${sizes[size]} items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;
  const content = (
    <>
      {loading ? (
        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={20} aria-hidden="true" />
      )}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} aria-busy={loading || undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
