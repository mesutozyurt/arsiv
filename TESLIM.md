# Anahtar teslim — kurum arşivi

**Tarih:** 3 Eylül 2026  
**Sürüm:** `main` @ `c246e0e`  
**Ortam:** test VPS `http://194.62.55.69` — sentetik veri, gerçek kişisel veri yok

## Ne teslim edildi

Çalışan arşiv uygulaması: NestJS API + Next.js personel/vatandaş yüzü, PostgreSQL, MinIO, Redis, Caddy. GitHub `main` → sunucu `deploy.sh`.

| Ekran | Adres |
|---|---|
| Ana sayfa | `/` |
| Personel girişi | `/giris` |
| Tasnif / konum / tarama | `/kayit` |
| Ödünç, imha, talep, denetim, rapor | `/is` |
| Yönetim | `/yonetim` |
| Vatandaş başvurusu (arama yok) | `/basvuru` |
| Kısa kılavuz | `/kilavuz` |

Test hesapları, şifre `Lab-2026!`: `arsiv`, `birim`, `denetci`, `bilisim`, `komisyon`…`komisyon5`, `yonetici`.

## Kapılar (yazılım)

- Dosya konum olmadan tamamlanmaz.
- Ödünç: aynı asıl ikinci kişiye verilmez; uzatma var.
- İmha: plan + süre dolumu; 5 komisyon oyu ve çoğunluk; DAB; üst onay; icrada `IMHA_EDILDI`; içerik indirilemez.
- Talep süreleri iş günü (2026 tatil listesi).
- Vatandaş iç arşivi arayamaz.
- OCR önerisi onaysız yazılmaz; `/is` OCR onay sekmesinde uygulanır.
- Denetim günlüğü hash zinciri `/yonetim` üzerinden doğrulanır.
- Devir paketi JSON indirilir; kaynak Excel kuyruğa alınır, silinmez.

## Sizin yapmanız gerekenler (yazılım bitmez)

1. Sohbette geçen GitHub token’ını **iptal edin** (T-05).
2. Alan adı alınca HTTPS (T-06).
3. Kurumsal kimlik (AD/Keycloak) bağlayın.
4. Gerçek EBYS / EYP 2.1 / e-imza ürününü bağlayın — şu an kuyruk iskeleti.
5. DAB onaylı saklama planını ve oda-raf envanterini yükleyin.
6. Canlıya gerçek evrak koymayın; bu test ortamıdır.

## İşletim

```bash
cd /opt/lab/apps/arsiv
bash deploy.sh          # git fetch + reset origin/main + compose build
bash scripts/yedek.sh   # postgres dump notu
```

Yerel: `_repo` içinde `npm install && npm test && npm run build`.
