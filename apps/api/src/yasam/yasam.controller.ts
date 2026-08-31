import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req } from "@nestjs/common";
import { Rol } from "@prisma/client";
import type { Aktor } from "../auth/aktor";
import { Public } from "../auth/public";
import { Roller } from "../auth/roller.decorator";
import {
  BekletmeDto,
  DabDto,
  EntegrasyonDto,
  EypDto,
  IceAktarDto,
  ImhaAcDto,
  ImhaOyDto,
  KarartmaDto,
  OduncDto,
  OduncIadeDto,
  OduncUzatDto,
  OcrDto,
  OcrOnayDto,
  PlanBaglaDto,
  RiskDto,
  TalepCevapDto,
  TalepDto,
  YapiDto,
} from "./yasam.dto";
import { YasamService } from "./yasam.service";

@Controller("v1")
export class YasamController {
  constructor(private readonly yasam: YasamService) {}

  @Get("planlar")
  planlar() {
    return this.yasam.planlar();
  }

  @Post("dosyalar/:id/plan")
  @Roller(Rol.ARSIV_MEMURU, Rol.BIRIM_SORUMLUSU)
  plan(@Param("id", ParseUUIDPipe) id: string, @Body() dto: PlanBaglaDto) {
    return this.yasam.dosyayaPlan(id, dto.planSurumId);
  }

  @Post("dosyalar/:id/bekletme")
  @Roller(Rol.ARSIV_MEMURU, Rol.UST_YONETICI)
  bekletme(@Param("id", ParseUUIDPipe) id: string, @Body() dto: BekletmeDto) {
    return this.yasam.bekletmeKoy(id, dto.sebep, dto.makam);
  }

  @Post("bekletme/:id/kaldir")
  @Roller(Rol.ARSIV_MEMURU, Rol.UST_YONETICI)
  bekletmeKaldir(@Param("id", ParseUUIDPipe) id: string) {
    return this.yasam.bekletmeKaldir(id);
  }

  @Get("oduncler")
  oduncler() {
    return this.yasam.oduncler();
  }

  @Post("oduncler")
  @Roller(Rol.ARSIV_MEMURU, Rol.BIRIM_SORUMLUSU)
  oduncVer(@Body() dto: OduncDto) {
    return this.yasam.oduncVer(dto.dosyaId, dto.talepEden, dto.birimAd, dto.gun ?? 7);
  }

  @Post("oduncler/:id/uzat")
  @Roller(Rol.ARSIV_MEMURU, Rol.BIRIM_SORUMLUSU)
  uzat(@Param("id", ParseUUIDPipe) id: string, @Body() dto: OduncUzatDto) {
    return this.yasam.oduncUzat(id, dto.gun ?? 7);
  }

  @Post("oduncler/:id/iade")
  @Roller(Rol.ARSIV_MEMURU, Rol.BIRIM_SORUMLUSU)
  iade(@Param("id", ParseUUIDPipe) id: string, @Body() dto: OduncIadeDto = {}) {
    return this.yasam.oduncIade(id, dto.kondisyon);
  }

  @Get("ara")
  ara(@Query("q") q: string, @Req() req: { aktor: Aktor }) {
    return this.yasam.ara(q ?? "", req.aktor);
  }

  @Get("imha")
  imhaListeleri() {
    return this.yasam.imhaListeleri();
  }

  @Post("imha")
  @Roller(Rol.ARSIV_MEMURU)
  imhaAc(@Body() dto: ImhaAcDto, @Req() req: { aktor: Aktor }) {
    return this.yasam.imhaListeAc(req.aktor, dto.dosyaIdleri);
  }

  @Post("imha/:id/oy")
  @Roller(Rol.KOMISYON)
  oy(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ImhaOyDto, @Req() req: { aktor: Aktor }) {
    return this.yasam.imhaOy(id, req.aktor, dto.kabul, dto.gerekce);
  }

  @Post("imha/:id/dab")
  @Roller(Rol.ARSIV_MEMURU, Rol.UST_YONETICI)
  dab(@Param("id", ParseUUIDPipe) id: string, @Body() dto: DabDto) {
    return this.yasam.imhaDab(id, dto.dabGorusNo);
  }

  @Post("imha/:id/onay")
  @Roller(Rol.UST_YONETICI)
  onay(@Param("id", ParseUUIDPipe) id: string, @Req() req: { aktor: Aktor }) {
    return this.yasam.imhaUstOnay(id, req.aktor);
  }

  @Post("imha/:id/icra")
  @Roller(Rol.ARSIV_MEMURU)
  icra(@Param("id", ParseUUIDPipe) id: string, @Req() req: { aktor: Aktor }) {
    return this.yasam.imhaIcra(id, req.aktor);
  }

