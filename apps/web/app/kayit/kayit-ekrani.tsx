"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, yukle } from "../lib/api";

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

type PlanSurum = {
  id: string;
  surum: number;
  sdpKodu: string;
  sureYil: number;
  dabOnayNo: string | null;
  plan: { kod: string; ad: string };
};

type DosyaDetay = DosyaOzet & {
  ureticiBirimAd: string;
  sahipKurum: string;
  kaynakSistem: string;
  seri: { kod: string; ad: string; fon: { kod: string; ad: string } };
  birim: Birim;
  belgeler: Belge[];
  hareketler: Hareket[];
  planSurum: PlanSurum | null;
  bekletmeler: { id: string; sebep: string; makam: string; aktif: boolean }[];
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
  const [planlar, setPlanlar] = useState<
    { id: string; kod: string; surumler: { id: string; surum: number }[] }[]
  >([]);

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
    void api<{ id: string; kod: string; surumler: { id: string; surum: number }[] }[]>("/api/v1/planlar")
      .then(setPlanlar)
      .catch(() => undefined);
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
    <main className="kabuk">
      <header className="sayfa-baslik">
        <h1>Tasnif ve konum</h1>
        <p>
          Dosya ancak benzersiz kod, asıl/kopya, üretici/sahip ve fiziksel konum
          ile tamamlanır.
        </p>
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

      <div className="grid-2">
        <section className="kart">
          <h2>Hiyerarşi</h2>
          {!agac ? (
            <p className="yukleniyor">Yükleniyor…</p>
          ) : (
            <ul className="agac">
              {agac.fonlar.map((fon) => (
                <li key={fon.id}>
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
                                className={`agac-dugme${dosya.id === seciliId ? " secili" : ""}`}
                                type="button"
                                onClick={() => void dosyaSec(dosya.id)}
                              >
                                {dosya.kod}{" "}
                                <span className={`rozet ${dosya.durum === "KAYITLI" ? "rozet-kayitli" : "rozet-taslak"}`}>
                                  {dosya.durum}
                                </span>
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

          <h2>Yeni dosya</h2>
          <form className="form-izgara" onSubmit={(e) => void dosyaOlustur(e)}>
            <label>
              Kimlik
              <input name="kod" required minLength={3} />
            </label>
            <label>
              Konu
              <input name="konu" required minLength={3} />
            </label>
            <label>
              Seri
              <select name="seriId" required>
                {seriler.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.kod} — {s.ad}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Birim
              <select name="birimId" required>
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
              <input name="ureticiBirimAd" required defaultValue="Yazı İşleri Müdürlüğü" />
            </label>
            <label>
              Sahip kurum
              <input name="sahipKurum" required defaultValue="Test İlçe Belediyesi" />
            </label>
            <label>
              Konum (isteğe bağlı; tamamlamak için gerekir)
              <select name="konumId">
                <option value="">— yok —</option>
                {agac?.konumlar.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kod} — {konumYazi(k)}
                  </option>
                ))}
              </select>
            </label>
            <button className="dugme-ana" type="submit">
              Taslak oluştur
            </button>
          </form>
        </section>

        <section className="kart">
          <h2>Dosya</h2>
          {!detay ? (
            <p>Dosya seçin.</p>
          ) : (
            <>
              <p>
                <strong>{detay.kod}</strong> — {detay.konu}
              </p>
              <p className="meta">
                <span className={`rozet ${detay.durum === "KAYITLI" ? "rozet-kayitli" : "rozet-taslak"}`}>
                  {detay.durum}
                </span>{" "}
                · Nüsha: {detay.nushaTuru}
              </p>
              <p className="meta">
                Fon {detay.seri.fon.kod} → seri {detay.seri.kod} → birim {detay.birim.ad}
              </p>
              <p className="meta">
                Üretici: {detay.ureticiBirimAd} · Sahip: {detay.sahipKurum} · Kaynak:{" "}
                {detay.kaynakSistem}
              </p>
              <p>
                Konum:{" "}
                {detay.konum ? konumYazi(detay.konum) : <em>atanmamış — kayıt tamamlanamaz</em>}
              </p>
              {detay.durum === "TASLAK" ? (
                <p>
                  <button className="dugme-ana" type="button" onClick={() => void tamamla()}>
                    Kaydı tamamla
                  </button>
                </p>
              ) : null}

              <h3>Saklama planı</h3>
              <p className="meta">
                {detay.planSurum
                  ? `${detay.planSurum.plan.kod} sürüm ${detay.planSurum.surum} · ${detay.planSurum.sureYil} yıl · SDP ${detay.planSurum.sdpKodu}`
                  : "Bağlı plan yok — imha adayı olamaz"}
              </p>
              {!detay.planSurum ? (
                <form
                  className="form-izgara"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const id = String(new FormData(e.currentTarget).get("planSurumId"));
                    void api(`/api/v1/dosyalar/${detay.id}/plan`, {
                      method: "POST",
                      body: JSON.stringify({ planSurumId: id }),
                    })
                      .then(() => dosyaSec(detay.id))
                      .then(() => setBilgi("Plan bağlandı; geriye dönük değiştirilemez."))
                      .catch((err: Error) => setHata(err.message));
                  }}
                >
                  <label>
                    Plan sürümü
                    <select name="planSurumId" required>
                      {planlar.flatMap((p) =>
                        p.surumler.map((s) => (
                          <option key={s.id} value={s.id}>
                            {p.kod} v{s.surum}
                          </option>
                        )),
                      )}
                    </select>
                  </label>
                  <button type="submit">Planı bağla</button>
                </form>
              ) : null}

              <h3>Hukukî bekletme</h3>
              <ul>
                {detay.bekletmeler.length === 0 ? <li>Aktif bekletme yok</li> : detay.bekletmeler.map((b) => (
                  <li key={b.id}>
                    {b.sebep} — {b.makam}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        void api(`/api/v1/bekletme/${b.id}/kaldir`, { method: "POST" })
                          .then(() => dosyaSec(detay.id))
                          .catch((err: Error) => setHata(err.message))
                      }
                    >
                      Kaldır
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="form-izgara"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void api(`/api/v1/dosyalar/${detay.id}/bekletme`, {
                    method: "POST",
                    body: JSON.stringify({
                      sebep: String(f.get("sebep")),
                      makam: String(f.get("makam")),
                    }),
                  })
                    .then(() => dosyaSec(detay.id))
                    .then(() => setBilgi("Bekletme kondu; imha adayı olamaz."))
                    .catch((err: Error) => setHata(err.message));
                }}
              >
                <label>
                  Sebep
                  <input name="sebep" required minLength={3} />
                </label>
                <label>
                  Makam
                  <input name="makam" required minLength={2} />
                </label>
                <button type="submit">Bekletme koy</button>
              </form>

              <h3>Konum değiştir</h3>
              <form className="form-izgara" onSubmit={(e) => void konumAta(e)}>
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

              <h3>Konum tarihçesi</h3>
              <ol className="zaman-cizelgesi">
                {detay.hareketler.map((h) => (
                  <li key={h.id}>
                    {new Date(h.createdAt).toLocaleString("tr-TR")} — {konumYazi(h.konum)}
                    {h.oncekiOzet ? ` (önce: ${h.oncekiOzet})` : ""}
                    {h.gerekce ? ` — ${h.gerekce}` : ""}
                  </li>
                ))}
              </ol>

              <h3>Belgeler</h3>
              <ul className="agac">
                {detay.belgeler.map((b) => (
                  <li className="belge-kart" key={b.id}>
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
                    <form className="form-izgara" onSubmit={(e) => void icerikYukle(e, b.id)}>
                      <input name="dosya" type="file" required />
                      <button type="submit">Özgün ikili bağla</button>
                    </form>
                    <form className="form-izgara" onSubmit={(e) => void taramaYukle(e, b.id)}>
                      <input name="dosya" type="file" required />
                      <input name="cihaz" required placeholder="Cihaz" defaultValue="Tarayıcı 1" />
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
              <form className="form-izgara" onSubmit={(e) => void belgeEkle(e)}>
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
