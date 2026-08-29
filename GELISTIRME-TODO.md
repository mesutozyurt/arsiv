# Arşiv yazılımı — geliştirme listesi

Kaynak: `02-GEREKSINIMLER.md` (FR/US), `03-MIMARI.md`.  
Test ortamı: sentetik veri; gerçek KVKK / kişisel veri yok.  
Durum tarihi: 29 Ağustos 2026.

Her dilim bitmeden sonrakine geçilmez. Kabul: ilgili API + web ekranı + sunucuda `deploy.sh` sonrası gözlemlenen davranış.

## Altyapı (doğrulandı)

| ID | İş | Durum | Kanıt |
|---|---|---|---|
| T-00 | Yerel `main` → GitHub | **bitti** | Dilim 1 sonrası yeni `main` SHA |
| T-01 | Sunucu SSH + Docker lab (Caddy, `lab_edge`) | **bitti** | `194.62.55.69`: `lab-caddy`, API/Postgres sağlıklı; `/lab/health` → `ok` |
| T-02 | Sunucu `origin` URL + GitHub’a ağ | **bitti** | `/opt/lab/apps/arsiv` remote `https://github.com/mesutozyurt/arsiv.git` |
| T-03 | Sunucu çalışma kopyası = `origin/main` | **bitti** | `deploy.sh` sonrası HEAD `ebe6ee9` (Dilim 1 deploy’u bunu günceller) |
| T-04 | `arsiv-web` sağlık kontrolü | **bitti** | `HOSTNAME=0.0.0.0`; `/health` → `ok`; konteyner `healthy` |
| T-05 | GitHub Classic PAT’i sohbet sonrası iptal / yenile | **açık** | Token sohbette göründü |
| T-06 | Alt alan + HTTPS (Caddy) | **sonra** | Alan adı yok; şimdilik IP / sslip.io |

## Dilim 0 — bağ ve iskelet (mevcut)

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-10 | Nest API + Next web + Compose + CI | — | **bitti** |
| T-11 | Sunucuyu `./deploy.sh` ile `origin/main`’e kilitle | — | **bitti** (iskelet); Dilim 1 için yeniden çalıştırılacak |

## Dilim 1 — kayıt çekirdeği (ilk yazılım)

Fon → seri → birim → dosya → belge + fiziksel konum. Kimlik, asıl/kopya, konum olmadan kayıt kapanmaz.

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-20 | PostgreSQL şeması / migrasyon (Prisma) | FR-01 | **bitti** |
| T-21 | Değişmez kayıt kimliği; üretici birim, sahip kurum, asıl/kopya, kaynak sistem | FR-01 | **bitti** |
| T-22 | Fon, seri, birim, dosya, belge, ek hiyerarşisi ve ilişkiler | FR-02, US-01 | **bitti** |
| T-23 | Oda–raf–dolap–kutu–klasör + barkod; konum hareket geçmişi | FR-04, US-01 | **bitti** |
| T-24 | REST: listele / oluştur / güncelle / getir (yetki yokken lab-only) | FR-01–02, FR-04 | **bitti** |
| T-25 | Next: ağaç + dosya formu + konum | US-01 | **bitti** |
| T-26 | Sentetik tohum veri (kişisel veri yok) | — | **bitti** |
| T-27 | Zorunlu alan kapısı: kimlik / asıl-kopya / konum olmadan dosya tamamlanmaz | US-01 | **bitti** |

## Dilim 2 — nesne deposu ve tarama bağı

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-30 | MinIO (Compose) + içerik hash; özgün üzerine yazma yok | mimari | **bitti** |
| T-31 | Belgeye ikili bağlama (format, boyut, hash) | FR-01, FR-02 | **bitti** |
| T-32 | Tarama işi kaydı: cihaz, operatör, sayfa, profil, kalite, hash | FR-05, US-03 | **bitti** |
| T-33 | Yeniden tarama önceki görüntüyü silmez | FR-05 | **bitti** |

## Dilim 3 — kimlik, yetki, denetim

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-40 | Lab kimliği (önce yerel kullanıcı; sonra Keycloak/OIDC) | FR-12, NFR-05 | açık |
| T-41 | Rol: arşiv memuru, birim sorumlusu, denetçi, bilişim (içerik kapalı) | FR-12, US-17 | açık |
| T-42 | Birim / seri / gizlilik süzgeçli erişim | FR-12 | açık |
| T-43 | Görevler ayrılığı iskeleti (imha/onay çakışması) | FR-12 | açık |
| T-44 | Denetim günlüğü: kim-ne-zaman; görüntüleme ve arama dahil | FR-13, US-13 | açık |
| T-45 | Günlük satırı uygulama/yönetici tarafından silinemez | FR-13, NFR-07 | açık |

