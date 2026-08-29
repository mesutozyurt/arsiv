import { Injectable, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
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
    if ((await this.prisma.kullanici.count()) > 0) return;
    const fen = await this.prisma.birim.findUnique({ where: { kod: "FI" } });
    const ozet = await hash(LAB_SIFRE, 10);
    const satirlar = [
      { kullaniciAdi: "arsiv", ad: "Arşiv memuru", rol: "ARSIV_MEMURU" as const, birimId: null },
      { kullaniciAdi: "birim", ad: "Birim sorumlusu", rol: "BIRIM_SORUMLUSU" as const, birimId: fen?.id ?? null },
      { kullaniciAdi: "denetci", ad: "İç denetçi", rol: "DENETCI" as const, birimId: null },
      { kullaniciAdi: "bilisim", ad: "Bilişim (içerik kapalı)", rol: "BILISIM" as const, birimId: null },
      { kullaniciAdi: "komisyon", ad: "İmha komisyonu", rol: "KOMISYON" as const, birimId: null },
      { kullaniciAdi: "yonetici", ad: "Üst yönetici", rol: "UST_YONETICI" as const, birimId: null },
    ];
    for (const s of satirlar) {
      await this.prisma.kullanici.create({ data: { ...s, sifreOzet: ozet } });
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
}
