CREATE TYPE "IcerikRolu" AS ENUM ('OZGUN', 'TUREV');
CREATE TYPE "KaliteSonucu" AS ENUM ('BEKLIYOR', 'GECTI', 'KALDI');

CREATE TABLE "Nesne" (
    "id" UUID NOT NULL,
    "sha256" TEXT NOT NULL,
    "boyut" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "depoAnahtari" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Nesne_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BelgeIcerik" (
    "id" UUID NOT NULL,
    "belgeId" UUID NOT NULL,
    "nesneId" UUID NOT NULL,
    "rol" "IcerikRolu" NOT NULL DEFAULT 'OZGUN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BelgeIcerik_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tarama" (
    "id" UUID NOT NULL,
    "kod" TEXT NOT NULL,
    "belgeId" UUID NOT NULL,
    "nesneId" UUID NOT NULL,
    "cihaz" TEXT NOT NULL,
    "operatorAd" TEXT NOT NULL,
    "sayfaSayisi" INTEGER NOT NULL,
    "profil" TEXT NOT NULL,
    "kalite" "KaliteSonucu" NOT NULL DEFAULT 'BEKLIYOR',
    "oncekiTaramaId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tarama_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Nesne_sha256_key" ON "Nesne"("sha256");
CREATE UNIQUE INDEX "Nesne_depoAnahtari_key" ON "Nesne"("depoAnahtari");
CREATE UNIQUE INDEX "Tarama_kod_key" ON "Tarama"("kod");
CREATE INDEX "BelgeIcerik_belgeId_idx" ON "BelgeIcerik"("belgeId");
CREATE INDEX "Tarama_belgeId_idx" ON "Tarama"("belgeId");

ALTER TABLE "BelgeIcerik" ADD CONSTRAINT "BelgeIcerik_belgeId_fkey" FOREIGN KEY ("belgeId") REFERENCES "Belge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BelgeIcerik" ADD CONSTRAINT "BelgeIcerik_nesneId_fkey" FOREIGN KEY ("nesneId") REFERENCES "Nesne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tarama" ADD CONSTRAINT "Tarama_belgeId_fkey" FOREIGN KEY ("belgeId") REFERENCES "Belge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tarama" ADD CONSTRAINT "Tarama_nesneId_fkey" FOREIGN KEY ("nesneId") REFERENCES "Nesne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tarama" ADD CONSTRAINT "Tarama_oncekiTaramaId_fkey" FOREIGN KEY ("oncekiTaramaId") REFERENCES "Tarama"("id") ON DELETE SET NULL ON UPDATE CASCADE;
