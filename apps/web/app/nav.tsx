"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cikis, tokenAl } from "./lib/api";

export function Nav() {
  const yol = usePathname();
  const [girisVar, setGirisVar] = useState(false);

  useEffect(() => {
    setGirisVar(!!tokenAl());
  }, [yol]);

  return (
    <header className="app-ust">
      <a className="app-marka" href="/">
        <span className="app-mhur" aria-hidden="true">
          KA
        </span>
        Kurum arşivi
      </a>
      <nav aria-label="Ana menü">
        <a href="/kayit" aria-current={yol === "/kayit" ? "page" : undefined}>
          Tasnif
        </a>
        <a href="/is" aria-current={yol === "/is" ? "page" : undefined}>
          İşlemler
        </a>
        <a href="/yonetim" aria-current={yol === "/yonetim" ? "page" : undefined}>
          Yönetim
        </a>
        <a href="/basvuru" aria-current={yol === "/basvuru" ? "page" : undefined}>
          Vatandaş başvurusu
        </a>
        {girisVar ? (
          <button
            className="baglanti-dugme"
            type="button"
            onClick={() => {
              cikis();
              window.location.href = "/giris";
            }}
          >
            Çıkış
          </button>
        ) : (
          <a href="/giris" aria-current={yol === "/giris" ? "page" : undefined}>
            Giriş
          </a>
        )}
      </nav>
    </header>
  );
}
