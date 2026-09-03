# Arşiv

Belediye arşiv yazılımı. Teslim notu: [TESLIM.md](./TESLIM.md).

Geliştirme GitHub `main`; test sunucusu oradan çeker.

## Yerel

```bash
cp .env.example .env
npm install
npm test
npm run build
```

## Sunucu

`/opt/lab/apps/arsiv` içinde `bash deploy.sh`.

- Web: `/` · Giriş: `/giris` · Tasnif: `/kayit` · İşlemler: `/is`
- Yönetim: `/yonetim` · Vatandaş: `/basvuru` · Kılavuz: `/kilavuz`
- API sağlık: `/api/v1/health`
- Doğrulama: `bash scripts/teslim-dogrula.sh`
