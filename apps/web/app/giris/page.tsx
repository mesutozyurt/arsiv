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
      window.location.href = "/is";
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Giriş başarısız");
    }
  }

  return (
    <main style={{ maxWidth: "24rem", margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Giriş</h1>
      <p>Lab kullanıcıları, ortak şifre <code>Lab-2026!</code></p>
      <ul>
        <li>arsiv — arşiv memuru</li>
        <li>birim — birim sorumlusu (Fen İşleri)</li>
        <li>denetci — salt okunur</li>
        <li>bilisim — içerik kapalı</li>
        <li>komisyon — imha oyu</li>
        <li>yonetici — üst onay</li>
      </ul>
      {hata ? <p role="alert">{hata}</p> : null}
      <form onSubmit={(e) => void gonder(e)} style={{ display: "grid", gap: "0.5rem" }}>
        <label>
          Kullanıcı
          <input name="kullaniciAdi" required defaultValue="arsiv" autoComplete="username" />
        </label>
        <label>
          Şifre
          <input name="sifre" type="password" required defaultValue="Lab-2026!" autoComplete="current-password" />
        </label>
        <button type="submit">Oturum aç</button>
      </form>
    </main>
  );
}
