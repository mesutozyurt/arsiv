import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from "@nestjs/common";
import { Rol } from "@prisma/client";
import type { Aktor } from "./aktor";
import { AuthService } from "./auth.service";
import { GirisDto } from "./auth.dto";
import { Public } from "./public";
import { Roller } from "./roller.decorator";

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

  @Get("kullanicilar")
  @Roller(Rol.BILISIM, Rol.UST_YONETICI, Rol.ARSIV_MEMURU)
  kullanicilar() {
    return this.auth.kullanicilar();
  }

  @Post("kullanicilar/:id/kapat")
  @Roller(Rol.BILISIM, Rol.UST_YONETICI)
  kapat(@Param("id", ParseUUIDPipe) id: string) {
    return this.auth.kapat(id);
  }
}
