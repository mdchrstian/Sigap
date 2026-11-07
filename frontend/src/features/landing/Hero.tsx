import { useRef } from "react";
import { Camera, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, SignPlate } from "../../components/ui";
import { useAuth } from "../auth/AuthContext";
import SampleTicket from "./SampleTicket";

export default function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-12 md:py-24">
      <div className="flex flex-col gap-6 md:col-span-7">
        <SignPlate tone="rambu" level={1} arrow className="w-full text-display!">
          Laporkan kerusakan fasilitas publik di Bali
        </SignPlate>
        <p className="max-w-[52ch] text-lg text-muted">
          Foto kerusakannya, AI menyusun laporannya, petugas menindaklanjuti. Anda bisa memantau setiap
          langkahnya.
        </p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <>
              <Button size="lg" icon={Camera} onClick={() => fileRef.current?.click()}>
                Foto kerusakannya
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                data-testid="photo-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) navigate("/lapor", { state: { photo: file } });
                }}
              />
            </>
          ) : (
            <Button size="lg" icon={Camera} to="/masuk?next=%2Flapor">
              Foto kerusakannya
            </Button>
          )}
          <Button size="lg" variant="secondary" icon={Map} to="/peta">
            Jelajahi Peta
          </Button>
        </div>
      </div>
      <div className="md:col-span-5">
        <SampleTicket />
      </div>
    </section>
  );
}
