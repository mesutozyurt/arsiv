import { NushaTuru } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class DosyaOlusturDto {
  @IsString()
  @MinLength(3)
  kod!: string;

  @IsString()
  @MinLength(3)
  konu!: string;

  @IsUUID()
  seriId!: string;

  @IsUUID()
  birimId!: string;

  @IsEnum(NushaTuru)
  nushaTuru!: NushaTuru;

  @IsString()
  @MinLength(2)
  ureticiBirimAd!: string;

  @IsString()
  @MinLength(2)
  sahipKurum!: string;

  @IsOptional()
  @IsString()
  kaynakSistem?: string;

  @IsOptional()
  @IsUUID()
  konumId?: string;
}

export class DosyaGuncelleDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  konu?: string;

  @IsOptional()
  @IsEnum(NushaTuru)
  nushaTuru?: NushaTuru;

  @IsOptional()
  @IsString()
  ureticiBirimAd?: string;

  @IsOptional()
  @IsString()
  sahipKurum?: string;
}

export class KonumAtaDto {
  @IsUUID()
  konumId!: string;

  @IsOptional()
  @IsString()
  gerekce?: string;
}

export class BelgeOlusturDto {
  @IsString()
  @MinLength(3)
  kod!: string;

  @IsUUID()
  dosyaId!: string;

  @IsString()
  @MinLength(2)
  tur!: string;

  @IsOptional()
  @IsString()
  sayi?: string;

  @IsString()
  @MinLength(3)
  konu!: string;

  @IsString()
  @MinLength(2)
  uretici!: string;

  @IsEnum(NushaTuru)
  nushaTuru!: NushaTuru;
}
