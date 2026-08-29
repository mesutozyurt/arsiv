"use client";

import { cikis, tokenAl } from "./lib/api";

export function Nav() {
  const varMi = typeof window !== "undefined" && !!tokenAl();
  return (
    <header
      style={{
        borderBottom: "1px solid #ddd",
        padding: "0.6rem 1.2rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <a href="/">Arşiv</a>
      <a href="/kayit">Kayıt</a>
      <a href="/is">İşlemler</a>
      <a href="/giris">Giriş</a>
      {varMi ? (
        <button
          type="button"
          onClick={() => {
            cikis();
            window.location.href = "/giris";
          }}
        >
          Çıkış
        </button>
      ) : null}
    </header>
  );
}
