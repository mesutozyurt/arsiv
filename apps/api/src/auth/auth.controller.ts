import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Aktor } from "./aktor";
import { AuthService } from "./auth.service";
import { GirisDto } from "./auth.dto";
import { Public } from "./public";

@Controller("v1")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("oturum")
  giris(@Body() dto: GirisDto) {
    return this.auth.giris(dto.kullaniciAdi, dto.sifre);
  }

  @Get("ben")
  ben(@Req() req: { aktor: Aktor }) {
    return req.aktor;
  }
}
