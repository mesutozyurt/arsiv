import { DosyaDurumu, NushaTuru, PrismaClient } from "@prisma/client";

export async function tohumla(prisma: PrismaClient): Promise<void> {
  const mevcut = await prisma.fon.count();
  if (mevcut > 0) return;

  const yazı = await prisma.birim.create({
    data: { kod: "YI", ad: "Yazı İşleri Müdürlüğü" },
  });
  const fen = await prisma.birim.create({
    data: { kod: "FI", ad: "Fen İşleri Müdürlüğü" },
  });

  const fon = await prisma.fon.create({
    data: {
      kod: "FON-BLD-001",
      ad: "Belediye meclis ve yazı işleri",
      ureticiKurum: "Test İlçe Belediyesi",
      sahipKurum: "Test İlçe Belediyesi",
      kapsamBaslangic: new Date("2020-01-01T00:00:00.000Z"),
      devralmaDayanagi: "Kurum üretimi — sentetik laboratuvar kaydı",
    },
  });

  const seriMeclis = await prisma.seri.create({
    data: {
      kod: "SERI-MK-001",
      ad: "Meclis kararları",
      fonId: fon.id,
      birimId: yazı.id,
      islev: "Karar ve tutanak saklama",
      sdpKodu: "010.06",
      gizlilik: "NORMAL",
    },
  });
  const seriFen = await prisma.seri.create({
    data: {
      kod: "SERI-FI-001",
      ad: "Yol bakım iş dosyaları",
      fonId: fon.id,
      birimId: fen.id,
      islev: "Fen işleri proje dosyası",
      sdpKodu: "450.02",
      gizlilik: "NORMAL",
    },
  });

  const konumA = await prisma.fizikselKonum.create({
    data: {
      kod: "KNM-A-1-12",
      oda: "Kurum arşiv A",
      raf: "1",
      dolap: "D-1",
      kutu: "12",
      klasor: "2024/meclis",
      barkod: "ARS-000012",
    },
  });
  await prisma.fizikselKonum.create({
    data: {
      kod: "KNM-B-2-03",
      oda: "Kurum arşiv B",
      raf: "2",
      dolap: "D-4",
      kutu: "03",
      klasor: "fen/2025",
      barkod: "ARS-000203",
    },
  });

  const kayitli = await prisma.dosya.create({
    data: {
      kod: "DSY-2024-0017",
      konu: "2024/17 sayılı meclis karar dosyası",
      seriId: seriMeclis.id,
      birimId: yazı.id,
      nushaTuru: NushaTuru.ASIL,
      ureticiBirimAd: "Yazı İşleri Müdürlüğü",
      sahipKurum: "Test İlçe Belediyesi",
      kaynakSistem: "ARSIV",
      durum: DosyaDurumu.KAYITLI,
      konumId: konumA.id,
      tarihBaslangic: new Date("2024-01-01T00:00:00.000Z"),
      tarihBitis: new Date("2024-12-31T00:00:00.000Z"),
    },
  });
  await prisma.konumHareketi.create({
    data: {
      dosyaId: kayitli.id,
      konumId: konumA.id,
      oncekiOzet: null,
      gerekce: "İlk yerleştirme",
    },
  });

  const belge = await prisma.belge.create({
    data: {
      kod: "BLG-2024-0017-01",
      dosyaId: kayitli.id,
      tur: "Meclis kararı",
      sayi: "2024/17",
      tarih: new Date("2024-03-12T00:00:00.000Z"),
      konu: "Park düzenlemesi hakkında karar",
      kaynak: "ARSIV",
      uretici: "Yazı İşleri Müdürlüğü",
      nushaTuru: NushaTuru.ASIL,
    },
  });
  await prisma.ek.create({
    data: {
      kod: "EK-2024-0017-01",
      belgeId: belge.id,
      sira: 1,
      aciklama: "Karara ek kroki (sentetik)",
    },
  });

  await prisma.dosya.create({
    data: {
      kod: "DSY-2025-TASLAK-01",
      konu: "Yol yaması iş dosyası — konum bekliyor",
      seriId: seriFen.id,
      birimId: fen.id,
      nushaTuru: NushaTuru.ASIL,
      ureticiBirimAd: "Fen İşleri Müdürlüğü",
      sahipKurum: "Test İlçe Belediyesi",
      kaynakSistem: "ARSIV",
      durum: DosyaDurumu.TASLAK,
      konumId: null,
    },
  });

}
