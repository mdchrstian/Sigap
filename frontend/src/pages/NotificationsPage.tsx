import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import NotificationList from "../features/notifications/NotificationList";
import { UNREAD_KEY } from "../features/notifications/NotificationBell";
import { fetchNotifications, markAllRead } from "../features/notifications/notificationsApi";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const q = useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.next ? all.length + 1 : undefined),
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: UNREAD_KEY });
    qc.invalidateQueries({ queryKey: ["notifications", "list"] });
  };
  const items = q.data?.pages.flatMap((p) => p.results) ?? [];
  const unread = q.data?.pages[0]?.unread_count ?? 0;
  const all = async () => {
    await markAllRead();
    refresh();
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        {unread > 0 && (
          <button className="text-sm text-primary underline" onClick={all}>Tandai semua dibaca</button>
        )}
      </div>
      {q.isLoading ? <p>Memuat...</p> : <NotificationList items={items} onChanged={refresh} />}
      {q.hasNextPage && (
        <button className="rounded-md border px-4 py-2 text-sm" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
          Muat lebih banyak
        </button>
      )}
    </div>
  );
}
