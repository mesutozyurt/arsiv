-- CreateEnum
CREATE TYPE "NushaTuru" AS ENUM ('ASIL', 'KOPYA', 'YETKILI_NUSHA');

-- CreateEnum
CREATE TYPE "DosyaDurumu" AS ENUM ('TASLAK', 'KAYITLI');

-- CreateTable
CREATE TABLE "Birim" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "ustId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Birim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fon" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "ureticiKurum" TEXT NOT NULL,
    "sahipKurum" TEXT NOT NULL,
    "kapsamBaslangic" TIMESTAMP(3),
    "kapsamBitis" TIMESTAMP(3),
    "devralmaDayanagi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seri" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "fonId" UUID NOT NULL,
    "birimId" UUID,
    "islev" TEXT,
    "sdpKodu" TEXT,
    "gizlilik" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FizikselKonum" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "oda" TEXT NOT NULL,
    "raf" TEXT NOT NULL,
    "dolap" TEXT,
    "kutu" TEXT NOT NULL,
    "klasor" TEXT,
    "barkod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FizikselKonum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dosya" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "konu" TEXT NOT NULL,
    "seriId" UUID NOT NULL,
    "birimId" UUID NOT NULL,
    "nushaTuru" "NushaTuru" NOT NULL,
    "ureticiBirimAd" TEXT NOT NULL,
    "sahipKurum" TEXT NOT NULL,
    "kaynakSistem" TEXT NOT NULL DEFAULT 'ARSIV',
    "durum" "DosyaDurumu" NOT NULL DEFAULT 'TASLAK',
    "konumId" UUID,
    "tarihBaslangic" TIMESTAMP(3),
    "tarihBitis" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dosya_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KonumHareketi" (
    "id" UUID NOT NULL,
    "dosyaId" UUID NOT NULL,
    "konumId" UUID NOT NULL,
    "oncekiOzet" TEXT,
    "gerekce" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KonumHareketi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Belge" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "dosyaId" UUID NOT NULL,
    "tur" TEXT NOT NULL,
    "sayi" TEXT,
    "tarih" TIMESTAMP(3),
    "konu" TEXT NOT NULL,
    "kaynak" TEXT NOT NULL DEFAULT 'ARSIV',
    "uretici" TEXT NOT NULL,
    "nushaTuru" "NushaTuru" NOT NULL,
    "gizlilik" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Belge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ek" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "belgeId" UUID NOT NULL,
    "sira" INTEGER NOT NULL,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ek_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Birim_kod_key" ON "Birim"("kod");
CREATE UNIQUE INDEX "Fon_kod_key" ON "Fon"("kod");
CREATE UNIQUE INDEX "Seri_kod_key" ON "Seri"("kod");
CREATE UNIQUE INDEX "FizikselKonum_kod_key" ON "FizikselKonum"("kod");
CREATE UNIQUE INDEX "FizikselKonum_barkod_key" ON "FizikselKonum"("barkod");
CREATE UNIQUE INDEX "Dosya_kod_key" ON "Dosya"("kod");
CREATE UNIQUE INDEX "Belge_kod_key" ON "Belge"("kod");
CREATE UNIQUE INDEX "Ek_kod_key" ON "Ek"("kod");

CREATE INDEX "Seri_fonId_idx" ON "Seri"("fonId");
CREATE INDEX "Dosya_seriId_idx" ON "Dosya"("seriId");
CREATE INDEX "Dosya_konumId_idx" ON "Dosya"("konumId");
CREATE INDEX "Belge_dosyaId_idx" ON "Belge"("dosyaId");

ALTER TABLE "Birim" ADD CONSTRAINT "Birim_ustId_fkey" FOREIGN KEY ("ustId") REFERENCES "Birim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Seri" ADD CONSTRAINT "Seri_fonId_fkey" FOREIGN KEY ("fonId") REFERENCES "Fon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Seri" ADD CONSTRAINT "Seri_birimId_fkey" FOREIGN KEY ("birimId") REFERENCES "Birim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Dosya" ADD CONSTRAINT "Dosya_seriId_fkey" FOREIGN KEY ("seriId") REFERENCES "Seri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dosya" ADD CONSTRAINT "Dosya_birimId_fkey" FOREIGN KEY ("birimId") REFERENCES "Birim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dosya" ADD CONSTRAINT "Dosya_konumId_fkey" FOREIGN KEY ("konumId") REFERENCES "FizikselKonum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KonumHareketi" ADD CONSTRAINT "KonumHareketi_dosyaId_fkey" FOREIGN KEY ("dosyaId") REFERENCES "Dosya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KonumHareketi" ADD CONSTRAINT "KonumHareketi_konumId_fkey" FOREIGN KEY ("konumId") REFERENCES "FizikselKonum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Belge" ADD CONSTRAINT "Belge_dosyaId_fkey" FOREIGN KEY ("dosyaId") REFERENCES "Dosya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ek" ADD CONSTRAINT "Ek_belgeId_fkey" FOREIGN KEY ("belgeId") REFERENCES "Belge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