  @Get("talepler")
  talepler() {
    return this.yasam.talepler();
  }

  @Post("talepler")
  @Roller(Rol.ARSIV_MEMURU, Rol.BIRIM_SORUMLUSU)
  talep(@Body() dto: TalepDto) {
    return this.yasam.talepAc(dto);
  }

  @Post("talepler/:id/karartma")
  @Roller(Rol.ARSIV_MEMURU)
  karartma(@Param("id", ParseUUIDPipe) id: string, @Body() dto: KarartmaDto) {
    return this.yasam.karartilmisKopya(id, dto.nesneId);
  }

  @Get("dosyalar/:id/kvkk")
  kvkk(@Param("id", ParseUUIDPipe) id: string) {
    return this.yasam.kvkkCarpisma(id);
  }

  @Post("eyp")
  @Roller(Rol.ARSIV_MEMURU)
  eyp(@Body() dto: EypDto) {
    return this.yasam.eypAl(dto.belgeId, dto.paketHash, dto.teslimDelili, dto.yon);
  }

  @Post("belgeler/:id/imza-kuyruk")
  @Roller(Rol.ARSIV_MEMURU, Rol.BILISIM)
  imza(@Param("id", ParseUUIDPipe) id: string) {
    return this.yasam.imzaKuyruk(id);
  }

  @Post("entegrasyon")
  @Roller(Rol.ARSIV_MEMURU, Rol.BILISIM)
  entegrasyon(@Body() dto: EntegrasyonDto) {
    return this.yasam.entegrasyon(dto);
  }

  @Post("ice-aktarim")
  @Roller(Rol.ARSIV_MEMURU, Rol.BILISIM)
  ice(@Body() dto: IceAktarDto) {
    return this.yasam.iceAktar(dto.kaynak, dto.satirOzet);
  }

  @Get("devir-paketi")
  @Roller(Rol.ARSIV_MEMURU, Rol.DENETCI, Rol.UST_YONETICI)
  devir() {
    return this.yasam.disaAktar();
  }

  @Post("yapilandirma")
  @Roller(Rol.BILISIM, Rol.UST_YONETICI)
  yapi(@Body() dto: YapiDto) {
    return this.yasam.yapilandirma(dto.anahtar, dto.deger);
  }

  @Post("yapilandirma/:id/onay")
  @Roller(Rol.UST_YONETICI)
  yapiOnay(@Param("id", ParseUUIDPipe) id: string) {
    return this.yasam.yapilandirmaOnay(id);
  }

  @Post("risk")
  @Roller(Rol.ARSIV_MEMURU, Rol.BILISIM)
  risk(@Body() dto: RiskDto) {
    return this.yasam.risk(dto.tur, dto.aciklama);
  }

  @Post("ocr")
  @Roller(Rol.ARSIV_MEMURU)
  ocr(@Body() dto: OcrDto) {
    return this.yasam.ocrOner(dto.belgeId, dto.metin);
  }

  @Post("ocr/:id/onay")
  @Roller(Rol.ARSIV_MEMURU)
  ocrOnay(@Param("id", ParseUUIDPipe) id: string, @Body() dto: OcrOnayDto) {
    return this.yasam.ocrOnay(id, dto.uygula);
  }

  @Get("raporlar")
  raporlar() {
    return this.yasam.raporlar();
  }

  @Get("yedek")
  yedek() {
    return this.yasam.yedekRapor();
  }

  @Get("ozet")
  ozet() {
    return this.yasam.ozet();
  }

  @Get("yapilandirma")
  yapilar() {
    return this.yasam.yapilandirmalar();
  }

  @Get("ice-aktarim")
  iceListe() {
    return this.yasam.iceAktarimlar();
  }

  @Get("eyp")
  eypListe() {
    return this.yasam.eypPaketler();
  }

  @Get("ocr")
  ocrListe() {
    return this.yasam.ocrOneriler();
  }

  @Get("risk")
  riskListe() {
    return this.yasam.riskler();
  }

  @Get("entegrasyon")
  entegrasyonListe() {
    return this.yasam.entegrasyonlar();
  }

  @Post("talepler/:id/cevap")
  @Roller(Rol.ARSIV_MEMURU, Rol.UST_YONETICI)
  talepCevap(@Param("id", ParseUUIDPipe) id: string, @Body() dto: TalepCevapDto) {
    return this.yasam.talepCevap(id, dto.durum, dto.karar);
  }

  @Public()
  @Post("halk/talepler")
  halkTalep(@Body() dto: TalepDto) {
    return this.yasam.talepAc({ ...dto, dosyaId: undefined });
  }
}
