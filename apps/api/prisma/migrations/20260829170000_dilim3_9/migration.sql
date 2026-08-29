CREATE TYPE "Rol" AS ENUM ('ARSIV_MEMURU', 'BIRIM_SORUMLUSU', 'DENETCI', 'BILISIM', 'KOMISYON', 'UST_YONETICI');
CREATE TYPE "OduncDurumu" AS ENUM ('ACIK', 'IADE');
CREATE TYPE "ImhaAsama" AS ENUM ('ADAY', 'KOMISYON', 'DAB_GORUS', 'UST_ONAY', 'ICRA', 'IPTAL');
CREATE TYPE "TalepTuru" AS ENUM ('SURET', 'INCELEME', 'BILGI_EDINME', 'DILEKCE', 'KVKK');
CREATE TYPE "TalepDurumu" AS ENUM ('ACIK', 'CEVAPLANDI', 'RED');
CREATE TYPE "IletisimDurumu" AS ENUM ('BEKLIYOR', 'ISLENDI', 'HATA');

CREATE TABLE "Kullanici" (
    "id" UUID NOT NULL,
    "kullaniciAdi" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sifreOzet" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "birimId" UUID,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Kullanici_kullaniciAdi_key" ON "Kullanici"("kullaniciAdi");
ALTER TABLE "Kullanici" ADD CONSTRAINT "Kullanici_birimId_fkey" FOREIGN KEY ("birimId") REFERENCES "Birim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "DenetimOlayi" (
    "id" UUID NOT NULL,
    "sira" SERIAL NOT NULL,
    "aktorId" TEXT,
    "aktorAd" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "islem" TEXT NOT NULL,
    "yol" TEXT NOT NULL,
    "nesneTur" TEXT,
    "nesneId" TEXT,
    "ozet" TEXT NOT NULL,
    "oncekiHash" TEXT,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DenetimOlayi_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DenetimOlayi_sira_key" ON "DenetimOlayi"("sira");

CREATE TABLE "SaklamaPlani" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaklamaPlani_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SaklamaPlani_kod_key" ON "SaklamaPlani"("kod");

CREATE TABLE "SaklamaSurumu" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "surum" INTEGER NOT NULL,
    "yururluk" TIMESTAMP(3) NOT NULL,
    "sdpKodu" TEXT NOT NULL,
    "sureYil" INTEGER NOT NULL,
    "baslangicOlayi" TEXT NOT NULL,
    "dabOnayNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaklamaSurumu_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SaklamaSurumu_planId_surum_key" ON "SaklamaSurumu"("planId", "surum");
ALTER TABLE "SaklamaSurumu" ADD CONSTRAINT "SaklamaSurumu_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SaklamaPlani"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Dosya" ADD COLUMN "planSurumId" UUID;
ALTER TABLE "Dosya" ADD COLUMN "baslangicOlayi" TEXT;
ALTER TABLE "Dosya" ADD CONSTRAINT "Dosya_planSurumId_fkey" FOREIGN KEY ("planSurumId") REFERENCES "SaklamaSurumu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "HukukiBekletme" (
    "id" UUID NOT NULL,
    "dosyaId" UUID NOT NULL,
    "sebep" TEXT NOT NULL,
    "makam" TEXT NOT NULL,
    "baslangic" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitis" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HukukiBekletme_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "HukukiBekletme" ADD CONSTRAINT "HukukiBekletme_dosyaId_fkey" FOREIGN KEY ("dosyaId") REFERENCES "Dosya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Odunc" (
    "id" UUID NOT NULL,
    "dosyaId" UUID NOT NULL,
    "talepEden" TEXT NOT NULL,
    "birimAd" TEXT NOT NULL,
    "teslimTarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sonTarih" TIMESTAMP(3) NOT NULL,
    "iadeTarih" TIMESTAMP(3),
    "durum" "OduncDurumu" NOT NULL DEFAULT 'ACIK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Odunc_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Odunc" ADD CONSTRAINT "Odunc_dosyaId_fkey" FOREIGN KEY ("dosyaId") REFERENCES "Dosya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ImhaListesi" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "asama" "ImhaAsama" NOT NULL DEFAULT 'ADAY',
    "hazirlayan" TEXT NOT NULL,
    "dabGorusNo" TEXT,
    "ustOnaylayan" TEXT,
    "tutanakOzet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImhaListesi_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ImhaListesi_kod_key" ON "ImhaListesi"("kod");

CREATE TABLE "ImhaAday" (
    "id" UUID NOT NULL,
    "listeId" UUID NOT NULL,
    "dosyaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImhaAday_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ImhaAday_listeId_dosyaId_key" ON "ImhaAday"("listeId", "dosyaId");
ALTER TABLE "ImhaAday" ADD CONSTRAINT "ImhaAday_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "ImhaListesi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ImhaAday" ADD CONSTRAINT "ImhaAday_dosyaId_fkey" FOREIGN KEY ("dosyaId") REFERENCES "Dosya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ImhaOy" (
    "id" UUID NOT NULL,
    "listeId" UUID NOT NULL,
    "uyeAd" TEXT NOT NULL,
    "kabul" BOOLEAN NOT NULL,
    "gerekce" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImhaOy_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ImhaOy" ADD CONSTRAINT "ImhaOy_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "ImhaListesi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Talep" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "tur" "TalepTuru" NOT NULL,
    "durum" "TalepDurumu" NOT NULL DEFAULT 'ACIK',
    "basvuranAd" TEXT NOT NULL,
    "vekaletVar" BOOLEAN NOT NULL DEFAULT false,
    "vekilAd" TEXT,
    "vekaletSure" TIMESTAMP(3),
    "dosyaId" UUID,
    "konu" TEXT NOT NULL,
    "sonTarih" TIMESTAMP(3) NOT NULL,
    "karar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Talep_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Talep_kod_key" ON "Talep"("kod");
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_dosyaId_fkey" FOREIGN KEY ("dosyaId") REFERENCES "Dosya"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "KarartilmisKopya" (
    "id" UUID NOT NULL,
    "talepId" UUID NOT NULL,
    "kaynakNesneId" UUID NOT NULL,
    "kaynakHash" TEXT NOT NULL,
    "kopyaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KarartilmisKopya_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "KarartilmisKopya" ADD CONSTRAINT "KarartilmisKopya_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "Talep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KarartilmisKopya" ADD CONSTRAINT "KarartilmisKopya_kaynakNesneId_fkey" FOREIGN KEY ("kaynakNesneId") REFERENCES "Nesne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "EypPaket" (
    "id" UUID NOT NULL,
    "belgeId" UUID NOT NULL,
    "paketHash" TEXT NOT NULL,
    "teslimDelili" TEXT NOT NULL,
    "yon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EypPaket_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "EypPaket" ADD CONSTRAINT "EypPaket_belgeId_fkey" FOREIGN KEY ("belgeId") REFERENCES "Belge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ImzaKaniti" (
    "id" UUID NOT NULL,
    "belgeId" UUID NOT NULL,
    "durum" TEXT NOT NULL,
    "kuyruk" BOOLEAN NOT NULL DEFAULT false,
    "ozet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImzaKaniti_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ImzaKaniti" ADD CONSTRAINT "ImzaKaniti_belgeId_fkey" FOREIGN KEY ("belgeId") REFERENCES "Belge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "EntegrasyonIletisi" (
    "id" UUID NOT NULL,
    "sistem" TEXT NOT NULL,
    "disKimlik" TEXT NOT NULL,
    "idempotans" TEXT NOT NULL,
    "yon" TEXT NOT NULL,
    "durum" "IletisimDurumu" NOT NULL DEFAULT 'BEKLIYOR',
    "hata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntegrasyonIletisi_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EntegrasyonIletisi_idempotans_key" ON "EntegrasyonIletisi"("idempotans");

CREATE TABLE "IceAktarim" (
    "id" UUID NOT NULL,
    "kaynak" TEXT NOT NULL,
    "satirOzet" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'KUYRUK',
    "kaynakSilindi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IceAktarim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "YapilandirmaSurumu" (
    "id" UUID NOT NULL,
    "anahtar" TEXT NOT NULL,
    "surum" INTEGER NOT NULL,
    "deger" TEXT NOT NULL,
    "onayli" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "YapilandirmaSurumu_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "YapilandirmaSurumu_anahtar_surum_key" ON "YapilandirmaSurumu"("anahtar", "surum");

CREATE TABLE "FizikselRisk" (
    "id" UUID NOT NULL,
    "tur" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FizikselRisk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OcrOneri" (
    "id" UUID NOT NULL,
    "belgeId" UUID NOT NULL,
    "metin" TEXT NOT NULL,
    "onaylandi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OcrOneri_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "OcrOneri" ADD CONSTRAINT "OcrOneri_belgeId_fkey" FOREIGN KEY ("belgeId") REFERENCES "Belge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
