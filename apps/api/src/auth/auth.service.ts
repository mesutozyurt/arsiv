import { Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Rol } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { Aktor } from "./aktor";

const LAB_SIFRE = "Lab-2026!";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.tohumKullanici();
  }

  async tohumKullanici(): Promise<void> {
    const fen = await this.prisma.birim.findUnique({ where: { kod: "FI" } });
    const ozet = await hash(LAB_SIFRE, 10);
    const satirlar: { kullaniciAdi: string; ad: string; rol: Rol; birimId: string | null }[] = [
      { kullaniciAdi: "arsiv", ad: "Arşiv memuru", rol: Rol.ARSIV_MEMURU, birimId: null },
      { kullaniciAdi: "birim", ad: "Birim sorumlusu", rol: Rol.BIRIM_SORUMLUSU, birimId: fen?.id ?? null },
      { kullaniciAdi: "denetci", ad: "İç denetçi", rol: Rol.DENETCI, birimId: null },
      { kullaniciAdi: "bilisim", ad: "Bilişim (içerik kapalı)", rol: Rol.BILISIM, birimId: null },
      { kullaniciAdi: "komisyon", ad: "Komisyon üyesi 1", rol: Rol.KOMISYON, birimId: null },
      { kullaniciAdi: "komisyon2", ad: "Komisyon üyesi 2", rol: Rol.KOMISYON, birimId: null },
      { kullaniciAdi: "komisyon3", ad: "Komisyon üyesi 3", rol: Rol.KOMISYON, birimId: null },
      { kullaniciAdi: "komisyon4", ad: "Komisyon üyesi 4", rol: Rol.KOMISYON, birimId: null },
      { kullaniciAdi: "komisyon5", ad: "Komisyon üyesi 5", rol: Rol.KOMISYON, birimId: null },
      { kullaniciAdi: "yonetici", ad: "Üst yönetici", rol: Rol.UST_YONETICI, birimId: null },
    ];
    for (const s of satirlar) {
      await this.prisma.kullanici.upsert({
        where: { kullaniciAdi: s.kullaniciAdi },
        create: { ...s, sifreOzet: ozet },
        update: { ad: s.ad, rol: s.rol, birimId: s.birimId },
      });
    }
  }

  async giris(kullaniciAdi: string, sifre: string) {
    const k = await this.prisma.kullanici.findUnique({
      where: { kullaniciAdi },
    });
    if (!k?.aktif || !(await compare(sifre, k.sifreOzet))) {
      throw new UnauthorizedException("Kullanıcı veya şifre hatalı");
    }
    const aktor: Aktor = {
      id: k.id,
      kullaniciAdi: k.kullaniciAdi,
      ad: k.ad,
      rol: k.rol,
      birimId: k.birimId,
    };
    const token = sign(aktor, process.env.JWT_SECRET ?? "lab-jwt-degistir", {
      expiresIn: "12h",
    });
    return { token, aktor };
  }

  kullanicilar() {
    return this.prisma.kullanici.findMany({
      select: {
        id: true,
        kullaniciAdi: true,
        ad: true,
        rol: true,
        birimId: true,
        aktif: true,
        createdAt: true,
      },
      orderBy: { kullaniciAdi: "asc" },
    });
  }

  async kapat(id: string) {
    const k = await this.prisma.kullanici.findUnique({ where: { id } });
    if (!k) throw new NotFoundException("Kullanıcı yok");
    return this.prisma.kullanici.update({
      where: { id },
      data: { aktif: false },
      select: { id: true, kullaniciAdi: true, aktif: true },
    });
  }
}
