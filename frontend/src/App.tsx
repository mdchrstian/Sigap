import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ExploreMapPage from "./pages/ExploreMapPage";
import CreateReportPage from "./pages/CreateReportPage";
import MyReportsPage from "./pages/MyReportsPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import OfficerDashboardPage from "./pages/OfficerDashboardPage";
import OfficerReportPage from "./pages/OfficerReportPage";
import NotFoundPage from "./pages/NotFoundPage";
import RequireAuth from "./features/auth/RequireAuth";
import RequireRole from "./features/auth/RequireRole";

const auth = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;
const staff = (el: ReactNode) => (
  <RequireAuth>
    <RequireRole roles={["officer", "admin"]}>{el}</RequireRole>
  </RequireAuth>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/peta" element={<ExploreMapPage />} />
        <Route path="/lapor" element={auth(<CreateReportPage />)} />
        <Route path="/laporan-saya" element={auth(<MyReportsPage />)} />
        <Route path="/laporan/:id" element={<ReportDetailPage />} />
        <Route path="/masuk" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/notifikasi" element={auth(<NotificationsPage />)} />
        <Route path="/profil" element={auth(<ProfilePage />)} />
        <Route path="/petugas" element={staff(<OfficerDashboardPage />)} />
        <Route path="/petugas/laporan/:id" element={staff(<OfficerReportPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