## Dilim 4 — saklama, ödünç, arama

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-50 | SDP + sürümlü saklama planı; eski dosya eski sürüme bağlı kalır | FR-03, US-02 | açık |
| T-51 | Saklama süresi hesabı + hukukî bekletme | FR-09, US-06 | açık |
| T-52 | Kurum içi ödünç / iade / ikinci teslim yasağı | FR-08, US-05 | açık |
| T-53 | Yetkili üst veri araması (önce Postgres; sonra ayrı indeks) | FR-07, US-04 | açık |
| T-54 | Yetkisiz arama sonuç/snippet sızdırmaz | FR-07 | açık |

## Dilim 5 — imha ve takvim

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-60 | İmha yalnız aday liste; otomatik silme yok | FR-10, US-07 | açık |
| T-61 | Komisyon, oy, DAB görüş kapısı, üst onay, tutanak sırası | FR-10, US-08, US-09 | açık |
| T-62 | Onaylı imhanın bütün kopyalara yayılması + 10 yıllık kanıt (içerik yok) | FR-11 | açık |
| T-63 | Yıllık kontrol, devir, komisyon, geciken ödünç/başvuru raporları | FR-18 | açık |

## Dilim 6 — vatandaş / KVKK talep (arşiv içi, portal değil)

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-70 | Suret / inceleme / bilgi edinme / dilekçe kaydı ve iş günü takvimi | FR-16, US-10 | açık |
| T-71 | Vekâlet kapsamı ve süresi | FR-16, US-11 | açık |
| T-72 | Kayıt bazında işleme şartı, kategori, saklama/bekletme çatışması | FR-17, US-12 | açık |
| T-73 | Karartılmış erişim kopyası aslı değiştirmez | FR-07, FR-16 | açık |

## Dilim 7 — EYP / EBYS / imza (lab adaptörü)

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-80 | EYP 2.1 paket içe/dışa + hash / teslim delili iskeleti | FR-14, US-15 | açık |
| T-81 | İmza/zaman damgası doğrulama kanıtı (dış servis yoksa kuyruk) | FR-15 | açık |
| T-82 | Entegrasyon iletisi: dış kimlik, idempotans, hata kuyruğu | FR-21 | açık |

## Dilim 8 — geçiş, çıkış, süreklilik

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-90 | Excel/eski liste içe aktarma kuyruğu; kaynak kabulden önce silinmez | FR-23 | açık |
| T-91 | DAB / yeni sistem toplu paket (hiyerarşi + hash mutabakatı) | FR-22, US-16 | açık |
| T-92 | Yapılandırma / plan / şema sürümleme ve onay | FR-24 | açık |
| T-93 | Yedek + tutarlı geri yükleme tatbikatı (içerik+üst veri+günlük) | FR-19, US-14 | açık |
| T-94 | Fiziksel risk / kesinti sonrası kontrollü kayıt | FR-20 | açık |

## Dilim 9 — sonra (MVP kapısı değil)

| ID | İş | FR/US | Durum |
|---|---|---|---|
| T-A0 | OCR / sınıflandırma / karartma önerisi; insan onayı olmadan yazmaz | FR-06 | sonra |
| T-A1 | OpenSearch / Meilisearch tam metin | FR-07 | sonra |
| T-A2 | e-Devlet / e-Belediye durum-suret yüzü (iç arama değil) | FR-21 | sonra |
| T-A3 | Mobil istemci (API-first) | — | sonra |
| T-A4 | WCAG 2.2 AA kabul turu | NFR-03, US-18 | sonra |
| T-A5 | Alan adı + HTTPS | — | sonra |

## Kod değil — kurum keşfi (yazılımı bloklar, bu repoda yapılmaz)

DAB onaylı saklama planı, oda/raf sayımı, mevcut EBYS ürün/API, gölge Excel envanteri, TS 13298 tam metin, RPO/RTO imzası. Bunlar gelmeden gerçek imha ve tarama kapasitesi dondurulmaz.

## Sıra

1. T-03 + T-04 (sunucu git kilidi, web health)  
2. Dilim 1 (T-20…T-27)  
3. Dilim 2 → 3 → 4 … belgedeki MVP kapılarına kadar
