import { useNavigate } from "react-router-dom";
import { BellOff } from "lucide-react";
import { Button, EmptyState } from "../../components/ui";
import { markRead, relativeTime, type NotificationItem } from "./notificationsApi";

export default function NotificationList({
  items,
  onChanged,
}: {
  items: NotificationItem[];
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  if (items.length === 0) return <EmptyState icon={BellOff} title="Belum ada notifikasi." />;

  const open = async (n: NotificationItem) => {
    if (!n.is_read) await markRead(n.id);
    onChanged();
    if (n.report_id != null) navigate(`/laporan/${n.report_id}`);
  };
  const read = async (n: NotificationItem) => {
    await markRead(n.id);
    onChanged();
  };

  const weight = (n: NotificationItem) => (n.is_read ? "font-normal" : "font-semibold");

  const content = (n: NotificationItem) => (
    <>
      <div className="break-words">{n.title}</div>
      <div className="break-words text-sm font-normal text-muted">{n.body}</div>
      <div className="text-xs font-normal text-muted">{relativeTime(n.created_at)}</div>
    </>
  );

  return (
    <ul className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
      {items.map((n) => (
        <li key={n.id} className="flex items-start gap-3 p-4">
          <span
            aria-hidden="true"
            data-testid={n.is_read ? undefined : "unread-dot"}
            className={`mt-2 size-3 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-rambu"}`}
          />
          {n.report_id != null ? (
            <button type="button" onClick={() => open(n)} className={`min-w-0 flex-1 text-left ${weight(n)}`}>
              {content(n)}
            </button>
          ) : (
            <div className={`min-w-0 flex-1 ${weight(n)}`}>
              {content(n)}
              {!n.is_read && (
                <Button variant="quiet" onClick={() => read(n)}>Tandai dibaca</Button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
