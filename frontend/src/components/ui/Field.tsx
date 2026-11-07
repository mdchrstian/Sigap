import { createContext, useContext } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";

interface FieldCtx {
  id?: string;
  describedBy?: string;
  invalid: boolean;
}
const Ctx = createContext<FieldCtx>({ invalid: false });

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <Ctx.Provider value={{ id: htmlFor, describedBy, invalid: !!error }}>
      <div className="flex flex-col gap-2">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-sm text-muted">
            {hint}
          </p>
        )}
        {children}
        {error && (
          <p id={errorId} className="flex items-start gap-2 text-sm font-semibold text-danger">
            <CircleAlert size={20} aria-hidden="true" className="shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </Ctx.Provider>
  );
}

const base =
  "w-full rounded-lg border bg-surface px-3 text-base text-ink placeholder:text-muted";

function useCtl(props: { id?: string }) {
  const c = useContext(Ctx);
  return {
    id: props.id ?? c.id,
    "aria-describedby": c.describedBy,
    "aria-invalid": c.invalid || undefined,
    border: c.invalid ? "border-danger" : "border-line-strong",
  };
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const { border, ...a } = useCtl(props);
  return <input {...a} {...props} id={a.id} className={`${base} ${border} h-12 ${className}`} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const { border, ...a } = useCtl(props);
  return (
    <select {...a} {...props} id={a.id} className={`${base} ${border} h-12 ${className}`}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { border, ...a } = useCtl(props);
  return <textarea {...a} {...props} id={a.id} className={`${base} ${border} min-h-24 py-3 ${className}`} />;
}
