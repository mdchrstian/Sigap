import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import { LocateFixed, Search } from "lucide-react";
import { Button, Input } from "./ui";
import { ApiError } from "../lib/api";
import { reverseGeocode, searchPlaces, type Place, type Reverse } from "../features/create-report/api";

const TILE = (import.meta.env.VITE_TILE_URL as string | undefined)
  ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const BALI: [number, number] = [-8.4095, 115.1889];
const PIN = divIcon({
  className: "",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:var(--color-info);border:3px solid white;outline:2px solid var(--color-ink)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface Pt { lat: number; lng: number }
interface Props {
  value: Pt | null;
  onChange: (p: Pt) => void;
  onResolved?: (r: Reverse | null) => void;
}

function Clicks({ onChange }: { onChange: (p: Pt) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Fly({ to }: { to: Pt | null }) {
  const map = useMap();
  useEffect(() => {
    if (to) map.flyTo([to.lat, to.lng], Math.max(map.getZoom(), 15));
  }, [to, map]);
  return null;
}

export default function LocationPicker({ value, onChange, onResolved }: Props) {
  const [fly, setFly] = useState<Pt | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [searchMsg, setSearchMsg] = useState("");
  const [info, setInfo] = useState<Reverse | null>(null);
  const [revErr, setRevErr] = useState(false);

  const lat = value?.lat;
  const lng = value?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    let live = true;
    setRevErr(false);
    reverseGeocode({ lat, lng })
      .then((r) => { if (live) { setInfo(r); onResolved?.(r); } })
      .catch((e) => {
        if (!live) return;
        setInfo(null);
        setRevErr(!(e instanceof ApiError && e.status === 400));
        onResolved?.(null);
      });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  function pick(p: Pt, move = false) {
    onChange(p);
    if (move) setFly(p);
  }

  function locate() {
    setGeoMsg("");
    if (!navigator.geolocation) return setGeoMsg("Peramban tidak mendukung geolokasi.");
    navigator.geolocation.getCurrentPosition(
      (pos) => pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }, true),
      () => setGeoMsg("Izin lokasi ditolak. Pilih lokasi di peta."),
    );
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setSearchMsg("");
    if (q.trim().length < 3) return setSearchMsg("Ketik minimal 3 karakter.");
    try {
      const r = await searchPlaces(q.trim());
      setResults(r);
      if (!r.length) setSearchMsg("Tempat tidak ditemukan.");
    } catch {
      setResults(null);
      setSearchMsg("Pencarian tidak tersedia.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={search} className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari alamat atau tempat"
          aria-label="Cari lokasi"
          className="min-w-0 flex-1"
        />
        <Button type="submit" variant="secondary" icon={Search}>Cari</Button>
      </form>
      {searchMsg && <p className="text-sm text-muted">{searchMsg}</p>}
      {results && results.length > 0 && (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {results.map((p, i) => (
            <li key={i}>
              <button
                type="button"
                className="min-h-12 w-full px-3 py-2 text-left hover:bg-ground"
                onClick={() => { pick({ lat: p.latitude, lng: p.longitude }, true); setResults(null); }}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" icon={LocateFixed} onClick={locate} className="w-full sm:w-auto sm:self-start">
        Gunakan lokasi saya
      </Button>
      {geoMsg && <p role="alert" className="text-sm font-semibold text-danger">{geoMsg}</p>}
      <div className="h-80 overflow-hidden rounded-xl border border-line">
        <MapContainer
          center={value ? [value.lat, value.lng] : BALI}
          zoom={value ? 15 : 10}
          className="h-full w-full"
        >
          <TileLayer url={TILE} attribution="&copy; OpenStreetMap contributors" />
          <Clicks onChange={(p) => pick(p)} />
          <Fly to={fly} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={PIN}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as { getLatLng(): { lat: number; lng: number } }).getLatLng();
                  pick({ lat: ll.lat, lng: ll.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      {value && info?.in_bali && info.address && <p>Alamat: {info.address}</p>}
      {value && info && !info.in_bali && (
        <p role="alert" className="font-semibold text-danger">Lokasi harus berada di Provinsi Bali.</p>
      )}
      {revErr && <p className="rounded-lg bg-marka-soft p-3 text-ink">Alamat tidak dapat dimuat. Anda tetap dapat melanjutkan.</p>}
    </div>
  );
}
