"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Konum = {
  id: string;
  kod: string;
  oda: string;
  raf: string;
  dolap: string | null;
  kutu: string;
  klasor: string | null;
  barkod: string;
};

type Birim = { id: string; kod: string; ad: string };

type DosyaOzet = {
  id: string;
  kod: string;
  konu: string;
  durum: "TASLAK" | "KAYITLI";
  nushaTuru: string;
  konum: Konum | null;
};

type Seri = {
  id: string;
  kod: string;
  ad: string;
  birim: Birim | null;
  dosyalar: DosyaOzet[];
};

type Fon = { id: string; kod: string; ad: string; seriler: Seri[] };

type Nesne = {
  id: string;
  sha256: string;
  boyut: number;
  mime: string;
  format: string;
};

type Belge = {
  id: string;
  kod: string;
  tur: string;
  sayi: string | null;
  konu: string;
  ekler: { id: string; sira: number; aciklama: string }[];
  icerikler: { id: string; rol: string; createdAt: string; nesne: Nesne }[];
  taramalar: {
    id: string;
    kod: string;
    cihaz: string;
    operatorAd: string;
    sayfaSayisi: number;
    profil: string;
    kalite: string;
    createdAt: string;
    oncekiTaramaId: string | null;
    nesne: Nesne;
  }[];
};

type Hareket = {
  id: string;
  createdAt: string;
  gerekce: string | null;
  oncekiOzet: string | null;
  konum: Konum;
};

type DosyaDetay = DosyaOzet & {
  ureticiBirimAd: string;
  sahipKurum: string;
  kaynakSistem: string;
  seri: { kod: string; ad: string; fon: { kod: string; ad: string } };
  birim: Birim;
  belgeler: Belge[];
  hareketler: Hareket[];
};

function konumYazi(konum: Konum): string {
  return [
    konum.oda,
    `raf ${konum.raf}`,
    konum.dolap ? `dolap ${konum.dolap}` : null,
    `kutu ${konum.kutu}`,
    konum.klasor ? `klasör ${konum.klasor}` : null,
    konum.barkod,
  ]
    .filter(Boolean)
    .join(" · ");
}

async function yukle<T>(yol: string, form: FormData): Promise<T> {
  const yanit = await fetch(yol, { method: "POST", body: form });
  const govde = await yanit.json().catch(() => ({}));
  if (!yanit.ok) {
    const mesaj =
      (govde as { message?: string | string[] }).message ?? yanit.statusText;
    throw new Error(Array.isArray(mesaj) ? mesaj.join(", ") : String(mesaj));
  }
  return govde as T;
}

