"use client";

import { cikis, tokenAl } from "./lib/api";

export function Nav() {
  const varMi = typeof window !== "undefined" && !!tokenAl();
  return (
    <header
      style={{
        borderBottom: "1px solid #ddd",
        padding: "0.65rem 1.2rem",
        display: "flex",
        gap: "1.1rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <a href="/" style={{ fontWeight: 600 }}>
        Kurum arşivi
      </a>
      <a href="/kayit">Tasnif ve konum</a>
      <a href="/is">İşlemler</a>
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
      ) : (
        <a href="/giris">Giriş</a>
      )}
    </header>
  );
}
