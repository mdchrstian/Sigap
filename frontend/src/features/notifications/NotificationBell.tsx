import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { badgeText, fetchUnreadCount } from "./notificationsApi";

export const UNREAD_KEY = ["notifications", "unread-count"];

export default function NotificationBell() {
  const { data = 0 } = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const text = badgeText(data);
  return (
    <Link
      to="/notifikasi"
      aria-label={`Notifikasi, ${data} belum dibaca`}
      className="relative flex size-12 items-center justify-center rounded-lg hover:bg-line"
    >
      <Bell size={20} aria-hidden="true" />
      {text && (
        <span
          data-testid="unread-badge"
          className="absolute right-0 top-0 min-w-5 rounded-full bg-danger px-1 text-center text-xs font-semibold text-white"
        >
          {text}
        </span>
      )}
    </Link>
  );
}
