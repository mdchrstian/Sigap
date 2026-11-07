import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, Dialog, Textarea } from "../../components/ui";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../../lib/api";
import { deleteComment, fetchComments, fmtDateTime, postComment, type CommentItem } from "./api";

export default function Comments({ reportId }: { reportId: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CommentItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const r = await fetchComments(reportId, p);
        setItems((prev) => (p === 1 ? r.results : [...prev, ...r.results]));
        setHasNext(!!r.next);
        setPage(p);
      } catch {
        setError("Gagal memuat komentar.");
      } finally {
        setLoading(false);
      }
    },
    [reportId],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const t = body.trim();
    if (t.length < 3 || t.length > 1000) {
      setError("Komentar harus 3 sampai 1000 karakter.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await postComment(reportId, t, image);
      setBody("");
      setImage(null);
      await load(1);
    } catch (err) {
      const d = err instanceof ApiError ? (err.data as Record<string, string[]> | null) : null;
      setError(d?.body?.[0] ?? d?.image?.[0] ?? "Gagal mengirim komentar.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    try {
      await deleteComment(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Gagal menghapus komentar.");
    }
  }

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h2 className="text-lg font-bold">Informasi Tambahan</h2>
      {user ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Textarea
            aria-label="Komentar"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tambahkan informasi..."
          />
          <input
            aria-label="Foto"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <div>
            <Button type="submit" loading={busy}>Kirim komentar</Button>
          </div>
        </form>
      ) : (
        <Link to="/masuk" className="text-rambu underline">
          Masuk untuk menambahkan informasi
        </Link>
      )}
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      <ul className="flex flex-col divide-y divide-line">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 py-4 first:pt-0">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-semibold">{c.author_label}</span>
              <span className="text-sm text-muted">{fmtDateTime(c.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words">{c.body}</p>
            {c.image_url && (
              <button type="button" onClick={() => setZoom(c.image_url)} aria-label="Perbesar foto komentar"
                className="self-start rounded-lg">
                <img src={c.image_url} alt="Foto komentar" className="max-h-48 rounded-lg border border-line" />
              </button>
            )}
            {c.is_mine && (
              <div>
                <Button variant="quiet" onClick={() => remove(c.id)}>Hapus</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 && <p className="text-muted">Belum ada komentar.</p>}
      {hasNext && (
        <div>
          <Button variant="secondary" loading={loading} onClick={() => load(page + 1)}>
            Muat lebih banyak
          </Button>
        </div>
      )}
      <Dialog open={!!zoom} onClose={() => setZoom(null)} title="Foto komentar">
        {zoom && <img src={zoom} alt="Foto komentar" className="max-h-96 w-full rounded-lg object-contain" />}
      </Dialog>
    </section>
  );
}
