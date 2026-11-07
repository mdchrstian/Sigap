import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Panel, EmptyState } from "../../components/ui";
import { ChartColumn } from "lucide-react";
import { STATUS_MAP } from "../../lib/status";

export const EMPTY_TEXT = "Belum ada data untuk ditampilkan.";

// DESIGN.md category list: rambu, info, in_progress amber, aspal, verified green, muted.
const CATEGORY_COLORS = [
  "var(--color-rambu)", "var(--color-info)", STATUS_MAP.in_progress.color,
  "var(--color-aspal)", STATUS_MAP.verified.color, "var(--color-muted)",
];

const FONT = "'Atkinson Hyperlegible Next', sans-serif";
const AXIS = { fill: "var(--color-muted)", fontSize: 14, fontFamily: FONT };
const TOOLTIP_STYLE = {
  background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 8,
  boxShadow: "0 8px 24px rgb(27 36 32 / .16)", fontFamily: FONT, color: "var(--color-ink)",
  fontVariantNumeric: "tabular-nums",
};

export function CategoryBar({ data }: { data: { name: string; count: number }[] }) {
  const empty = data.every((d) => d.count === 0);
  return (
    <Panel as="figure" className="m-0 flex flex-col gap-4">
      <figcaption className="text-lg font-bold">Laporan per kategori</figcaption>
      {empty ? (
        <EmptyState icon={ChartColumn} title={EMPTY_TEXT} />
      ) : (
        <div role="img" aria-label="Diagram batang jumlah laporan per kategori" className="h-64 w-full tabular-nums">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 24, left: 8 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="name" interval={0} tick={AXIS} stroke="var(--color-line-strong)"
                angle={-30} textAnchor="end" height={96}
                label={{ value: "Kategori", position: "insideBottom", offset: -16, style: AXIS }} />
              <YAxis allowDecimals={false} tick={AXIS} stroke="var(--color-line-strong)"
                label={{ value: "Jumlah laporan", angle: -90, position: "insideLeft", style: AXIS }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--color-ground)" }} />
              <Bar dataKey="count" name="Laporan">
                {data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

export function WeekLine({ data }: { data: { week_start: string; count: number }[] }) {
  return (
    <Panel as="figure" className="m-0 flex flex-col gap-4">
      <figcaption className="text-lg font-bold">Laporan per minggu</figcaption>
      {data.length === 0 ? (
        <EmptyState icon={ChartColumn} title={EMPTY_TEXT} />
      ) : (
        <div role="img" aria-label="Diagram garis jumlah laporan per minggu" className="h-64 w-full tabular-nums">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ bottom: 24, left: 8 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="week_start" tick={AXIS} stroke="var(--color-line-strong)"
                label={{ value: "Awal minggu", position: "insideBottom", offset: -16, style: AXIS }} />
              <YAxis allowDecimals={false} tick={AXIS} stroke="var(--color-line-strong)"
                label={{ value: "Jumlah laporan", angle: -90, position: "insideLeft", style: AXIS }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="count" name="Laporan" stroke="var(--color-info)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
