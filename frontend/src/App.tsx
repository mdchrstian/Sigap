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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/peta" element={<ExploreMapPage />} />
        <Route path="/lapor" element={<CreateReportPage />} />
        <Route path="/laporan-saya" element={<MyReportsPage />} />
        <Route path="/laporan/:id" element={<ReportDetailPage />} />
        <Route path="/masuk" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/notifikasi" element={<NotificationsPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/petugas" element={<OfficerDashboardPage />} />
        <Route path="/petugas/laporan/:id" element={<OfficerReportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
