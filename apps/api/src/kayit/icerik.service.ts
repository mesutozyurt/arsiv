import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IcerikRolu, KaliteSonucu } from "@prisma/client";
import { DepoService } from "../depo/depo.service";
import { PrismaService } from "../prisma/prisma.service";

const MAX_BOYUT = 20 * 1024 * 1024;

export type TaramaAlanlari = {
  cihaz: string;
  operatorAd: string;
  sayfaSayisi: number;
  profil: string;
  kalite?: KaliteSonucu;
  oncekiTaramaId?: string;
};

@Injectable()
export class IcerikService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly depo: DepoService,
  ) {}

  async belgeIcerikBagla(belgeId: string, dosya: Express.Multer.File, rol: IcerikRolu) {
    await this.belgeGetir(belgeId);
    const buf = this.tampon(dosya);
    const koyum = await this.depo.koy(buf, dosya.mimetype || "application/octet-stream");
    const nesne = await this.nesneKaydet(koyum, dosya);
    return this.prisma.belgeIcerik.create({
      data: { belgeId, nesneId: nesne.id, rol },
      include: { nesne: true },
    });
  }

  async taramaEkle(belgeId: string, dosya: Express.Multer.File, alan: TaramaAlanlari) {
    await this.belgeGetir(belgeId);
    if (!alan.cihaz.trim() || !alan.operatorAd.trim() || !alan.profil.trim()) {
      throw new BadRequestException("Cihaz, operatör ve tarama profili zorunlu");
    }
    if (!Number.isInteger(alan.sayfaSayisi) || alan.sayfaSayisi < 1) {
      throw new BadRequestException("Sayfa sayısı en az 1 olmalı");
    }
    if (alan.oncekiTaramaId) {
      const onceki = await this.prisma.tarama.findUnique({
        where: { id: alan.oncekiTaramaId },
      });
      if (!onceki || onceki.belgeId !== belgeId) {
        throw new NotFoundException("Önceki tarama bu belgeye ait değil");
      }
    }
    const buf = this.tampon(dosya);
    const koyum = await this.depo.koy(buf, dosya.mimetype || "application/octet-stream");
    const nesne = await this.nesneKaydet(koyum, dosya);
    const sira = (await this.prisma.tarama.count({ where: { belgeId } })) + 1;
    const belge = await this.prisma.belge.findUniqueOrThrow({ where: { id: belgeId } });
    return this.prisma.tarama.create({
      data: {
        kod: `TRM-${belge.kod}-${String(sira).padStart(2, "0")}`,
        belgeId,
        nesneId: nesne.id,
        cihaz: alan.cihaz.trim(),
        operatorAd: alan.operatorAd.trim(),
        sayfaSayisi: alan.sayfaSayisi,
        profil: alan.profil.trim(),
        kalite: alan.kalite ?? KaliteSonucu.BEKLIYOR,
        oncekiTaramaId: alan.oncekiTaramaId,
      },
      include: { nesne: true, oncekiTarama: { include: { nesne: true } } },
    });
  }

  async nesneGetir(id: string) {
    const nesne = await this.prisma.nesne.findUnique({ where: { id } });
    if (!nesne) throw new NotFoundException("Nesne bulunamadı");
    const akis = await this.depo.akis(nesne.depoAnahtari);
    return { nesne, akis };
  }

  private tampon(dosya: Express.Multer.File): Buffer {
    if (!dosya?.buffer?.length) throw new BadRequestException("Dosya gerekli");
    if (dosya.size > MAX_BOYUT) {
      throw new BadRequestException("Dosya 20 MB sınırını aşıyor");
    }
    return dosya.buffer;
  }

  private async belgeGetir(id: string) {
    const belge = await this.prisma.belge.findUnique({ where: { id } });
    if (!belge) throw new NotFoundException("Belge bulunamadı");
    return belge;
  }

  private async nesneKaydet(
    koyum: { sha256: string; boyut: number; depoAnahtari: string; bucket: string },
    dosya: Express.Multer.File,
  ) {
    const mevcut = await this.prisma.nesne.findUnique({
      where: { sha256: koyum.sha256 },
    });
    if (mevcut) return mevcut;
    const uzanti = (dosya.originalname.split(".").pop() ?? "bin").toLowerCase();
    return this.prisma.nesne.create({
      data: {
        sha256: koyum.sha256,
        boyut: koyum.boyut,
        mime: dosya.mimetype || "application/octet-stream",
        format: uzanti.slice(0, 16),
        depoAnahtari: koyum.depoAnahtari,
        bucket: koyum.bucket,
      },
    });
  }
}
