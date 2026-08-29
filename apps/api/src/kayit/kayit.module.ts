import { Module } from "@nestjs/common";
import { KayitController } from "./kayit.controller";
import { KayitService } from "./kayit.service";

@Module({
  controllers: [KayitController],
  providers: [KayitService],
})
export class KayitModule {}
