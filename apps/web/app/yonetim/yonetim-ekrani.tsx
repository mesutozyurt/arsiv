"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, type Aktor } from "../lib/api";

type Kullanici = {
  id: string;
  kullaniciAdi: string;
  ad: string;
  rol: string;
  aktif: boolean;
};
type Yedek = { rpoSaat: number; rtoSaat: number; kapsar: string[]; komut: string };
type Devir = { adetDosya: number; hashAdet: number; hashMutabakat: string };
type Zincir = { adet: number; bozuk: number[]; saglam: boolean };
type Yapi = { id: string; anahtar: string; surum: number; deger: string; onayli: boolean };

export function YonetimEkrani() {
  const [ben, setBen] = useState<Aktor | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [yedek, setYedek] = useState<Yedek | null>(null);
  const [devir, setDevir] = useState<Devir | null>(null);
  const [zincir, setZincir] = useState<Zincir | null>(null);
  const [yapilar, setYapilar] = useState<Yapi[]>([]);

  useEffect(() => {
    api<Aktor>("/api/v1/ben")
      .then(setBen)
      .catch(() => {
        window.location.href = "/giris";
      });
  }, []);

  useEffect(() => {
    if (!ben) return;
    void Promise.all([
      api<Kullanici[]>("/api/v1/kullanicilar").then(setKullanicilar),
      api<Yedek>("/api/v1/yedek").then(setYedek),
      api<Yapi[]>("/api/v1/yapilandirma").then(setYapilar),
    ]).catch((e: Error) => setHata(e.message));
  }, [ben]);

  if (!ben) return <main className="yukleniyor">Oturum açılıyor…</main>;

  return (
    <main className="kabuk">
      <header className="sayfa-baslik">
        <h1>Yönetim</h1>
        <p>Kullanıcı, yedek, devir paketi, yapılandırma ve denetim bütünlüğü.</p>
      </header>
      {hata ? (
        <p className="uyari" role="alert">
          {hata}
        </p>
      ) : null}
      {bilgi ? (
        <p className="bilgi" role="status">
          {bilgi}
        </p>
      ) : null}

      <section className="kart">
        <h2>Personel</h2>
        <div className="tablo-sar">
          <table>
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Ad</th>
                <th>Rol</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {kullanicilar.map((k) => (
                <tr key={k.id}>
                  <td>{k.kullaniciAdi}</td>
                  <td>{k.ad}</td>
                  <td>{k.rol}</td>
                  <td>
                    <span className={`rozet ${k.aktif ? "rozet-kayitli" : "rozet-disarida"}`}>
                      {k.aktif ? "Aktif" : "Kapalı"}
                    </span>
                  </td>
                  <td>
                    {k.aktif && (ben.rol === "BILISIM" || ben.rol === "UST_YONETICI") ? (
                      <button
                        type="button"
                        onClick={() =>
                          void api(`/api/v1/kullanicilar/${k.id}/kapat`, { method: "POST" })
                            .then(() => api<Kullanici[]>("/api/v1/kullanicilar"))
                            .then(setKullanicilar)
                            .then(() => setBilgi(`${k.kullaniciAdi} kapatıldı.`))
                            .catch((e: Error) => setHata(e.message))
                        }
                      >
                        Erişimi kapat
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="kart">
        <h2>Yedek ve devir</h2>
        {yedek ? (
          <p className="meta">
            RPO {yedek.rpoSaat} saat · RTO {yedek.rtoSaat} saat · {yedek.kapsar.join(", ")} ·{" "}
            {yedek.komut}
          </p>
        ) : null}
        <p>
          <button
            type="button"
            onClick={() =>
              void api<Devir>("/api/v1/devir-paketi")
                .then((d) => {
                  setDevir(d);
                  const blob = new Blob([JSON.stringify(d, null, 2)], {
                    type: "application/json",
                  });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "arsiv-devir-v1.json";
                  a.click();
                })
                .catch((e: Error) => setHata(e.message))
            }
          >
            Devir paketini indir
          </button>
        </p>
        {devir ? (
          <p className="meta">
            {devir.adetDosya} dosya · {devir.hashAdet} nesne · mutabakat {devir.hashMutabakat.slice(0, 16)}…
          </p>
        ) : null}
      </section>

      <section className="kart">
        <h2>Denetim zinciri</h2>
        <button
          type="button"
          onClick={() =>
            void api<Zincir>("/api/v1/denetim/dogrula")
              .then(setZincir)
              .catch((e: Error) => setHata(e.message))
          }
        >
          Bütünlüğü doğrula
        </button>
        {zincir ? (
          <p className={zincir.saglam ? "bilgi" : "uyari"}>
            {zincir.adet} olay · {zincir.saglam ? "zincir sağlam" : `bozuk sıra: ${zincir.bozuk.join(", ")}`}
          </p>
        ) : null}
      </section>

      <section className="kart">
        <h2>Yapılandırma sürümleri</h2>
        <ul>
          {yapilar.map((y) => (
            <li key={y.id}>
              {y.anahtar} v{y.surum} {y.onayli ? "(onaylı)" : "(taslak)"} — {y.deger}
            </li>
          ))}
        </ul>
        <form
          className="form-izgara form-dar"
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void api("/api/v1/yapilandirma", {
              method: "POST",
              body: JSON.stringify({
                anahtar: String(f.get("anahtar")),
                deger: String(f.get("deger")),
              }),
            })
              .then(() => api<Yapi[]>("/api/v1/yapilandirma"))
              .then(setYapilar)
              .then(() => setBilgi("Yeni sürüm taslak; onaylanmadan yürümez."))
              .catch((err: Error) => setHata(err.message));
          }}
        >
          <label>
            Anahtar
            <input name="anahtar" required defaultValue="is-gunu-takvimi" />
          </label>
          <label>
            Değer
            <input name="deger" required />
          </label>
          <button type="submit">Taslak sürüm aç</button>
        </form>
      </section>

      <section className="kart">
        <h2>Excel / eski liste kuyruğu</h2>
        <form
          className="form-izgara form-dar"
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void api("/api/v1/ice-aktarim", {
              method: "POST",
              body: JSON.stringify({
                kaynak: String(f.get("kaynak")),
                satirOzet: String(f.get("satirOzet")),
              }),
            })
              .then(() => setBilgi("İçe aktarım kuyruğa alındı; kaynak silinmedi."))
              .catch((err: Error) => setHata(err.message));
          }}
        >
          <label>
            Kaynak
            <input name="kaynak" required defaultValue="excel-ornek.xlsx" />
          </label>
          <label>
            Satır özeti
            <input name="satirOzet" required placeholder="100 satır, 2 mükerrer" />
          </label>
          <button type="submit">Kuyruğa al</button>
        </form>
      </section>
    </main>
  );
}
