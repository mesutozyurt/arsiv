import { Module } from "@nestjs/common";
import { IcerikService } from "./icerik.service";
import { KayitController } from "./kayit.controller";
import { KayitService } from "./kayit.service";

@Module({
  controllers: [KayitController],
  providers: [KayitService, IcerikService],
})
export class KayitModule {}
