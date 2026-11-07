import { useState } from "react";
import { STATUS_MAP, type ReportStatus } from "../../lib/status";
import { ApiError } from "../../lib/api";
import { Button, Dialog, Field, Select, Textarea } from "../../components/ui";
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
    return <p className="rounded-lg bg-ground p-4 font-semibold">Status final</p>;
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
      className="flex flex-col gap-6"
      onSubmit={(e) => { e.preventDefault(); if (!disabled) setConfirming(true); }}
    >
      <Field label="Status baru" htmlFor="status-baru">
        <Select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
          <option value="">Pilih status...</option>
          {options.map((s) => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
        </Select>
      </Field>
      <Field label="Catatan" htmlFor="status-catatan"
        error={noteShort ? `Catatan wajib minimal ${MIN_NOTE} karakter.` : undefined}>
        <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      <Button type="submit" disabled={disabled}>Simpan</Button>
      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Konfirmasi perubahan status"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>Batal</Button>
            <Button loading={busy} onClick={confirm}>Ya, ubah</Button>
          </>
        }>
        <p>{confirmText(masterCount)}</p>
      </Dialog>
    </form>
  );
}
