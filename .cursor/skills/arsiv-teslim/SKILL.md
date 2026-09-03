---
name: arsiv-teslim
description: >-
  Unattended key-handover loop for the municipal archive app in c:\arsiv-master\_repo.
  Use when the user asks for anahtar teslim, unattended delivery, remaining archive
  work, or to keep checking while they are away. Makes product decisions, verifies
  live, commits/pushes/deploys until TESLIM-DURUM.md says TESLIM.
---

# Arşiv anahtar teslim

## Yetki (bu sohbette verildi)

Kararları ajan verir. Commit, `main` push ve VPS `deploy.sh` yetkilidir.
Alıntı: "kararları sen ver ve projeyi teslim et".

Sırlar: sohbet şifre/token’ını dosyaya yazma; remote URL’de token bırakma.

## Teslim tanımı

**TESLIM** = test VPS’te çalışan, memurun kullanacağı arşiv yazılımı + `TESLIM.md`.

Bu **değildir**: gerçek EBYS, e-imza HSM, alan adı+HTTPS, DAB onaylı gerçek plan, oda sayımı, OpenSearch, native mobil, resmi WCAG AA belgesi. Bunları icat etme; `TESLIM.md` kurum kaleminde bırak.

## Her tik

1. `TESLIM-DURUM.md` oku. `status: TESLIM` ve son doğrulama yeşilse **döngüyü durdur** (PID öldür, yeni sleep kurma).
2. Değilse `GELISTIRME-TODO.md` + çalışan kod ile tek kodlanabilir açığı kapat.
3. `npm run lint` ve `npm run build` (ve varsa `npm test`) yeşil olmadan push yok.
4. Push + VPS `bash deploy.sh`. Web 502 ise 10 sn bekle, tekrar ölç.
5. Gözlem: `/lab/health`, `/`, `/giris`, `/kayit`, `/is`, `/basvuru`, `/yonetim`; giriş `arsiv` + `GET /api/v1/dosyalar`.
6. `TESLIM-DURUM.md` güncelle. Kurum kalemi kaldıysa `status: TESLIM` yaz — o durdurma sinyalidir.

## Karar varsayılanları

- Yığın: NestJS + Next.js + Compose. K8s/mikroservis yok.
- Vatandaş arşiv arayamaz; yalnız `/basvuru`.
- İmha otomatik silmez; 5 oy + çoğunluk + DAB + üst onay.
- Sentetik veri. Gerçek KVKK yükleme.
- Tasarım: `globals.css` kurum defteri; çıplak HTML geri getirme.

## Dur

Üç tik üst üste kod değişikliği yok ve canlı sağlık yeşil; veya `status: TESLIM`.
Dış blok (DNS, SSH, PAT): `TESLIM-DURUM.md`’ye yaz, dur.

Çalışma kopyası: `c:\arsiv-master\_repo`. Sunucu: `194.62.55.69`, `/opt/lab/apps/arsiv`.
