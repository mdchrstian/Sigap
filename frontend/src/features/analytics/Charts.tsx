import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const EMPTY_TEXT = "Belum ada data untuk ditampilkan.";

export function CategoryBar({ data }: { data: { name: string; count: number }[] }) {
  const empty = data.every((d) => d.count === 0);
  return (
    <figure className="m-0 rounded border bg-white p-3">
      <figcaption className="mb-2 font-semibold">Laporan per kategori</figcaption>
      {empty ? (
        <p className="text-sm text-slate-600">{EMPTY_TEXT}</p>
      ) : (
        <div role="img" aria-label="Diagram batang jumlah laporan per kategori" className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }}
                label={{ value: "Kategori", position: "insideBottom", offset: -16 }} />
              <YAxis allowDecimals={false}
                label={{ value: "Jumlah laporan", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="count" name="Laporan" fill="#176B5B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </figure>
  );
}

export function WeekLine({ data }: { data: { week_start: string; count: number }[] }) {
  return (
    <figure className="m-0 rounded border bg-white p-3">
      <figcaption className="mb-2 font-semibold">Laporan per minggu</figcaption>
      {data.length === 0 ? (
        <p className="text-sm text-slate-600">{EMPTY_TEXT}</p>
      ) : (
        <div role="img" aria-label="Diagram garis jumlah laporan per minggu" className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week_start" tick={{ fontSize: 10 }}
                label={{ value: "Awal minggu", position: "insideBottom", offset: -16 }} />
              <YAxis allowDecimals={false}
                label={{ value: "Jumlah laporan", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Laporan" stroke="#2D6CDF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </figure>
  );
}
