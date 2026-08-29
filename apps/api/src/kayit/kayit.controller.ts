import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IcerikRolu, Rol } from "@prisma/client";
import type { Response } from "express";
import type { Aktor } from "../auth/aktor";
import { IcerikService } from "./icerik.service";
import {
  BelgeOlusturDto,
  DosyaGuncelleDto,
  DosyaOlusturDto,
  KonumAtaDto,
  TaramaYukleDto,
} from "./kayit.dto";
import { KayitService } from "./kayit.service";

@Controller("v1")
export class KayitController {
  constructor(
    private readonly kayit: KayitService,
    private readonly icerik: IcerikService,
  ) {}

  @Get("agac")
  agac(@Req() req: { aktor: Aktor }) {
    return this.kayit.agac(req.aktor);
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

  @Post("belgeler/:id/icerik")
  @UseInterceptors(FileInterceptor("dosya", { limits: { fileSize: 20 * 1024 * 1024 } }))
  belgeIcerik(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() dosya: Express.Multer.File,
  ) {
    return this.icerik.belgeIcerikBagla(id, dosya, IcerikRolu.OZGUN);
  }

  @Post("belgeler/:id/taramalar")
  @UseInterceptors(FileInterceptor("dosya", { limits: { fileSize: 20 * 1024 * 1024 } }))
  taramaEkle(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() dosya: Express.Multer.File,
    @Body() govde: TaramaYukleDto,
  ) {
    return this.icerik.taramaEkle(id, dosya, {
      cihaz: govde.cihaz,
      operatorAd: govde.operatorAd,
      sayfaSayisi: Number(govde.sayfaSayisi),
      profil: govde.profil,
      kalite: govde.kalite,
      oncekiTaramaId: govde.oncekiTaramaId || undefined,
    });
  }

  @Get("nesneler/:id")
  async nesneIndir(
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
    @Req() req: { aktor: Aktor },
  ) {
    if (req.aktor.rol === Rol.BILISIM) {
      throw new ForbiddenException("Bilişim içeriğe erişemez");
    }
    const { nesne, akis } = await this.icerik.nesneGetir(id);
    res.setHeader("Content-Type", nesne.mime);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${nesne.sha256.slice(0, 12)}.${nesne.format}"`,
    );
    akis.pipe(res);
  }
}
