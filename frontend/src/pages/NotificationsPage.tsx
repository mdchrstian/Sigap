import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui";
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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Notifikasi</h1>
        {unread > 0 && (
          <Button variant="quiet" onClick={all}>Tandai semua dibaca</Button>
        )}
      </div>
      {q.isLoading ? <p>Memuat...</p> : <NotificationList items={items} onChanged={refresh} />}
      {q.hasNextPage && (
        <div>
          <Button variant="secondary" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
            Muat lebih banyak
          </Button>
        </div>
      )}
    </div>
  );
}
