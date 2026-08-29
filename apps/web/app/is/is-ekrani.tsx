"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, type Aktor } from "../lib/api";

type Sekme =
  | "arama"
  | "odunc"
  | "imha"
  | "talep"
  | "entegrasyon"
  | "gecis"
  | "rapor"
  | "denetim";

export function IsEkrani() {
  const [ben, setBen] = useState<Aktor | null>(null);
  const [sekme, setSekme] = useState<Sekme>("arama");
  const [cikti, setCikti] = useState<string>("");
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    api<Aktor>("/api/v1/ben")
      .then(setBen)
      .catch(() => {
        window.location.href = "/giris";
      });
  }, []);

  async function calistir(fn: () => Promise<unknown>) {
    setHata(null);
    try {
      const r = await fn();
      setCikti(JSON.stringify(r, null, 2));
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Hata");
    }
  }

  if (!ben) return <main style={{ padding: "1.5rem" }}>Oturum kontrol ediliyor…</main>;

  return (
    <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "1.2rem" }}>
      <h1>İşlemler</h1>
      <p>
        {ben.ad} · {ben.rol}
      </p>
      <nav style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {(
          [
            ["arama", "Arama / plan"],
            ["odunc", "Ödünç"],
            ["imha", "İmha"],
            ["talep", "Talep / KVKK"],
            ["entegrasyon", "EYP / kanal"],
            ["gecis", "Geçiş / yedek"],
            ["rapor", "Rapor"],
            ["denetim", "Denetim"],
          ] as const
        ).map(([id, ad]) => (
          <button key={id} type="button" onClick={() => setSekme(id)}>
            {ad}
          </button>
        ))}
      </nav>
      {hata ? (
        <p role="alert" style={{ color: "#8a1f1f" }}>
          {hata}
        </p>
      ) : null}

      {sekme === "arama" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = String(new FormData(e.currentTarget).get("q"));
            void calistir(() => api(`/api/v1/ara?q=${encodeURIComponent(q)}`));
          }}
        >
          <input name="q" placeholder="Kod veya konu" aria-label="Ara" />
          <button type="submit">Ara</button>
        </form>
      ) : null}

      {sekme === "odunc" ? (
        <div>
          <button type="button" onClick={() => void calistir(() => api("/api/v1/oduncler"))}>
            Ödünçleri listele
          </button>
          <OduncForm onSubmit={(dto) => void calistir(() => api("/api/v1/oduncler", { method: "POST", body: JSON.stringify(dto) }))} />
        </div>
      ) : null}

      {sekme === "imha" ? (
        <div>
          <button type="button" onClick={() => void calistir(() => api("/api/v1/imha"))}>
            Listeler
          </button>
          <p>İmha otomatik değildir; aday → oy → DAB → üst onay → icra.</p>
        </div>
      ) : null}

      {sekme === "talep" ? (
        <TalepForm onSubmit={(dto) => void calistir(() => api("/api/v1/talepler", { method: "POST", body: JSON.stringify(dto) }))} />
      ) : null}

      {sekme === "entegrasyon" ? (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() =>
              void calistir(() =>
                api("/api/v1/entegrasyon", {
                  method: "POST",
                  body: JSON.stringify({
                    sistem: "EBYS-LAB",
                    disKimlik: "EYP-1",
                    idempotans: `lab-${Date.now()}`,
                    yon: "ICE",
                  }),
                }),
              )
            }
          >
            Entegrasyon iletisi (idempotent)
          </button>
          <button type="button" onClick={() => void calistir(() => api("/api/v1/raporlar"))}>
            Kanal durum stub
          </button>
        </div>
      ) : null}

      {sekme === "gecis" ? (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() =>
              void calistir(() =>
                api("/api/v1/ice-aktarim", {
                  method: "POST",
                  body: JSON.stringify({ kaynak: "excel-ornek", satirOzet: "DSY-X;konu;birim" }),
                }),
              )
            }
          >
            Excel satırı kuyruğa al (kaynak silinmez)
          </button>
          <button type="button" onClick={() => void calistir(() => api("/api/v1/devir-paketi"))}>
            Devir paketi
          </button>
          <button type="button" onClick={() => void calistir(() => api("/api/v1/yedek"))}>
            Yedek raporu
          </button>
        </div>
      ) : null}

      {sekme === "rapor" ? (
        <button type="button" onClick={() => void calistir(() => api("/api/v1/raporlar"))}>
          Takvim / geciken
        </button>
      ) : null}

      {sekme === "denetim" ? (
        <button type="button" onClick={() => void calistir(() => api("/api/v1/denetim"))}>
          Denetim günlüğü
        </button>
      ) : null}

      {cikti ? (
        <pre style={{ overflow: "auto", background: "#f6f6f6", padding: "0.8rem" }}>{cikti}</pre>
      ) : null}
    </main>
  );
}

function OduncForm({ onSubmit }: { onSubmit: (dto: object) => void }) {
  return (
    <form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSubmit({
          dosyaId: String(f.get("dosyaId")),
          talepEden: String(f.get("talepEden")),
          birimAd: String(f.get("birimAd")),
          gun: 7,
        });
      }}
      style={{ display: "grid", gap: "0.4rem", marginTop: "0.8rem" }}
    >
      <input name="dosyaId" required placeholder="Dosya UUID" />
      <input name="talepEden" required placeholder="Talep eden" defaultValue="Birim personeli" />
      <input name="birimAd" required placeholder="Birim" defaultValue="Yazı İşleri" />
      <button type="submit">Ödünç ver</button>
    </form>
  );
}

function TalepForm({ onSubmit }: { onSubmit: (dto: object) => void }) {
  return (
    <form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSubmit({
          tur: String(f.get("tur")),
          basvuranAd: String(f.get("basvuranAd")),
          konu: String(f.get("konu")),
          vekaletVar: f.get("vekaletVar") === "on",
          vekilAd: String(f.get("vekilAd") || "") || undefined,
          vekaletSure: String(f.get("vekaletSure") || "") || undefined,
        });
      }}
      style={{ display: "grid", gap: "0.4rem" }}
    >
      <select name="tur" required>
        <option value="SURET">Suret</option>
        <option value="BILGI_EDINME">Bilgi edinme</option>
        <option value="DILEKCE">Dilekçe</option>
        <option value="KVKK">KVKK</option>
      </select>
      <input name="basvuranAd" required placeholder="Başvuran (sentetik ad)" />
      <input name="konu" required placeholder="Konu" />
      <label>
        <input name="vekaletVar" type="checkbox" /> Vekâlet
      </label>
      <input name="vekilAd" placeholder="Vekil ad" />
      <input name="vekaletSure" type="date" />
      <button type="submit">Talep aç</button>
    </form>
  );
}
