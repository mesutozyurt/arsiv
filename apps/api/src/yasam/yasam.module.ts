import { Module } from "@nestjs/common";
import { YasamController } from "./yasam.controller";
import { YasamService } from "./yasam.service";

@Module({
  controllers: [YasamController],
  providers: [YasamService],
  exports: [YasamService],
})
export class YasamModule {}
