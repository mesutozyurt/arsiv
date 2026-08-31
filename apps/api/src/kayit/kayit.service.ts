import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Aktor } from "../auth/aktor";
import { PrismaService } from "../prisma/prisma.service";
import {
  BelgeOlusturDto,
  DosyaGuncelleDto,
  DosyaOlusturDto,
  KonumAtaDto,
} from "./kayit.dto";

const dosyaInclude = {
  seri: { include: { fon: true } },
  birim: true,
  konum: true,
  belgeler: {
    include: {
      ekler: true,
      icerikler: { include: { nesne: true }, orderBy: { createdAt: "asc" as const } },
      taramalar: {
        include: { nesne: true, oncekiTarama: true },
        orderBy: { createdAt: "asc" as const },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  hareketler: { include: { konum: true }, orderBy: { createdAt: "desc" as const } },
  planSurum: { include: { plan: true } },
  bekletmeler: { where: { aktif: true }, orderBy: { createdAt: "desc" as const } },
};

function konumOzeti(konum: {
  oda: string;
  raf: string;
  dolap: string | null;
  kutu: string;
  klasor: string | null;
  barkod: string;
}): string {
  const parcalar = [konum.oda, `raf ${konum.raf}`];
  if (konum.dolap) parcalar.push(`dolap ${konum.dolap}`);
  parcalar.push(`kutu ${konum.kutu}`);
  if (konum.klasor) parcalar.push(`klasör ${konum.klasor}`);
  parcalar.push(`barkod ${konum.barkod}`);
  return parcalar.join(" / ");
}

@Injectable()
export class KayitService {
  constructor(private readonly prisma: PrismaService) {}

  async agac(aktor?: Aktor) {
    const fonlar = await this.prisma.fon.findMany({
      orderBy: { kod: "asc" },
      include: {
        seriler: {
          orderBy: { kod: "asc" },
          include: {
            birim: true,
            dosyalar: {
              orderBy: { kod: "asc" },
              include: { konum: true, birim: true },
            },
          },
        },
      },
    });
    const birimler = await this.prisma.birim.findMany({ orderBy: { kod: "asc" } });
    const konumlar = await this.prisma.fizikselKonum.findMany({
      orderBy: { kod: "asc" },
    });
    if (aktor?.rol === "BIRIM_SORUMLUSU" && aktor.birimId) {
      const birimId = aktor.birimId;
      for (const fon of fonlar) {
        fon.seriler = fon.seriler
          .map((s) => ({
            ...s,
            dosyalar: s.dosyalar.filter((d) => d.birimId === birimId),
          }))
          .filter((s) => s.birimId === birimId || s.dosyalar.length > 0);
      }
    }
    return { fonlar, birimler, konumlar };
  }

  async dosyaListe(aktor?: Aktor) {
    const where =
      aktor?.rol === "BIRIM_SORUMLUSU" && aktor.birimId
        ? { birimId: aktor.birimId }
        : {};
    return this.prisma.dosya.findMany({
      where,
      orderBy: { kod: "asc" },
      include: { seri: true, birim: true, konum: true },
    });
  }

  async dosyaGetir(id: string) {
    const dosya = await this.prisma.dosya.findUnique({
      where: { id },
      include: dosyaInclude,
    });
    if (!dosya) throw new NotFoundException("Dosya bulunamadı");
    return dosya;
  }

  async dosyaOlustur(dto: DosyaOlusturDto) {
    await this.seriVeBirimDogrula(dto.seriId, dto.birimId);
    if (dto.konumId) await this.konumGetir(dto.konumId);

    try {
      const dosya = await this.prisma.$transaction(async (tx) => {
        const olusan = await tx.dosya.create({
          data: {
            kod: dto.kod.trim(),
            konu: dto.konu.trim(),
            seriId: dto.seriId,
            birimId: dto.birimId,
            nushaTuru: dto.nushaTuru,
            ureticiBirimAd: dto.ureticiBirimAd.trim(),
            sahipKurum: dto.sahipKurum.trim(),
            kaynakSistem: dto.kaynakSistem?.trim() || "ARSIV",
            konumId: dto.konumId,
          },
        });
        if (dto.konumId) {
          await tx.konumHareketi.create({
            data: {
              dosyaId: olusan.id,
              konumId: dto.konumId,
              oncekiOzet: null,
              gerekce: "İlk yerleştirme",
            },
          });
        }
        return tx.dosya.findUniqueOrThrow({
          where: { id: olusan.id },
          include: dosyaInclude,
        });
      });
      return dosya;
    } catch (hata) {
      this.benzersizYakala(hata);
    }
  }

  async dosyaGuncelle(id: string, dto: DosyaGuncelleDto) {
    await this.dosyaGetir(id);
    return this.prisma.dosya.update({
      where: { id },
      data: {
        konu: dto.konu?.trim(),
        nushaTuru: dto.nushaTuru,
        ureticiBirimAd: dto.ureticiBirimAd?.trim(),
        sahipKurum: dto.sahipKurum?.trim(),
      },
      include: dosyaInclude,
    });
  }

  async konumAta(id: string, dto: KonumAtaDto) {
    const dosya = await this.dosyaGetir(id);
    const konum = await this.konumGetir(dto.konumId);
    const oncekiOzet = dosya.konum ? konumOzeti(dosya.konum) : null;

    return this.prisma.$transaction(async (tx) => {
      await tx.konumHareketi.create({
        data: {
          dosyaId: id,
          konumId: konum.id,
          oncekiOzet,
          gerekce: dto.gerekce?.trim() || "Konum güncelleme",
        },
      });
      return tx.dosya.update({
        where: { id },
        data: { konumId: konum.id },
        include: dosyaInclude,
      });
    });
  }

  async tamamla(id: string) {
    const dosya = await this.dosyaGetir(id);
    const eksikler: string[] = [];
    if (!dosya.kod?.trim()) eksikler.push("kimlik");
    if (!dosya.nushaTuru) eksikler.push("asıl/kopya");
    if (!dosya.ureticiBirimAd?.trim()) eksikler.push("üretici birim");
    if (!dosya.sahipKurum?.trim()) eksikler.push("sahip kurum");
    if (!dosya.konumId) eksikler.push("fiziksel konum");
    if (eksikler.length > 0) {
      throw new BadRequestException(
        `Kayıt tamamlanamaz. Eksik: ${eksikler.join(", ")}.`,
      );
    }
    return this.prisma.dosya.update({
      where: { id },
      data: { durum: "KAYITLI" },
      include: dosyaInclude,
    });
  }

  async belgeOlustur(dto: BelgeOlusturDto) {
    await this.dosyaGetir(dto.dosyaId);
    try {
      return await this.prisma.belge.create({
        data: {
          kod: dto.kod.trim(),
          dosyaId: dto.dosyaId,
          tur: dto.tur.trim(),
          sayi: dto.sayi?.trim(),
          konu: dto.konu.trim(),
          uretici: dto.uretici.trim(),
          nushaTuru: dto.nushaTuru,
        },
        include: { ekler: true },
      });
    } catch (hata) {
      this.benzersizYakala(hata);
    }
  }

  private async seriVeBirimDogrula(seriId: string, birimId: string) {
    const seri = await this.prisma.seri.findUnique({ where: { id: seriId } });
    if (!seri) throw new NotFoundException("Seri bulunamadı");
    const birim = await this.prisma.birim.findUnique({ where: { id: birimId } });
    if (!birim) throw new NotFoundException("Birim bulunamadı");
  }

  private async konumGetir(id: string) {
    const konum = await this.prisma.fizikselKonum.findUnique({ where: { id } });
    if (!konum) throw new NotFoundException("Konum bulunamadı");
    return konum;
  }

  private benzersizYakala(hata: unknown): never {
    if (hata instanceof Prisma.PrismaClientKnownRequestError && hata.code === "P2002") {
      throw new ConflictException("Bu kimlik zaten kayıtlı");
    }
    throw hata;
  }
}