async function api<T>(yol: string, init?: RequestInit): Promise<T> {
  const yanit = await fetch(yol, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const govde = await yanit.json().catch(() => ({}));
  if (!yanit.ok) {
    const mesaj =
      (govde as { message?: string | string[] }).message ?? yanit.statusText;
    throw new Error(Array.isArray(mesaj) ? mesaj.join(", ") : String(mesaj));
  }
  return govde as T;
}

export function KayitEkrani() {
  const [agac, setAgac] = useState<{
    fonlar: Fon[];
    birimler: Birim[];
    konumlar: Konum[];
  } | null>(null);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [detay, setDetay] = useState<DosyaDetay | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);

  const yenile = useCallback(async (dosyaId?: string) => {
    const veri = await api<{ fonlar: Fon[]; birimler: Birim[]; konumlar: Konum[] }>(
      "/api/v1/agac",
    );
    setAgac(veri);
    const hedef =
      dosyaId ??
      seciliId ??
      veri.fonlar[0]?.seriler[0]?.dosyalar[0]?.id ??
      null;
    setSeciliId(hedef);
    if (hedef) setDetay(await api<DosyaDetay>(`/api/v1/dosyalar/${hedef}`));
  }, [seciliId]);

  useEffect(() => {
    yenile().catch((e: Error) => setHata(e.message));
    // İlk yükleme
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function dosyaSec(id: string) {
    setHata(null);
    setBilgi(null);
    setSeciliId(id);
    setDetay(await api<DosyaDetay>(`/api/v1/dosyalar/${id}`));
  }

  async function dosyaOlustur(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    const form = new FormData(e.currentTarget);
    const govde = {
      kod: String(form.get("kod")),
      konu: String(form.get("konu")),
      seriId: String(form.get("seriId")),
      birimId: String(form.get("birimId")),
      nushaTuru: String(form.get("nushaTuru")),
      ureticiBirimAd: String(form.get("ureticiBirimAd")),
      sahipKurum: String(form.get("sahipKurum")),
      konumId: String(form.get("konumId") || "") || undefined,
    };
    try {
      const olusan = await api<DosyaDetay>("/api/v1/dosyalar", {
        method: "POST",
        body: JSON.stringify(govde),
      });
      e.currentTarget.reset();
      setBilgi(`Dosya oluşturuldu: ${olusan.kod}`);
      await yenile(olusan.id);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Kayıt başarısız");
    }
  }

  async function konumAta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detay) return;
    const form = new FormData(e.currentTarget);
    try {
      const guncel = await api<DosyaDetay>(`/api/v1/dosyalar/${detay.id}/konum`, {
        method: "POST",
        body: JSON.stringify({
          konumId: String(form.get("konumId")),
          gerekce: String(form.get("gerekce") || "Konum güncelleme"),
        }),
      });
      setDetay(guncel);
      setBilgi("Konum güncellendi; önceki yer tarihçede kaldı.");
      await yenile(guncel.id);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Konum atanamadı");
    }
  }

  async function tamamla() {
    if (!detay) return;
    try {
      const guncel = await api<DosyaDetay>(`/api/v1/dosyalar/${detay.id}/tamamla`, {
        method: "POST",
      });
      setDetay(guncel);
      setBilgi("Kayıt tamamlandı.");
      await yenile(guncel.id);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Tamamlanamadı");
    }
  }

  async function icerikYukle(e: FormEvent<HTMLFormElement>, belgeId: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await yukle(`/api/v1/belgeler/${belgeId}/icerik`, form);
      e.currentTarget.reset();
      setDetay(await api<DosyaDetay>(`/api/v1/dosyalar/${detay!.id}`));
      setBilgi("İkili bağlandı; özgün nesne üzerine yazılmaz.");
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Yükleme başarısız");
    }
  }

  async function taramaYukle(e: FormEvent<HTMLFormElement>, belgeId: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await yukle(`/api/v1/belgeler/${belgeId}/taramalar`, form);
      e.currentTarget.reset();
      setDetay(await api<DosyaDetay>(`/api/v1/dosyalar/${detay!.id}`));
      setBilgi("Tarama kaydı eklendi; önceki görüntü silinmedi.");
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Tarama yüklenemedi");
    }
  }

  async function belgeEkle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detay) return;
    const form = new FormData(e.currentTarget);
    try {
      await api("/api/v1/belgeler", {
        method: "POST",
        body: JSON.stringify({
          kod: String(form.get("kod")),
          dosyaId: detay.id,
          tur: String(form.get("tur")),
          sayi: String(form.get("sayi") || "") || undefined,
          konu: String(form.get("konu")),
          uretici: String(form.get("uretici")),
          nushaTuru: String(form.get("nushaTuru")),
        }),
      });
      e.currentTarget.reset();
      setDetay(await api<DosyaDetay>(`/api/v1/dosyalar/${detay.id}`));
      setBilgi("Belge eklendi.");
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Belge eklenemedi");
    }
  }

  const seriler = agac?.fonlar.flatMap((f) => f.seriler) ?? [];

  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem" }}>
      <p>
        <a href="/">← Laboratuvar</a>
      </p>
      <h1 style={{ fontSize: "1.4rem" }}>Kayıt — fon, seri, dosya, konum</h1>
      <p style={{ color: "#444" }}>
        US-01: benzersiz kimlik, asıl/kopya, üretici/sahip ve konum olmadan kayıt
        tamamlanmaz. Veriler sentetiktir.
      </p>
      {hata ? (
        <p role="alert" style={{ color: "#8a1f1f" }}>
          {hata}
        </p>
      ) : null}
      {bilgi ? <p role="status">{bilgi}</p> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(16rem, 1fr) minmax(22rem, 1.4fr)",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        <section>
          <h2 style={{ fontSize: "1.05rem" }}>Hiyerarşi</h2>
          {!agac ? (
            <p>Yükleniyor…</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {agac.fonlar.map((fon) => (
                <li key={fon.id} style={{ marginBottom: "0.8rem" }}>
                  <strong>
                    {fon.kod} — {fon.ad}
                  </strong>
                  <ul>
                    {fon.seriler.map((seri) => (
                      <li key={seri.id}>
                        {seri.kod} — {seri.ad}
                        <ul>
                          {seri.dosyalar.map((dosya) => (
                            <li key={dosya.id}>
                              <button
                                type="button"
                                onClick={() => void dosyaSec(dosya.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  color: dosya.id === seciliId ? "#000" : "#0b4f8a",
                                  fontWeight: dosya.id === seciliId ? 700 : 400,
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                {dosya.kod} [{dosya.durum}]
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <h2 style={{ fontSize: "1.05rem" }}>Yeni dosya</h2>
          <form onSubmit={(e) => void dosyaOlustur(e)} style={{ display: "grid", gap: "0.45rem" }}>
            <label>
              Kimlik
              <input name="kod" required minLength={3} style={{ width: "100%" }} />
            </label>
            <label>
              Konu
              <input name="konu" required minLength={3} style={{ width: "100%" }} />
            </label>
            <label>
              Seri
              <select name="seriId" required style={{ width: "100%" }}>
                {seriler.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.kod} — {s.ad}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Birim
              <select name="birimId" required style={{ width: "100%" }}>
                {agac?.birimler.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.kod} — {b.ad}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Asıl / kopya
              <select name="nushaTuru" required>
                <option value="ASIL">Asıl</option>
                <option value="KOPYA">Kopya</option>
                <option value="YETKILI_NUSHA">Yetkili nüsha</option>
              </select>
            </label>
            <label>
              Üretici birim
              <input name="ureticiBirimAd" required defaultValue="Yazı İşleri Müdürlüğü" style={{ width: "100%" }} />
            </label>
            <label>
              Sahip kurum
              <input name="sahipKurum" required defaultValue="Test İlçe Belediyesi" style={{ width: "100%" }} />
            </label>
            <label>
              Konum (isteğe bağlı; tamamlamak için gerekir)
              <select name="konumId" style={{ width: "100%" }}>
                <option value="">— yok —</option>
                {agac?.konumlar.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kod} — {konumYazi(k)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Taslak oluştur</button>
          </form>
        </section>

        <section>
          <h2 style={{ fontSize: "1.05rem" }}>Dosya</h2>
          {!detay ? (
            <p>Dosya seçin.</p>
          ) : (
            <>
              <p>
                <strong>{detay.kod}</strong> — {detay.konu}
              </p>
              <p>
                Durum: <strong>{detay.durum}</strong> · Nüsha: {detay.nushaTuru}
              </p>
              <p>
                Fon {detay.seri.fon.kod} → seri {detay.seri.kod} → birim {detay.birim.ad}
              </p>
              <p>
                Üretici: {detay.ureticiBirimAd} · Sahip: {detay.sahipKurum} · Kaynak:{" "}
                {detay.kaynakSistem}
              </p>
              <p>
                Konum:{" "}
                {detay.konum ? konumYazi(detay.konum) : <em>atanmamış — kayıt tamamlanamaz</em>}
              </p>
              {detay.durum === "TASLAK" ? (
                <p>
                  <button type="button" onClick={() => void tamamla()}>
                    Kaydı tamamla
                  </button>
                </p>
              ) : null}

              <h3 style={{ fontSize: "1rem" }}>Konum değiştir</h3>
              <form onSubmit={(e) => void konumAta(e)} style={{ display: "grid", gap: "0.4rem" }}>
                <select name="konumId" required defaultValue={detay.konum?.id}>
                  {agac?.konumlar.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.kod} — {konumYazi(k)}
                    </option>
                  ))}
                </select>
                <input name="gerekce" placeholder="Gerekçe" />
                <button type="submit">Konumu kaydet</button>
              </form>

              <h3 style={{ fontSize: "1rem" }}>Konum tarihçesi</h3>
              <ol>
                {detay.hareketler.map((h) => (
                  <li key={h.id}>
                    {new Date(h.createdAt).toLocaleString("tr-TR")} — {konumYazi(h.konum)}
                    {h.oncekiOzet ? ` (önce: ${h.oncekiOzet})` : ""}
                    {h.gerekce ? ` — ${h.gerekce}` : ""}
                  </li>
                ))}
              </ol>

              <h3 style={{ fontSize: "1rem" }}>Belgeler</h3>
              <ul>
                {detay.belgeler.map((b) => (
                  <li key={b.id} style={{ marginBottom: "1rem" }}>
                    {b.kod} · {b.tur}
                    {b.sayi ? ` ${b.sayi}` : ""} — {b.konu}
                    {b.ekler.length > 0
                      ? ` (ek: ${b.ekler.map((ek) => ek.aciklama).join("; ")})`
                      : ""}
                    <ul>
                      {(b.icerikler ?? []).map((i) => (
                        <li key={i.id}>
                          {i.rol} · {i.nesne.format} · {i.nesne.boyut} B ·{" "}
                          <a href={`/api/v1/nesneler/${i.nesne.id}`}>
                            {i.nesne.sha256.slice(0, 12)}…
                          </a>
                        </li>
                      ))}
                      {(b.taramalar ?? []).map((t) => (
                        <li key={t.id}>
                          {t.kod} · {t.cihaz} · {t.operatorAd} · {t.sayfaSayisi} s. · {t.profil} ·{" "}
                          {t.kalite}
                          {t.oncekiTaramaId ? " · yeniden tarama" : ""} ·{" "}
                          <a href={`/api/v1/nesneler/${t.nesne.id}`}>
                            {t.nesne.sha256.slice(0, 12)}…
                          </a>
                        </li>
                      ))}
                    </ul>
                    <form
                      onSubmit={(e) => void icerikYukle(e, b.id)}
                      style={{ display: "grid", gap: "0.3rem", marginTop: "0.4rem" }}
                    >
                      <input name="dosya" type="file" required />
                      <button type="submit">Özgün ikili bağla</button>
                    </form>
                    <form
                      onSubmit={(e) => void taramaYukle(e, b.id)}
                      style={{ display: "grid", gap: "0.3rem", marginTop: "0.4rem" }}
                    >
                      <input name="dosya" type="file" required />
                      <input name="cihaz" required placeholder="Cihaz" defaultValue="Lab tarayıcı A" />
                      <input name="operatorAd" required placeholder="Operatör" defaultValue="test-operator" />
                      <input name="sayfaSayisi" type="number" min={1} required defaultValue={1} />
                      <input name="profil" required placeholder="Profil" defaultValue="300dpi-renk-jpeg" />
                      <select name="kalite" defaultValue="GECTI">
                        <option value="BEKLIYOR">Kalite bekliyor</option>
                        <option value="GECTI">Kalite geçti</option>
                        <option value="KALDI">Kalite kaldı</option>
                      </select>
                      <select name="oncekiTaramaId">
                        <option value="">İlk tarama</option>
                        {(b.taramalar ?? []).map((t) => (
                          <option key={t.id} value={t.id}>
                            Yeniden tara (önceki {t.kod})
                          </option>
                        ))}
                      </select>
                      <button type="submit">Tarama kaydet</button>
                    </form>
                  </li>
                ))}
              </ul>
              <form onSubmit={(e) => void belgeEkle(e)} style={{ display: "grid", gap: "0.4rem" }}>
                <input name="kod" required placeholder="Belge kimliği" />
                <input name="tur" required placeholder="Tür" defaultValue="Yazı" />
                <input name="sayi" placeholder="Sayı" />
                <input name="konu" required placeholder="Konu" />
                <input name="uretici" required placeholder="Üretici" defaultValue="Yazı İşleri Müdürlüğü" />
                <select name="nushaTuru" required defaultValue="ASIL">
                  <option value="ASIL">Asıl</option>
                  <option value="KOPYA">Kopya</option>
                </select>
                <button type="submit">Belge ekle</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
