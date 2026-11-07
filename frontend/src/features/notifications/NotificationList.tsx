import { useNavigate } from "react-router-dom";
import { markRead, relativeTime, type NotificationItem } from "./notificationsApi";

export default function NotificationList({
  items,
  onChanged,
}: {
  items: NotificationItem[];
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  if (items.length === 0) return <p className="text-slate-500">Belum ada notifikasi.</p>;

  const open = async (n: NotificationItem) => {
    if (!n.is_read) await markRead(n.id);
    onChanged();
    if (n.report_id != null) navigate(`/laporan/${n.report_id}`);
  };
  const read = async (n: NotificationItem) => {
    await markRead(n.id);
    onChanged();
  };

  const content = (n: NotificationItem) => (
    <>
      <div>{n.title}</div>
      <div className="text-sm font-normal text-slate-600">{n.body}</div>
      <div className="text-xs font-normal text-slate-500">{relativeTime(n.created_at)}</div>
    </>
  );

  return (
    <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {items.map((n) => (
        <li key={n.id} className="flex items-start gap-2 px-4 py-3">
          <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-primary"}`} />
          {n.report_id != null ? (
            <button type="button" onClick={() => open(n)} className={`flex-1 text-left ${n.is_read ? "" : "font-bold"}`}>
              {content(n)}
            </button>
          ) : (
            <div className={`flex-1 ${n.is_read ? "" : "font-bold"}`}>
              {content(n)}
              {!n.is_read && (
                <button type="button" onClick={() => read(n)} className="text-xs font-normal text-primary underline">
                  Tandai dibaca
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
