# Arşiv yazılımı — geliştirme listesi

Kaynak: `02-GEREKSINIMLER.md` (FR/US), `03-MIMARI.md`.  
Test ortamı: sentetik veri; gerçek KVKK / kişisel veri yok.  
Durum tarihi: 31 Ağustos 2026.

Kodla kapanan çekirdek ve personel yüzü çalışır. Kurum keşfi (DAB onaylı gerçek plan, oda sayımı, gerçek EBYS ürünü) bu repoda yapılamaz.

## Altyapı

| ID | Durum |
|---|---|
| T-00…T-04 | **bitti** |
| T-05 PAT iptali | **açık** — sohbette görünen token’ı GitHub’dan sen iptal et |
| T-06 Alan + HTTPS | **sonra** — alan adı yok |

## Dilimler 0–2

İskelet, kayıt, MinIO/tarama, kurumsal arayüz: **bitti**.

## Dilim 3–9

| ID | İş | Durum |
|---|---|---|
| T-40…T-45 | Kimlik, rol, birim süzgeci, SoD, denetim zinciri + doğrula | **bitti** |
| T-50…T-54 | Saklama, bekletme, ödünç/uzatma, yetkili + OCR metin arama | **bitti** |
| T-60…T-63 | İmha: süre/plan kapısı, 5 oy + çoğunluk, icrada IMHA_EDILDI | **bitti** |
| T-70…T-73 | Talep, vekâlet, iş günü SLA, vatandaş `/basvuru` (arama yok) | **bitti** |
| T-80…T-82 | EYP/imza/entegrasyon kuyruk (dış servis yok; idempotans var) | **lab** |
| T-90…T-94 | İçe aktarım kuyruğu, devir JSON, yapılandırma, yedek raporu | **bitti** |
| T-A0 | OCR önerisi, onaysız yazmaz | **bitti** |
| T-A1 | Ayrı OpenSearch | **sonra** — Postgres `ara` yeterli test için |
| T-A2 | e-Devlet iç arama | **yapılmaz** — vatandaş yüzü yalnız başvuru |
| T-A3 | Native mobil | **sonra** — API-first + web |
| T-A4 | WCAG AA tam tur | **kısmi** — etiket, odak, kontrast; resmi kabul turu yok |
| T-A5 | HTTPS | **sonra** — alan adı yok |

Test hesapları (şifre `Lab-2026!`): arsiv, birim, denetci, bilisim, komisyon…komisyon5, yonetici.
