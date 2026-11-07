import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegencySigns({ items }: { items: { regency: string; count: number }[] }) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  return (
    <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
      {sorted.map((r) => (
        <li key={r.regency}>
          <Link
            to={`/peta?regency=${encodeURIComponent(r.regency)}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-rambu px-6 py-4 text-white outline-2 -outline-offset-6 outline-white hover:bg-rambu-dark"
          >
            <span className="font-display text-lg font-extrabold">{r.regency}</span>
            <span className="flex shrink-0 items-center gap-2 text-sm font-semibold">
              <span className="tabular-nums">{r.count}</span> laporan
              <ArrowRight size={20} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
