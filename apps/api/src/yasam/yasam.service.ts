import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import {
  DosyaDurumu,
  IletisimDurumu,
  ImhaAsama,
  NushaTuru,
  OduncDurumu,
  Rol,
  TalepDurumu,
  TalepTuru,
} from "@prisma/client";
import type { Aktor } from "../auth/aktor";
import { isGunuEkle } from "../ortak/is-gunu";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class YasamService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.tohumYasam();
    await this.tohumSuresiDolmus();
  }

  async tohumYasam(): Promise<void> {
    if ((await this.prisma.saklamaPlani.count()) > 0) return;
    const plan = await this.prisma.saklamaPlani.create({
      data: { kod: "KSP-2024", ad: "Lab kurumsal saklama planı (sentetik)" },
    });
    await this.prisma.saklamaSurumu.create({
      data: {
        planId: plan.id,
        surum: 1,
        yururluk: new Date("2020-01-01"),
        sdpKodu: "010.06",
        sureYil: 5,
        baslangicOlayi: "dosya kapanışı",
        dabOnayNo: "LAB-DAB-000",
      },
    });
    await this.prisma.saklamaSurumu.create({
      data: {
        planId: plan.id,
        surum: 2,
        yururluk: new Date("2025-01-01"),
        sdpKodu: "010.06",
        sureYil: 7,
        baslangicOlayi: "dosya kapanışı",
        dabOnayNo: "LAB-DAB-001",
      },
    });
    await this.prisma.yapilandirmaSurumu.create({
      data: {
        anahtar: "is-gunu-takvimi",
        surum: 1,
        deger: "TR resmi tatil lab listesi",
        onayli: true,
      },
    });
  }

  planlar() {
    return this.prisma.saklamaPlani.findMany({
      include: { surumler: { orderBy: { surum: "asc" } } },
    });
  }

  async dosyayaPlan(dosyaId: string, planSurumId: string) {
    const dosya = await this.prisma.dosya.findUnique({ where: { id: dosyaId } });
    if (!dosya) throw new NotFoundException("Dosya yok");
    if (dosya.planSurumId) {
      throw new BadRequestException("Bağlı plan sürümü geriye dönük değiştirilemez");
    }
    const surum = await this.prisma.saklamaSurumu.findUnique({
      where: { id: planSurumId },
    });
    if (!surum) throw new NotFoundException("Plan sürümü yok");
    return this.prisma.dosya.update({
      where: { id: dosyaId },
      data: { planSurumId, baslangicOlayi: surum.baslangicOlayi },
    });
  }

  async bekletmeKoy(dosyaId: string, sebep: string, makam: string) {
    await this.dosyaVar(dosyaId);
    return this.prisma.hukukiBekletme.create({
      data: { dosyaId, sebep, makam },
    });
  }

  async bekletmeKaldir(id: string) {
    return this.prisma.hukukiBekletme.update({
      where: { id },
      data: { aktif: false, bitis: new Date() },
    });
  }

  async oduncVer(dosyaId: string, talepEden: string, birimAd: string, gun: number) {
    await this.dosyaVar(dosyaId);
    const acik = await this.prisma.odunc.findFirst({
      where: { dosyaId, durum: OduncDurumu.ACIK },
    });
    if (acik) throw new ConflictException("Dosya dışarıda; ikinci teslim yok");
    const son = new Date();
    son.setDate(son.getDate() + gun);
    return this.prisma.odunc.create({
      data: { dosyaId, talepEden, birimAd, sonTarih: son },
    });
  }

  oduncler() {
    return this.prisma.odunc.findMany({
      include: { dosya: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async ara(q: string, aktor: Aktor) {
    const metin = q.trim();
    if (!metin) return [];
    const where: {
      OR: object[];
      birimId?: string;
    } = {
      OR: [
        { kod: { contains: metin, mode: "insensitive" } },
        { konu: { contains: metin, mode: "insensitive" } },
        { belgeler: { some: { konu: { contains: metin, mode: "insensitive" } } } },
        { belgeler: { some: { ocrOneriler: { some: { metin: { contains: metin, mode: "insensitive" } } } } } },
      ],
    };
    if (aktor.rol === Rol.BIRIM_SORUMLUSU && aktor.birimId) {
      where.birimId = aktor.birimId;
    }
    return this.prisma.dosya.findMany({
      where,
      include: { seri: true, birim: true, konum: true },
      take: 50,
    });
  }

  async imhaListeAc(aktor: Aktor, dosyaIdleri: string[]) {
    if (aktor.rol === Rol.KOMISYON || aktor.rol === Rol.UST_YONETICI) {
      throw new ForbiddenException("Adayı hazırlayan komisyon/üst onay veremez");
    }
    const kod = `IMHA-${Date.now()}`;
    for (const id of dosyaIdleri) {
      const d = await this.prisma.dosya.findUnique({
        where: { id },
        include: { bekletmeler: { where: { aktif: true } }, planSurum: true },
      });
      if (!d) throw new NotFoundException("Dosya yok");
      if (d.bekletmeler.length) {
        throw new BadRequestException("Bekletmeli kayıt aday olamaz");
      }
      if (d.durum !== DosyaDurumu.KAYITLI) {
        throw new BadRequestException("Yalnız kayıtlı dosya aday olur");
      }
      if (!d.planSurum) {
        throw new BadRequestException("Plan bağlanmadan aday olamaz");
      }
      if (!this.suresiDoldu(d.tarihBitis ?? d.createdAt, d.planSurum.sureYil)) {
        throw new BadRequestException("Süresi dolmamış veya aktif kayıt aday olamaz");
      }
    }
    return this.prisma.imhaListesi.create({
      data: {
        kod,
        hazirlayan: aktor.ad,
        adaylar: { create: dosyaIdleri.map((dosyaId) => ({ dosyaId })) },
      },
      include: { adaylar: { include: { dosya: true } }, oylar: true },
    });
  }

  imhaListeleri() {
    return this.prisma.imhaListesi.findMany({
      include: { adaylar: { include: { dosya: true } }, oylar: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async imhaOy(listeId: string, aktor: Aktor, kabul: boolean, gerekce?: string) {
    const liste = await this.listeGetir(listeId);
    if (liste.hazirlayan === aktor.ad) {
      throw new ForbiddenException("Adayı hazırlayan oy veremez");
    }
    if (aktor.rol !== Rol.KOMISYON) {
      throw new ForbiddenException("Yalnız komisyon oy kullanır");
    }
    await this.prisma.imhaOy.create({
      data: { listeId, uyeAd: aktor.ad, kabul, gerekce },
    });
    return this.prisma.imhaListesi.update({
      where: { id: listeId },
      data: { asama: ImhaAsama.KOMISYON },
      include: { oylar: true, adaylar: true },
    });
  }

  async imhaDab(listeId: string, dabGorusNo: string) {
    const liste = await this.listeGetir(listeId);
    if (liste.oylar.length < 5) {
      throw new BadRequestException("Beş üye oyu olmadan DAB kapısı açılmaz");
    }
    const kabul = liste.oylar.filter((o) => o.kabul).length;
    if (kabul < 3) throw new BadRequestException("Komisyon çoğunluğu yok");
    return this.prisma.imhaListesi.update({
      where: { id: listeId },
      data: { asama: ImhaAsama.DAB_GORUS, dabGorusNo },
    });
  }

  async imhaUstOnay(listeId: string, aktor: Aktor) {
    const liste = await this.listeGetir(listeId);
    if (!liste.dabGorusNo) throw new BadRequestException("DAB görüşü olmadan onay yok");
    if (aktor.rol !== Rol.UST_YONETICI) throw new ForbiddenException("Üst yönetici onayı");
    if (liste.hazirlayan === aktor.ad) {
      throw new ForbiddenException("Hazırlayan onaylayamaz");
    }
    return this.prisma.imhaListesi.update({
      where: { id: listeId },
      data: { asama: ImhaAsama.UST_ONAY, ustOnaylayan: aktor.ad },
    });
  }

  async imhaIcra(listeId: string, aktor: Aktor) {
    const liste = await this.listeGetir(listeId);
    if (liste.asama !== ImhaAsama.UST_ONAY) {
      throw new BadRequestException("Kapılar tamam değil; otomatik imha yok");
    }
    const adaylar = await this.prisma.imhaAday.findMany({
      where: { listeId },
      include: { dosya: { include: { belgeler: { include: { icerikler: true } } } } },
    });
    const kanit = {
      listeKod: liste.kod,
      dosyaKodlari: adaylar.map((a) => a.dosya.kod),
      hashler: adaylar.flatMap((a) =>
        a.dosya.belgeler.flatMap((b) => b.icerikler.map((i) => i.nesneId)),
      ),
      yontem: "icerik-yeniden-uretilmez",
      operator: aktor.ad,
      icerikYok: true,
    };
    await this.prisma.$transaction([
      this.prisma.dosya.updateMany({
        where: { id: { in: adaylar.map((a) => a.dosyaId) } },
        data: { durum: DosyaDurumu.IMHA_EDILDI },
      }),
      this.prisma.imhaListesi.update({
        where: { id: listeId },
        data: {
          asama: ImhaAsama.ICRA,
          tutanakOzet: JSON.stringify(kanit),
        },
      }),
    ]);
    return { ...kanit, saklamaYil: 10 };
  }

  async talepAc(dto: {
    tur: TalepTuru;
    basvuranAd: string;
    konu: string;
    dosyaId?: string;
    vekaletVar?: boolean;
    vekilAd?: string;
    vekaletSure?: string;
  }) {
    if (dto.vekaletVar) {
      if (!dto.vekilAd || !dto.vekaletSure) {
        throw new BadRequestException("Vekâlet kapsamı ve süresi zorunlu");
      }
      if (new Date(dto.vekaletSure) < new Date()) {
        throw new BadRequestException("Vekâlet süresi dolmuş");
      }
    }
    const gun = dto.tur === TalepTuru.BILGI_EDINME ? 15 : 30;
    const son = isGunuEkle(new Date(), gun);
    return this.prisma.talep.create({
      data: {
        kod: `TLP-${Date.now()}`,
        tur: dto.tur,
        basvuranAd: dto.basvuranAd,
        konu: dto.konu,
        dosyaId: dto.dosyaId,
        vekaletVar: !!dto.vekaletVar,
        vekilAd: dto.vekilAd,
        vekaletSure: dto.vekaletSure ? new Date(dto.vekaletSure) : null,
        sonTarih: son,
      },
    });
  }

  talepler() {
    return this.prisma.talep.findMany({
      include: { dosya: true, kopyalar: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async karartilmisKopya(talepId: string, nesneId: string) {
    const nesne = await this.prisma.nesne.findUnique({ where: { id: nesneId } });
    if (!nesne) throw new NotFoundException("Nesne yok");
    const kopyaHash = createHash("sha256")
      .update(`karartma:${nesne.sha256}:${talepId}`)
      .digest("hex");
    return this.prisma.karartilmisKopya.create({
      data: {
        talepId,
        kaynakNesneId: nesneId,
        kaynakHash: nesne.sha256,
        kopyaHash,
      },
    });
  }

  kvkkCarpisma(dosyaId: string) {
    return this.prisma.dosya.findUnique({
      where: { id: dosyaId },
      include: {
        planSurum: { include: { plan: true } },
        bekletmeler: { where: { aktif: true } },
      },
    });
  }

  async eypAl(belgeId: string, paketHash: string, teslimDelili: string, yon: string) {
    await this.belgeVar(belgeId);
    return this.prisma.eypPaket.create({
      data: { belgeId, paketHash, teslimDelili, yon },
    });
  }

  async imzaKuyruk(belgeId: string) {
    await this.belgeVar(belgeId);
    return this.prisma.imzaKaniti.create({
      data: {
        belgeId,
        durum: "KUYRUK",
        kuyruk: true,
        ozet: "Dış imza servisi yok; doğrulama kuyruğa alındı",
      },
    });
  }

  async entegrasyon(dto: {
    sistem: string;
    disKimlik: string;
    idempotans: string;
    yon: string;
  }) {
    const varOlan = await this.prisma.entegrasyonIletisi.findUnique({
      where: { idempotans: dto.idempotans },
    });
    if (varOlan) return varOlan;
    return this.prisma.entegrasyonIletisi.create({
      data: { ...dto, durum: IletisimDurumu.ISLENDI },
    });
  }

  iceAktar(kaynak: string, satirOzet: string) {
    return this.prisma.iceAktarim.create({
      data: { kaynak, satirOzet, kaynakSilindi: false },
    });
  }

  async disaAktar() {
    const fonlar = await this.prisma.fon.findMany({
      include: {
        seriler: {
          include: {
            dosyalar: {
              include: { belgeler: { include: { icerikler: { include: { nesne: true } } } } },
            },
          },
        },
      },
    });
    const hashler: string[] = [];
    for (const f of fonlar) {
      for (const s of f.seriler) {
        for (const d of s.dosyalar) {
          for (const b of d.belgeler) {
            for (const i of b.icerikler) hashler.push(i.nesne.sha256);
          }
        }
      }
    }
    return {
      sema: "arsiv-devir-v1",
      adetDosya: fonlar.reduce((n, f) => n + f.seriler.reduce((m, s) => m + s.dosyalar.length, 0), 0),
      hashAdet: hashler.length,
      hashMutabakat: createHash("sha256").update(hashler.sort().join(",")).digest("hex"),
      hiyerarsi: fonlar,
    };
  }

  async yapilandirma(anahtar: string, deger: string) {
    const son = await this.prisma.yapilandirmaSurumu.findFirst({
      where: { anahtar },
      orderBy: { surum: "desc" },
    });
    return this.prisma.yapilandirmaSurumu.create({
      data: { anahtar, surum: (son?.surum ?? 0) + 1, deger, onayli: false },
    });
  }

  async yapilandirmaOnay(id: string) {
    return this.prisma.yapilandirmaSurumu.update({
      where: { id },
      data: { onayli: true },
    });
  }

  risk(tur: string, aciklama: string) {
    return this.prisma.fizikselRisk.create({ data: { tur, aciklama } });
  }

  async ocrOner(belgeId: string, metin: string) {
    await this.belgeVar(belgeId);
    return this.prisma.ocrOneri.create({
      data: { belgeId, metin, onaylandi: false },
    });
  }

  async ocrOnay(id: string, uygula: boolean) {
    const o = await this.prisma.ocrOneri.findUnique({ where: { id } });
    if (!o) throw new NotFoundException("Öneri yok");
    if (!uygula) return o;
    await this.prisma.belge.update({
      where: { id: o.belgeId },
      data: { konu: o.metin },
    });
    return this.prisma.ocrOneri.update({
      where: { id },
      data: { onaylandi: true },
    });
  }

  async raporlar() {
    const [oduncGeciken, talepler, ocak] = await Promise.all([
      this.prisma.odunc.findMany({
        where: { durum: OduncDurumu.ACIK, sonTarih: { lt: new Date() } },
        include: { dosya: true },
      }),
      this.prisma.talep.findMany({ where: { durum: TalepDurumu.ACIK } }),
      this.prisma.dosya.count({ where: { durum: "KAYITLI" } }),
    ]);
    return {
      yillikKontrol: { kayitliDosya: ocak, donem: new Date().getFullYear() },
      gecikenOdunc: oduncGeciken,
      acikTalepler: talepler,
      kanalDurum: {
        eDevlet: "lab-stub — iç arşiv araması yok",
        eBelediye: "lab-stub — durum/suret yüzü",
      },
    };
  }

  yedekRapor() {
    return {
      rpoSaat: 4,
      rtoSaat: 8,
      kapsar: ["postgres", "minio", "denetim-gunlugu"],
      komut: "./scripts/yedek.sh",
    };
  }

  async ozet() {
    const [kayitli, taslak, imha, odunc, talep] = await Promise.all([
      this.prisma.dosya.count({ where: { durum: DosyaDurumu.KAYITLI } }),
      this.prisma.dosya.count({ where: { durum: DosyaDurumu.TASLAK } }),
      this.prisma.dosya.count({ where: { durum: DosyaDurumu.IMHA_EDILDI } }),
      this.prisma.odunc.count({ where: { durum: OduncDurumu.ACIK } }),
      this.prisma.talep.count({ where: { durum: TalepDurumu.ACIK } }),
    ]);
    return { kayitli, taslak, imha, odunc, talep };
  }

  yapilandirmalar() {
    return this.prisma.yapilandirmaSurumu.findMany({ orderBy: { createdAt: "desc" } });
  }

  iceAktarimlar() {
    return this.prisma.iceAktarim.findMany({ orderBy: { createdAt: "desc" } });
  }

  eypPaketler() {
    return this.prisma.eypPaket.findMany({ include: { belge: true }, orderBy: { createdAt: "desc" } });
  }

  ocrOneriler() {
    return this.prisma.ocrOneri.findMany({ include: { belge: true }, orderBy: { createdAt: "desc" } });
  }

  riskler() {
    return this.prisma.fizikselRisk.findMany({ orderBy: { createdAt: "desc" } });
  }

  entegrasyonlar() {
    return this.prisma.entegrasyonIletisi.findMany({ orderBy: { createdAt: "desc" } });
  }

  async talepCevap(id: string, durum: TalepDurumu, karar: string) {
    const t = await this.prisma.talep.findUnique({ where: { id } });
    if (!t) throw new NotFoundException("Talep yok");
    if (durum === TalepDurumu.ACIK) throw new BadRequestException("Cevap durumu açık olamaz");
    return this.prisma.talep.update({
      where: { id },
      data: { durum, karar },
    });
  }

  async oduncUzat(id: string, gun: number) {
    const o = await this.prisma.odunc.findUnique({ where: { id } });
    if (!o || o.durum !== OduncDurumu.ACIK) throw new NotFoundException("Açık ödünç yok");
    const son = new Date(o.sonTarih);
    son.setDate(son.getDate() + gun);
    return this.prisma.odunc.update({
      where: { id },
      data: { sonTarih: son, uzatmaSayisi: o.uzatmaSayisi + 1 },
    });
  }

  async oduncIade(id: string, kondisyon?: string) {
    const o = await this.prisma.odunc.findUnique({ where: { id } });
    if (!o || o.durum !== OduncDurumu.ACIK) throw new NotFoundException("Açık ödünç yok");
    return this.prisma.odunc.update({
      where: { id },
      data: { durum: OduncDurumu.IADE, iadeTarih: new Date(), kondisyon },
    });
  }

  private suresiDoldu(baslangic: Date, sureYil: number): boolean {
    const bitis = new Date(baslangic);
    bitis.setFullYear(bitis.getFullYear() + sureYil);
    return new Date() >= bitis;
  }

  private async tohumSuresiDolmus() {
    if (await this.prisma.dosya.findUnique({ where: { kod: "DSY-2010-0001" } })) return;
    const seri = await this.prisma.seri.findFirst({ where: { kod: "SERI-MK-001" } });
    const birim = await this.prisma.birim.findFirst({ where: { kod: "YI" } });
    const konum = await this.prisma.fizikselKonum.findFirst();
    const plan = await this.prisma.saklamaSurumu.findFirst({ orderBy: { surum: "asc" } });
    if (!seri || !birim || !konum || !plan) return;
    await this.prisma.dosya.create({
      data: {
        kod: "DSY-2010-0001",
        konu: "Süresi dolmuş sentetik imha adayı",
        seriId: seri.id,
        birimId: birim.id,
        nushaTuru: NushaTuru.ASIL,
        ureticiBirimAd: "Yazı İşleri Müdürlüğü",
        sahipKurum: "Test İlçe Belediyesi",
        durum: DosyaDurumu.KAYITLI,
        konumId: konum.id,
        tarihBitis: new Date("2010-01-01T00:00:00.000Z"),
        planSurumId: plan.id,
        baslangicOlayi: plan.baslangicOlayi,
      },
    });
  }

  private async dosyaVar(id: string) {
    const d = await this.prisma.dosya.findUnique({ where: { id } });
    if (!d) throw new NotFoundException("Dosya yok");
    return d;
  }

  private async belgeVar(id: string) {
    const b = await this.prisma.belge.findUnique({ where: { id } });
    if (!b) throw new NotFoundException("Belge yok");
    return b;
  }

  private async listeGetir(id: string) {
    const l = await this.prisma.imhaListesi.findUnique({
      where: { id },
      include: { oylar: true, adaylar: true },
    });
    if (!l) throw new NotFoundException("Liste yok");
    return l;
  }
}
