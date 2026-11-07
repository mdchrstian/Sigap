import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Informasi Tambahan</h2>
      {user ? (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <textarea
            aria-label="Komentar"
            className="w-full rounded border p-2"
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
          <button disabled={busy} className="rounded bg-[#2D6CDF] px-4 py-2 text-white disabled:opacity-50">
            Kirim
          </button>
        </form>
      ) : (
        <Link to="/masuk" className="mt-3 inline-block text-[#2D6CDF] underline">
          Masuk untuk menambahkan informasi
        </Link>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-4 space-y-3">
        {items.map((c) => (
          <li key={c.id} className="rounded border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{c.author_label}</span>
              <span>{fmtDateTime(c.created_at)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
            {c.image_url && (
              <img src={c.image_url} alt="Foto komentar" className="mt-2 max-h-48 rounded" />
            )}
            {c.is_mine && (
              <button onClick={() => remove(c.id)} className="mt-2 text-sm text-red-600 underline">
                Hapus
              </button>
            )}
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 && <p className="mt-3 text-slate-500">Belum ada komentar.</p>}
      {hasNext && (
        <button
          disabled={loading}
          onClick={() => load(page + 1)}
          className="mt-3 rounded border px-4 py-2"
        >
          Muat lebih banyak
        </button>
      )}
    </section>
  );
}
