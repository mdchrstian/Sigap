import { fireEvent, render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Button, Dialog, Field, Input, MarkaRoute, ToastProvider, useToast } from ".";

it("Button renders as a Link with `to`", () => {
  render(
    <MemoryRouter>
      <Button to="/lapor">Buat</Button>
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: "Buat" })).toHaveAttribute("href", "/lapor");
});

it("Button loading sets aria-busy and disables", () => {
  render(<Button loading>Kirim</Button>);
  const b = screen.getByRole("button", { name: "Kirim" });
  expect(b).toHaveAttribute("aria-busy", "true");
  expect(b).toBeDisabled();
});

it("Field wires aria-describedby to hint and error", () => {
  render(
    <Field label="Nama" htmlFor="nama" hint="Nama lengkap" error="Wajib diisi">
      <Input id="nama" />
    </Field>,
  );
  const input = screen.getByLabelText("Nama");
  expect(input).toHaveAttribute("aria-invalid", "true");
  const ids = input.getAttribute("aria-describedby")!.split(" ");
  expect(ids).toEqual(["nama-hint", "nama-error"]);
  expect(document.getElementById("nama-error")).toHaveTextContent("Wajib diisi");
});

it("Dialog closes on Esc (cancel event)", () => {
  const onClose = vi.fn();
  render(
    <Dialog open onClose={onClose} title="Judul">
      isi
    </Dialog>,
  );
  const d = document.querySelector("dialog")!;
  fireEvent(d, new Event("cancel", { cancelable: true }));
  expect(onClose).toHaveBeenCalled();
});

it("MarkaRoute marks current step", () => {
  render(
    <MarkaRoute
      steps={[
        { title: "A", state: "done" },
        { title: "B", state: "current" },
        { title: "C", state: "upcoming" },
      ]}
    />,
  );
  const items = screen.getAllByRole("listitem");
  expect(items[1]).toHaveAttribute("aria-current", "step");
  expect(items[0]).not.toHaveAttribute("aria-current");
});

it("Toast appears", () => {
  function Trigger() {
    const toast = useToast();
    return <button onClick={() => toast("Tersimpan")}>go</button>;
  }
  render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>,
  );
  act(() => {
    fireEvent.click(screen.getByText("go"));
  });
  expect(screen.getByRole("status")).toHaveTextContent("Tersimpan");
});
