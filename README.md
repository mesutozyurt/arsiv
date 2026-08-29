# Arşiv

Belediye arşiv yazılımı. Geliştirme GitHub `main` üzerindedir; test sunucusu oradan çeker.

## Yerel

```bash
cp .env.example .env
npm install
npm run build
```

## Sunucu

`/opt/lab/apps/arsiv` içinde `./deploy.sh` — `git pull` + `docker compose up`.

- Web: `/`
- Kayıt: `/kayit`
- API sağlık: `/api/v1/health`
- Ağaç: `/api/v1/agac`
- Nesne indir: `/api/v1/nesneler/:id`
- Giriş: `/giris` (lab: `arsiv` / `Lab-2026!`)
- İşlemler: `/is`
