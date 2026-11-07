import { useParams } from "react-router-dom";
import ReportDetailView from "../features/report-detail/ReportDetailView";

export default function ReportDetailPage() {
  const { id = "" } = useParams();
  return <ReportDetailView id={id} />;
}
