"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, type Aktor } from "../lib/api";

type Dosya = { id: string; kod: string; konu: string; durum: string; birim: { ad: string } };
type Odunc = {
  id: string;
  talepEden: string;
  birimAd: string;
  durum: string;
  sonTarih: string;
  dosya: { kod: string; konu: string };
};
type Imha = {
  id: string;
  kod: string;
  asama: string;
  hazirlayan: string;
  dabGorusNo: string | null;
  ustOnaylayan: string | null;
  adaylar: { dosya: { kod: string; konu: string } }[];
  oylar: { uyeAd: string; kabul: boolean }[];
};
type Talep = {
  id: string;
  kod: string;
  tur: string;
  durum: string;
  basvuranAd: string;
  konu: string;
  sonTarih: string;
};
type Olay = {
  id: string;
  createdAt: string;
  aktorAd: string;
  rol: string;
  islem: string;
  yol: string;
};
type Rapor = {
  yillikKontrol: { kayitliDosya: number; donem: number };
  gecikenOdunc: Odunc[];
  acikTalepler: Talep[];
};

type Sekme = "ara" | "odunc" | "imha" | "talep" | "denetim" | "rapor";

export function IsEkrani() {
  const [ben, setBen] = useState<Aktor | null>(null);
  const [sekme, setSekme] = useState<Sekme>("ara");
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const [dosyalar, setDosyalar] = useState<Dosya[]>([]);
  const [arama, setArama] = useState<Dosya[]>([]);
  const [oduncler, setOduncler] = useState<Odunc[]>([]);
  const [imhalar, setImhalar] = useState<Imha[]>([]);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [olaylar, setOlaylar] = useState<Olay[]>([]);
  const [rapor, setRapor] = useState<Rapor | null>(null);

  useEffect(() => {
    api<Aktor>("/api/v1/ben")
      .then(setBen)
      .catch(() => {
        window.location.href = "/giris";
      });
  }, []);

  useEffect(() => {
    if (!ben) return;
    void api<Dosya[]>("/api/v1/dosyalar").then(setDosyalar).catch(() => undefined);
  }, [ben]);

  async function yenileOdunc() {
    setOduncler(await api<Odunc[]>("/api/v1/oduncler"));
  }
  async function yenileImha() {
    setImhalar(await api<Imha[]>("/api/v1/imha"));
  }
  async function yenileTalep() {
    setTalepler(await api<Talep[]>("/api/v1/talepler"));
  }

  useEffect(() => {
    if (!ben) return;
    if (sekme === "odunc") void yenileOdunc().catch((e: Error) => setHata(e.message));
    if (sekme === "imha") void yenileImha().catch((e: Error) => setHata(e.message));
    if (sekme === "talep") void yenileTalep().catch((e: Error) => setHata(e.message));
    if (sekme === "denetim") {
      void api<Olay[]>("/api/v1/denetim").then(setOlaylar).catch((e: Error) => setHata(e.message));
    }
    if (sekme === "rapor") {
      void api<Rapor>("/api/v1/raporlar").then(setRapor).catch((e: Error) => setHata(e.message));
    }
  }, [ben, sekme]);

  if (!ben) return <main style={{ padding: "1.5rem" }}>Oturum açılıyor…</main>;

  return (
    <main style={{ maxWidth: "58rem", margin: "0 auto", padding: "1.25rem" }}>
      <h1 style={{ fontSize: "1.35rem" }}>Arşiv işlemleri</h1>
      <p>
        {ben.ad} — {rolAd(ben.rol)}
      </p>
      <nav style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", margin: "1rem 0" }}>
        {(
          [
            ["ara", "Dosya ara"],
            ["odunc", "Ödünç / iade"],
            ["imha", "Ayıklama-imha"],
            ["talep", "Suret ve başvurular"],
            ["denetim", "Denetim günlüğü"],
            ["rapor", "Raporlar"],
          ] as const
        ).map(([id, ad]) => (
          <button key={id} type="button" onClick={() => { setHata(null); setBilgi(null); setSekme(id); }}>
            {ad}
          </button>
        ))}
      </nav>
      {hata ? <p role="alert" style={{ color: "#8a1f1f" }}>{hata}</p> : null}
      {bilgi ? <p role="status">{bilgi}</p> : null}

      {sekme === "ara" ? (
        <section>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = String(new FormData(e.currentTarget).get("q"));
              void api<Dosya[]>(`/api/v1/ara?q=${encodeURIComponent(q)}`)
                .then(setArama)
                .catch((err: Error) => setHata(err.message));
            }}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
          >
            <label style={{ flex: 1 }}>
              Dosya kodu veya konu
              <input name="q" required style={{ width: "100%" }} />
            </label>
            <button type="submit" style={{ alignSelf: "end" }}>
              Ara
            </button>
          </form>
          <DosyaTablo satirlar={arama} />
        </section>
      ) : null}

      {sekme === "odunc" ? (
        <section>
          <h2 style={{ fontSize: "1.05rem" }}>Açık ve iade edilmiş ödünçler</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Dosya</th>
                <th align="left">Alan</th>
                <th align="left">Son tarih</th>
                <th align="left">Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {oduncler.map((o) => (
                <tr key={o.id}>
                  <td>
                    <a href="/kayit">{o.dosya.kod}</a> — {o.dosya.konu}
                  </td>
                  <td>
                    {o.talepEden} ({o.birimAd})
                  </td>
                  <td>{new Date(o.sonTarih).toLocaleDateString("tr-TR")}</td>
                  <td>{o.durum === "ACIK" ? "Dışarıda" : "İade"}</td>
                  <td>
                    {o.durum === "ACIK" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void api(`/api/v1/oduncler/${o.id}/iade`, { method: "POST" })
                            .then(() => yenileOdunc())
                            .then(() => setBilgi("İade alındı."))
                            .catch((e: Error) => setHata(e.message))
                        }
                      >
                        İade al
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ fontSize: "1rem" }}>Yeni ödünç</h3>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void api("/api/v1/oduncler", {
                method: "POST",
                body: JSON.stringify({
                  dosyaId: String(f.get("dosyaId")),
                  talepEden: String(f.get("talepEden")),
                  birimAd: String(f.get("birimAd")),
                  gun: Number(f.get("gun") || 7),
                }),
              })
                .then(() => yenileOdunc())
                .then(() => setBilgi("Ödünç kaydı açıldı. Aynı asıl ikinci kişiye verilemez."))
                .catch((err: Error) => setHata(err.message));
            }}
            style={{ display: "grid", gap: "0.45rem", maxWidth: "28rem" }}
          >
            <label>
              Dosya
              <select name="dosyaId" required style={{ width: "100%" }}>
                {dosyalar.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.kod} — {d.konu}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Teslim alan
              <input name="talepEden" required defaultValue="Birim personeli" />
            </label>
            <label>
              Birim
              <input name="birimAd" required defaultValue="Yazı İşleri Müdürlüğü" />
            </label>
            <label>
              Süre (gün)
              <input name="gun" type="number" min={1} defaultValue={7} />
            </label>
            <button type="submit">Ödünç ver</button>
          </form>
        </section>
      ) : null}

      {sekme === "imha" ? (
        <section>
          <p>Sistem otomatik silmez. Sıra: aday liste → komisyon oyu → DAB görüşü → üst onay → icra.</p>
          {ben.rol === "ARSIV_MEMURU" ? (
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const ids = f.getAll("dosyaId").map(String);
              void api("/api/v1/imha", { method: "POST", body: JSON.stringify({ dosyaIdleri: ids }) })
                .then(() => yenileImha())
                .then(() => setBilgi("Aday liste oluşturuldu."))
                .catch((err: Error) => setHata(err.message));
            }}
          >
            <fieldset>
              <legend>Adaya dosya ekle</legend>
              {dosyalar
                .filter((d) => d.durum === "KAYITLI")
                .map((d) => (
                  <label key={d.id} style={{ display: "block" }}>
                    <input type="checkbox" name="dosyaId" value={d.id} /> {d.kod} — {d.konu}
                  </label>
                ))}
            </fieldset>
            <button type="submit">Aday liste oluştur</button>
          </form>
          ) : null}
              {imhalar.map((l) => (
            <article key={l.id} style={{ borderTop: "1px solid #ddd", marginTop: "1rem", paddingTop: "0.8rem" }}>
              <h3 style={{ fontSize: "1rem" }}>
                {l.kod} — aşama: {l.asama}
              </h3>
              <p>Hazırlayan: {l.hazirlayan}</p>
              <ul>
                {l.adaylar.map((a, i) => (
                  <li key={i}>
                    {a.dosya.kod} — {a.dosya.konu}
                  </li>
                ))}
              </ul>
              <p>
                Oylar: {l.oylar.map((o) => `${o.uyeAd} ${o.kabul ? "kabul" : "ret"}`).join(", ") || "yok"}
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {ben.rol === "KOMISYON" ? (
                  <button
                    type="button"
                    onClick={() =>
                      void api(`/api/v1/imha/${l.id}/oy`, {
                        method: "POST",
                        body: JSON.stringify({ kabul: true, gerekce: "Komisyon kabul" }),
                      })
                        .then(() => yenileImha())
                        .catch((e: Error) => setHata(e.message))
                    }
                  >
                    Komisyon: kabul
                  </button>
                ) : null}
                {ben.rol === "ARSIV_MEMURU" || ben.rol === "UST_YONETICI" ? (
                  <button
                    type="button"
                    onClick={() =>
                      void api(`/api/v1/imha/${l.id}/dab`, {
                        method: "POST",
                        body: JSON.stringify({ dabGorusNo: "DAB-2026-1" }),
                      })
                        .then(() => yenileImha())
                        .catch((e: Error) => setHata(e.message))
                    }
                  >
                    DAB görüşü işle
                  </button>
                ) : null}
                {ben.rol === "UST_YONETICI" ? (
                  <button
                    type="button"
                    onClick={() =>
                      void api(`/api/v1/imha/${l.id}/onay`, { method: "POST" })
                        .then(() => yenileImha())
                        .catch((e: Error) => setHata(e.message))
                    }
                  >
                    Üst onay
                  </button>
                ) : null}
                {ben.rol === "ARSIV_MEMURU" ? (
                  <button
                    type="button"
                    onClick={() =>
                      void api(`/api/v1/imha/${l.id}/icra`, { method: "POST" })
                        .then(() => yenileImha())
                        .then(() => setBilgi("İcra kaydı: içerik yeniden üretilmez, kanıt 10 yıl."))
                        .catch((e: Error) => setHata(e.message))
                    }
                  >
                    İcra et
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {sekme === "talep" ? (
        <section>
          <ul>
            {talepler.map((t) => (
              <li key={t.id}>
                {t.kod} · {t.tur} · {t.durum} — {t.basvuranAd}: {t.konu} (son{" "}
                {new Date(t.sonTarih).toLocaleDateString("tr-TR")})
              </li>
            ))}
          </ul>
          <h3 style={{ fontSize: "1rem" }}>Yeni başvuru</h3>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void api("/api/v1/talepler", {
                method: "POST",
                body: JSON.stringify({
                  tur: String(f.get("tur")),
                  basvuranAd: String(f.get("basvuranAd")),
                  konu: String(f.get("konu")),
                  dosyaId: String(f.get("dosyaId") || "") || undefined,
                  vekaletVar: f.get("vekaletVar") === "on",
                  vekilAd: String(f.get("vekilAd") || "") || undefined,
                  vekaletSure: String(f.get("vekaletSure") || "") || undefined,
                }),
              })
                .then(() => yenileTalep())
                .then(() => setBilgi("Başvuru kaydı açıldı."))
                .catch((err: Error) => setHata(err.message));
            }}
            style={{ display: "grid", gap: "0.4rem", maxWidth: "28rem" }}
          >
            <label>
              Tür
              <select name="tur">
                <option value="SURET">Suret</option>
                <option value="INCELEME">Yerinde inceleme</option>
                <option value="BILGI_EDINME">Bilgi edinme (15 iş günü)</option>
                <option value="DILEKCE">Dilekçe (30 gün)</option>
                <option value="KVKK">KVKK başvurusu</option>
              </select>
            </label>
            <label>
              İlgili dosya
              <select name="dosyaId">
                <option value="">—</option>
                {dosyalar.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.kod}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Başvuran
              <input name="basvuranAd" required />
            </label>
            <label>
              Konu
              <input name="konu" required />
            </label>
            <label>
              <input name="vekaletVar" type="checkbox" /> Vekâlet var
            </label>
            <input name="vekilAd" placeholder="Vekil adı" />
            <label>
              Vekâlet bitiş
              <input name="vekaletSure" type="date" />
            </label>
            <button type="submit">Kaydet</button>
          </form>
        </section>
      ) : null}

      {sekme === "denetim" ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Zaman</th>
              <th align="left">Kim</th>
              <th align="left">İşlem</th>
              <th align="left">Yol</th>
            </tr>
          </thead>
          <tbody>
            {olaylar.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.createdAt).toLocaleString("tr-TR")}</td>
                <td>
                  {o.aktorAd} ({o.rol})
                </td>
                <td>{o.islem}</td>
                <td>{o.yol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {sekme === "rapor" && rapor ? (
        <section>
          <p>
            {rapor.yillikKontrol.donem} yıllık kontrol: {rapor.yillikKontrol.kayitliDosya} kayıtlı
            dosya.
          </p>
          <h3 style={{ fontSize: "1rem" }}>Geciken ödünç</h3>
          <ul>
            {rapor.gecikenOdunc.length === 0 ? <li>Yok</li> : rapor.gecikenOdunc.map((o) => (
              <li key={o.id}>
                {o.dosya.kod} — {o.talepEden}
              </li>
            ))}
          </ul>
          <h3 style={{ fontSize: "1rem" }}>Açık başvurular</h3>
          <ul>
            {rapor.acikTalepler.length === 0 ? <li>Yok</li> : rapor.acikTalepler.map((t) => (
              <li key={t.id}>
                {t.kod} {t.tur}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function DosyaTablo({ satirlar }: { satirlar: Dosya[] }) {
  if (satirlar.length === 0) return <p>Sonuç yok. Yetkiniz olmayan kayıt listelenmez.</p>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th align="left">Kod</th>
          <th align="left">Konu</th>
          <th align="left">Birim</th>
          <th align="left">Durum</th>
        </tr>
      </thead>
      <tbody>
        {satirlar.map((d) => (
          <tr key={d.id}>
            <td>
              <a href="/kayit">{d.kod}</a>
            </td>
            <td>{d.konu}</td>
            <td>{d.birim?.ad}</td>
            <td>{d.durum}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function rolAd(rol: string): string {
  const map: Record<string, string> = {
    ARSIV_MEMURU: "Arşiv memuru",
    BIRIM_SORUMLUSU: "Birim arşiv sorumlusu",
    DENETCI: "İç denetçi",
    BILISIM: "Bilişim",
    KOMISYON: "İmha komisyonu",
    UST_YONETICI: "Üst yönetici",
  };
  return map[rol] ?? rol;
}
