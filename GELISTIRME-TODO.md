# Arşiv yazılımı — geliştirme listesi

Kaynak: `02-GEREKSINIMLER.md` (FR/US), `03-MIMARI.md`.  
Test ortamı: sentetik veri; gerçek KVKK / kişisel veri yok.  
Durum tarihi: 29 Ağustos 2026.

Lab kabulü: API + web + `deploy.sh` sonrası gözlemlenen davranış. Kurum keşfi (DAB planı, oda sayımı, gerçek EBYS) bu repoda yapılamaz.

## Altyapı

| ID | Durum |
|---|---|
| T-00…T-04 | **bitti** |
| T-05 PAT iptali | **açık** — sohbette görünen token’ı GitHub’dan sen iptal et |
| T-06 Alan + HTTPS | **sonra** — alan adı yok |

## Dilimler 0–2

İskelet, kayıt çekirdeği, MinIO/tarama: **bitti**.

## Dilim 3–9 (lab)

| ID | İş | Durum |
|---|---|---|
| T-40…T-45 | Kimlik, rol, birim süzgeci, SoD, denetim zinciri, silinemez günlük | **bitti** |
| T-50…T-54 | Saklama sürümü, bekletme, ödünç, yetkili arama | **bitti** |
| T-60…T-63 | İmha kapıları, 10 yıl kanıt özeti, rapor | **bitti** |
| T-70…T-73 | Talep/vekâlet, KVKK çatışma, karartılmış kopya (asıl hash ayrı) | **bitti** |
| T-80…T-82 | EYP/imza kuyruk/entegrasyon idempotans | **bitti** |
| T-90…T-94 | İçe aktarım, devir paketi, yapılandırma sürümü, yedek raporu, risk | **bitti** |
| T-A0 | OCR önerisi, onaysız yazmaz | **bitti** (lab) |
| T-A1 | Ayrı tam metin indeksi | Postgres `ara` — ayrı motor yok |
| T-A2 | e-Devlet yüzü | stub (`raporlar.kanalDurum`) |
| T-A3 | Mobil | API-first mevcut |
| T-A4 | WCAG AA turu | temel etiketler; tam kabul turu yok |
| T-A5 | HTTPS | alan yok |

Lab kullanıcıları (şifre `Lab-2026!`): arsiv, birim, denetci, bilisim, komisyon, yonetici.
