import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import {
  BelgeOlusturDto,
  DosyaGuncelleDto,
  DosyaOlusturDto,
  KonumAtaDto,
} from "./kayit.dto";
import { KayitService } from "./kayit.service";

@Controller("v1")
export class KayitController {
  constructor(private readonly kayit: KayitService) {}

  @Get("agac")
  agac() {
    return this.kayit.agac();
  }

  @Get("dosyalar/:id")
  dosyaGetir(@Param("id", ParseUUIDPipe) id: string) {
    return this.kayit.dosyaGetir(id);
  }

  @Post("dosyalar")
  dosyaOlustur(@Body() dto: DosyaOlusturDto) {
    return this.kayit.dosyaOlustur(dto);
  }

  @Patch("dosyalar/:id")
  dosyaGuncelle(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: DosyaGuncelleDto,
  ) {
    return this.kayit.dosyaGuncelle(id, dto);
  }

  @Post("dosyalar/:id/konum")
  konumAta(@Param("id", ParseUUIDPipe) id: string, @Body() dto: KonumAtaDto) {
    return this.kayit.konumAta(id, dto);
  }

  @Post("dosyalar/:id/tamamla")
  tamamla(@Param("id", ParseUUIDPipe) id: string) {
    return this.kayit.tamamla(id);
  }

  @Post("belgeler")
  belgeOlustur(@Body() dto: BelgeOlusturDto) {
    return this.kayit.belgeOlustur(dto);
  }
}
