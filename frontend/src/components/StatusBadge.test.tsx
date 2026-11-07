import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

it("renders label", () => {
  render(<StatusBadge status="in_progress" />);
  expect(screen.getByText("Dalam Pengerjaan")).toBeInTheDocument();
});
