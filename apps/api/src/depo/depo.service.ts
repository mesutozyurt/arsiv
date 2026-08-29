import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { Client } from "minio";

export type DepoKoyum = {
  sha256: string;
  boyut: number;
  depoAnahtari: string;
  bucket: string;
  zatenVardi: boolean;
};

@Injectable()
export class DepoService implements OnModuleInit {
  private readonly log = new Logger(DepoService.name);
  private readonly istemci: Client;
  readonly bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET ?? "arsiv";
    this.istemci = new Client({
      endPoint: process.env.MINIO_ENDPOINT ?? "minio",
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey:
        process.env.MINIO_ACCESS_KEY ?? process.env.MINIO_ROOT_USER ?? "arsiv",
      secretKey: process.env.MINIO_SECRET_KEY ?? process.env.MINIO_ROOT_PASSWORD ?? "",
    });
  }

  async onModuleInit(): Promise<void> {
    const varMi = await this.istemci.bucketExists(this.bucket);
    if (!varMi) {
      await this.istemci.makeBucket(this.bucket);
      this.log.log(`Kova oluşturuldu: ${this.bucket}`);
    }
  }

  ozet(buf: Buffer): string {
    return createHash("sha256").update(buf).digest("hex");
  }

  async koy(buf: Buffer, mime: string): Promise<DepoKoyum> {
    if (!buf.length) throw new ServiceUnavailableException("Boş nesne yazılamaz");
    const sha256 = this.ozet(buf);
    const depoAnahtari = `sha256/${sha256}`;
    let zatenVardi = false;
    try {
      await this.istemci.statObject(this.bucket, depoAnahtari);
      zatenVardi = true;
    } catch {
      zatenVardi = false;
    }
    if (!zatenVardi) {
      await this.istemci.putObject(this.bucket, depoAnahtari, buf, buf.length, {
        "Content-Type": mime,
      });
    }
    return { sha256, boyut: buf.length, depoAnahtari, bucket: this.bucket, zatenVardi };
  }

  async akis(depoAnahtari: string) {
    return this.istemci.getObject(this.bucket, depoAnahtari);
  }
}
