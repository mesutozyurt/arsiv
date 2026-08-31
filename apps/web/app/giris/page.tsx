"use client";

import { FormEvent, useId, useState } from "react";
import { api, tokenYaz } from "../lib/api";

export default function Giris() {
  const [hata, setHata] = useState<string | null>(null);
  const kullaniciId = useId();
  const sifreId = useId();
  const hataId = useId();

  async function gonder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const r = await api<{ token: string }>("/api/v1/oturum", {
        method: "POST",
        body: JSON.stringify({
          kullaniciAdi: String(form.get("kullaniciAdi")),
          sifre: String(form.get("sifre")),
        }),
      });
      tokenYaz(r.token);
      window.location.href = "/kayit";
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Giriş başarısız");
    }
  }

  return (
    <main className="giris-kabuk">
      <section className="kart giris-kart">
        <h1>Personel girişi</h1>
        <p className="lede">Kurum arşivi yalnızca yetkili hesapla açılır.</p>
        {hata ? (
          <p className="uyari" id={hataId} role="alert">
            {hata}
          </p>
        ) : null}
        <form className="form-izgara" onSubmit={(e) => void gonder(e)}>
          <label htmlFor={kullaniciId}>
            Kullanıcı adı
            <input
              id={kullaniciId}
              name="kullaniciAdi"
              required
              autoComplete="username"
              aria-invalid={hata ? true : undefined}
              aria-describedby={hata ? hataId : undefined}
            />
          </label>
          <label htmlFor={sifreId}>
            Şifre
            <input
              id={sifreId}
              name="sifre"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button className="dugme-ana" type="submit">
            Giriş yap
          </button>
        </form>
        <p className="meta" style={{ marginTop: "1rem" }}>
          Test: arsiv, birim, denetci, komisyon…komisyon5, yonetici, bilisim — şifre Lab-2026!
        </p>
      </section>
    </main>
  );
}
