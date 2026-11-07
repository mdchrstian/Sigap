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
    <Link to="/notifikasi" aria-label="Notifikasi" className="relative rounded-md p-2 hover:bg-primary-light">
      <Bell size={20} />
      {text && (
        <span data-testid="unread-badge" className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-red-600 px-1 text-center text-xs font-semibold text-white">
          {text}
        </span>
      )}
    </Link>
  );
}
