import { TalepTuru } from "@prisma/client";
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class PlanBaglaDto {
  @IsUUID()
  planSurumId!: string;
}

export class BekletmeDto {
  @IsString()
  @MinLength(3)
  sebep!: string;

  @IsString()
  @MinLength(2)
  makam!: string;
}

export class OduncDto {
  @IsUUID()
  dosyaId!: string;

  @IsString()
  @MinLength(2)
  talepEden!: string;

  @IsString()
  @MinLength(2)
  birimAd!: string;

  @IsOptional()
  @IsInt()
  gun?: number;
}

export class ImhaAcDto {
  @IsArray()
  @IsUUID("4", { each: true })
  dosyaIdleri!: string[];
}

export class ImhaOyDto {
  @IsBoolean()
  kabul!: boolean;

  @IsOptional()
  @IsString()
  gerekce?: string;
}

export class DabDto {
  @IsString()
  @MinLength(2)
  dabGorusNo!: string;
}

export class TalepDto {
  @IsEnum(TalepTuru)
  tur!: TalepTuru;

  @IsString()
  @MinLength(2)
  basvuranAd!: string;

  @IsString()
  @MinLength(3)
  konu!: string;

  @IsOptional()
  @IsUUID()
  dosyaId?: string;

  @IsOptional()
  @IsBoolean()
  vekaletVar?: boolean;

  @IsOptional()
  @IsString()
  vekilAd?: string;

  @IsOptional()
  @IsString()
  vekaletSure?: string;
}

export class KarartmaDto {
  @IsUUID()
  nesneId!: string;
}

export class EypDto {
  @IsUUID()
  belgeId!: string;

  @IsString()
  @MinLength(8)
  paketHash!: string;

  @IsString()
  @MinLength(2)
  teslimDelili!: string;

  @IsString()
  yon!: string;
}

export class EntegrasyonDto {
  @IsString()
  sistem!: string;

  @IsString()
  disKimlik!: string;

  @IsString()
  idempotans!: string;

  @IsString()
  yon!: string;
}

export class IceAktarDto {
  @IsString()
  kaynak!: string;

  @IsString()
  satirOzet!: string;
}

export class YapiDto {
  @IsString()
  anahtar!: string;

  @IsString()
  deger!: string;
}

export class RiskDto {
  @IsString()
  tur!: string;

  @IsString()
  aciklama!: string;
}

export class OcrDto {
  @IsUUID()
  belgeId!: string;

  @IsString()
  metin!: string;
}

export class OcrOnayDto {
  @IsBoolean()
  uygula!: boolean;
}
