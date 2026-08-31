"use client";

import { FormEvent, useState } from "react";
import { api } from "../lib/api";

export default function Basvuru() {
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);

  return (
    <main className="giris-kabuk">
      <section className="kart giris-kart">
        <h1>Suret ve bilgi başvurusu</h1>
        <p className="lede">
          Vatandaş arşivi arayamaz. Başvuru kaydı açılır; evrakı personel bağlar.
        </p>
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
        <form
          className="form-izgara"
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void api<{ kod: string; sonTarih: string }>("/api/v1/halk/talepler", {
              method: "POST",
              body: JSON.stringify({
                tur: String(f.get("tur")),
                basvuranAd: String(f.get("basvuranAd")),
                konu: String(f.get("konu")),
                vekaletVar: f.get("vekaletVar") === "on",
                vekilAd: String(f.get("vekilAd") || "") || undefined,
                vekaletSure: String(f.get("vekaletSure") || "") || undefined,
              }),
            })
              .then((r) => {
                setHata(null);
                setBilgi(
                  `Başvuru ${r.kod} alındı. Son tarih ${new Date(r.sonTarih).toLocaleDateString("tr-TR")}.`,
                );
                e.currentTarget.reset();
              })
              .catch((err: Error) => setHata(err.message));
          }}
        >
          <label>
            Tür
            <select name="tur" required>
              <option value="SURET">Suret</option>
              <option value="INCELEME">Yerinde inceleme</option>
              <option value="BILGI_EDINME">Bilgi edinme</option>
              <option value="DILEKCE">Dilekçe</option>
              <option value="KVKK">KVKK başvurusu</option>
            </select>
          </label>
          <label>
            Ad soyad
            <input name="basvuranAd" required minLength={2} />
          </label>
          <label>
            Konu
            <input name="konu" required minLength={3} />
          </label>
          <label>
            <input name="vekaletVar" type="checkbox" /> Vekâletle başvuruyorum
          </label>
          <label>
            Vekil adı
            <input name="vekilAd" />
          </label>
          <label>
            Vekâlet bitiş
            <input name="vekaletSure" type="date" />
          </label>
          <button className="dugme-ana" type="submit">
            Başvuruyu kaydet
          </button>
        </form>
      </section>
    </main>
  );
}
