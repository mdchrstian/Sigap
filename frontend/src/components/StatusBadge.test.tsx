import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

it("renders label", () => {
  render(<StatusBadge status="in_progress" />);
  expect(screen.getByText("Dalam Pengerjaan")).toBeInTheDocument();
});

it("shows label and icon for all statuses", () => {
  const labels = ["Dikirim", "Ditinjau", "Terverifikasi", "Dalam Pengerjaan", "Selesai", "Ditolak"];
  const statuses = ["submitted", "under_review", "verified", "in_progress", "completed", "rejected"] as const;
  statuses.forEach((st, i) => {
    const { container, unmount } = render(<StatusBadge status={st} />);
    expect(screen.getByText(labels[i])).toBeInTheDocument();
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    unmount();
  });
});
