import { STATUS_MAP, type ReportStatus } from "../../lib/status";
import { REGENCIES, type MapFilters } from "./mapApi";

export interface Cat { id: number; slug: string; name: string }

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export default function FilterPanel({
  filters, onChange, categories,
}: { filters: MapFilters; onChange: (f: MapFilters) => void; categories: Cat[] }) {
  return (
    <div className="space-y-4 text-sm">
      <fieldset>
        <legend className="mb-1 font-semibold">Kategori</legend>
        {categories.map((c) => (
          <label key={c.slug} className="mr-3 inline-flex items-center gap-1">
            <input type="checkbox" checked={filters.category.includes(c.slug)}
              onChange={() => onChange({ ...filters, category: toggle(filters.category, c.slug) })} />
            {c.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-1 font-semibold">Status</legend>
        {(Object.keys(STATUS_MAP) as ReportStatus[]).map((s) => (
          <label key={s} className="mr-3 inline-flex items-center gap-1">
            <input type="checkbox" checked={filters.status.includes(s)}
              onChange={() => onChange({ ...filters, status: toggle(filters.status, s) })} />
            {STATUS_MAP[s].label}
          </label>
        ))}
      </fieldset>
      <label className="block">
        <span className="mb-1 block font-semibold">Kabupaten/Kota</span>
        <select className="w-full rounded border p-1" value={filters.regency}
          onChange={(e) => onChange({ ...filters, regency: e.target.value })}>
          <option value="">Semua</option>
          {REGENCIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">Periode</span>
        <select className="w-full rounded border p-1" value={filters.days}
          onChange={(e) => onChange({ ...filters, days: Number(e.target.value) })}>
          <option value={0}>Semua</option>
          <option value={7}>7 hari</option>
          <option value={30}>30 hari</option>
          <option value={90}>90 hari</option>
        </select>
      </label>
      <div>
        <div className="mb-1 font-semibold">Legenda</div>
        <ul className="space-y-1">
          {(Object.keys(STATUS_MAP) as ReportStatus[]).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: STATUS_MAP[s].color }} />
              {STATUS_MAP[s].label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
