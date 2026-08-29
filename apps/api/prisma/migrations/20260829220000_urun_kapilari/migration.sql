-- AlterEnum
ALTER TYPE "DosyaDurumu" ADD VALUE 'IMHA_EDILDI';

-- AlterTable
ALTER TABLE "Odunc" ADD COLUMN "uzatmaSayisi" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Odunc" ADD COLUMN "kondisyon" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ImhaOy_listeId_uyeAd_key" ON "ImhaOy"("listeId", "uyeAd");
