import { Field, Select } from "../../components/ui";
import { STATUS_MAP, type ReportStatus } from "../../lib/status";
import { REGENCIES, type MapFilters } from "./mapApi";

export interface Cat { id: number; slug: string; name: string }

export default function FilterPanel({
  filters, onChange, categories, idp = "f",
}: { filters: MapFilters; onChange: (f: MapFilters) => void; categories: Cat[]; idp?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Status" htmlFor={`${idp}-status`}>
        <Select value={filters.status[0] ?? ""}
          onChange={(e) => onChange({ ...filters, status: e.target.value ? [e.target.value] : [] })}>
          <option value="">Semua</option>
          {(Object.keys(STATUS_MAP) as ReportStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_MAP[s].label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Kategori" htmlFor={`${idp}-category`}>
        <Select value={filters.category[0] ?? ""}
          onChange={(e) => onChange({ ...filters, category: e.target.value ? [e.target.value] : [] })}>
          <option value="">Semua</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
      </Field>
      <Field label="Kabupaten/Kota" htmlFor={`${idp}-regency`}>
        <Select value={filters.regency}
          onChange={(e) => onChange({ ...filters, regency: e.target.value })}>
          <option value="">Semua</option>
          {REGENCIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
      </Field>
      <Field label="Periode" htmlFor={`${idp}-days`}>
        <Select value={filters.days}
          onChange={(e) => onChange({ ...filters, days: Number(e.target.value) })}>
          <option value={0}>Semua</option>
          <option value={7}>7 hari</option>
          <option value={30}>30 hari</option>
          <option value={90}>90 hari</option>
        </Select>
      </Field>
      <div>
        <h2 className="mb-2 text-sm font-semibold">Legenda</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {(Object.keys(STATUS_MAP) as ReportStatus[]).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-full border-2 border-surface"
                style={{ background: STATUS_MAP[s].color }} aria-hidden="true" />
              {STATUS_MAP[s].label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
