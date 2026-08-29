import { IsString, MinLength } from "class-validator";

export class GirisDto {
  @IsString()
  @MinLength(2)
  kullaniciAdi!: string;

  @IsString()
  @MinLength(4)
  sifre!: string;
}
