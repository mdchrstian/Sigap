import { useState } from "react";
import { STATUS_MAP, type ReportStatus } from "../../lib/status";
import { ApiError } from "../../lib/api";
import { MIN_NOTE, NEXT_STATUSES, NOTE_REQUIRED, confirmText } from "./officerApi";

export default function StatusForm({
  current, masterCount, onSubmit,
}: {
  current: ReportStatus;
  masterCount: number;
  onSubmit: (status: ReportStatus, note: string) => Promise<void>;
}) {
  const options = NEXT_STATUSES[current];
  const [status, setStatus] = useState<ReportStatus | "">("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (options.length === 0) {
    return <p className="rounded bg-slate-100 p-3 font-semibold">Status final</p>;
  }

  const required = status !== "" && NOTE_REQUIRED.includes(status);
  const noteShort = required && note.trim().length < MIN_NOTE;
  const disabled = !status || noteShort || busy;

  async function confirm() {
    if (!status) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(status, note.trim());
      setStatus("");
      setNote("");
      setConfirming(false);
    } catch (e) {
      setConfirming(false);
      const d = e instanceof ApiError ? (e.data as { detail?: string } | null) : null;
      setError(d?.detail ?? "Gagal memperbarui status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => { e.preventDefault(); if (!disabled) setConfirming(true); }}
    >
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Status baru</span>
        <select className="w-full rounded border p-2" value={status}
          onChange={(e) => setStatus(e.target.value as ReportStatus)}>
          <option value="">Pilih status...</option>
          {options.map((s) => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Catatan</span>
        <textarea className="w-full rounded border p-2" rows={3} value={note}
          onChange={(e) => setNote(e.target.value)} />
      </label>
      {noteShort && (
        <p className="text-sm text-red-600">Catatan wajib minimal {MIN_NOTE} karakter.</p>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={disabled}
        className="rounded bg-[#2D6CDF] px-4 py-2 font-semibold text-white disabled:opacity-50">
        Simpan
      </button>
      {confirming && (
        <div role="dialog" aria-modal="true"
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-sm space-y-4 rounded bg-white p-5 shadow-lg">
            <p>{confirmText(masterCount)}</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-1"
                onClick={() => setConfirming(false)}>Batal</button>
              <button type="button" disabled={busy} onClick={confirm}
                className="rounded bg-[#2D6CDF] px-3 py-1 font-semibold text-white">
                Ya, ubah
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
