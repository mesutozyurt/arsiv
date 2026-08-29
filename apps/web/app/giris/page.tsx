"use client";

import { FormEvent, useState } from "react";
import { api, tokenYaz } from "../lib/api";

export default function Giris() {
  const [hata, setHata] = useState<string | null>(null);

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
    <main style={{ maxWidth: "24rem", margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Personel girişi</h1>
      {hata ? <p role="alert">{hata}</p> : null}
      <form onSubmit={(e) => void gonder(e)} style={{ display: "grid", gap: "0.65rem" }}>
        <label>
          Kullanıcı adı
          <input name="kullaniciAdi" required autoComplete="username" style={{ width: "100%" }} />
        </label>
        <label>
          Şifre
          <input name="sifre" type="password" required autoComplete="current-password" style={{ width: "100%" }} />
        </label>
        <button type="submit">Giriş</button>
      </form>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>
        Test hesapları: arsiv, birim, denetci, komisyon, yonetici, bilisim — şifre Lab-2026!
      </p>
    </main>
  );
}
