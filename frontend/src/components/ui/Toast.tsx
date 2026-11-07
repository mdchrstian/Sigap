import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

type Tone = "success" | "error";
interface Item {
  id: number;
  msg: string;
  tone: Tone;
}
type ToastFn = (msg: string, tone?: Tone) => void;

const Ctx = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((i) => i.id !== id)), []);

  const toast = useCallback<ToastFn>(
    (msg, tone = "success") => {
      const id = nextId.current++;
      setItems((l) => [...l, { id, msg, tone }]);
      timers.current.push(window.setTimeout(() => dismiss(id), 5000));
    },
    [dismiss],
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[2000] flex flex-col items-center gap-2 px-4">
        {items.map((i) => (
          <div
            key={i.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-overlay ${
              i.tone === "success" ? "bg-rambu" : "bg-danger"
            }`}
          >
            {i.tone === "success" ? (
              <CircleCheck size={20} aria-hidden="true" className="shrink-0" />
            ) : (
              <CircleAlert size={20} aria-hidden="true" className="shrink-0" />
            )}
            <span className="flex-1">{i.msg}</span>
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => dismiss(i.id)}
              className="flex size-12 shrink-0 items-center justify-center rounded-lg hover:bg-white/20"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
