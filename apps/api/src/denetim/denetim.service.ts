import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import type { Aktor } from "../auth/aktor";

@Injectable()
export class DenetimService {
  constructor(private readonly prisma: PrismaService) {}

  async yaz(aktor: Aktor | undefined, islem: string, yol: string, ozet: string) {
    const son = await this.prisma.denetimOlayi.findFirst({
      orderBy: { sira: "desc" },
    });
    const oncekiHash = son?.hash ?? null;
    const ham = `${oncekiHash ?? ""}|${aktor?.id ?? ""}|${islem}|${yol}|${ozet}`;
    const hash = createHash("sha256").update(ham).digest("hex");
    return this.prisma.denetimOlayi.create({
      data: {
        aktorId: aktor?.id,
        aktorAd: aktor?.ad ?? "anonim",
        rol: aktor?.rol ?? "YOK",
        islem,
        yol,
        ozet,
        oncekiHash,
        hash,
      },
    });
  }

  liste() {
    return this.prisma.denetimOlayi.findMany({
      orderBy: { sira: "desc" },
      take: 200,
    });
  }

  async dogrula() {
    const olaylar = await this.prisma.denetimOlayi.findMany({
      orderBy: { sira: "asc" },
    });
    const bozuk: number[] = [];
    let onceki: string | null = null;
    for (const o of olaylar) {
      const ham = `${o.oncekiHash ?? ""}|${o.aktorId ?? ""}|${o.islem}|${o.yol}|${o.ozet}`;
      const hash = createHash("sha256").update(ham).digest("hex");
      if (hash !== o.hash || o.oncekiHash !== onceki) bozuk.push(o.sira);
      onceki = o.hash;
    }
    return { adet: olaylar.length, bozuk, saglam: bozuk.length === 0 };
  }
}
