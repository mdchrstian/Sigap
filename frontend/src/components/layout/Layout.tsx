import { Outlet, useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import Footer from "./Footer";
import { ToastProvider } from "../ui";

export default function Layout() {
  const { pathname } = useLocation();
  const bleed = pathname === "/";
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <TopNav />
        <main className={bleed ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-12"}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
