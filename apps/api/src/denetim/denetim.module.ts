import { Module } from "@nestjs/common";
import { DenetimController } from "./denetim.controller";
import { DenetimInterceptor } from "./denetim.interceptor";
import { DenetimService } from "./denetim.service";

@Module({
  controllers: [DenetimController],
  providers: [DenetimService, DenetimInterceptor],
  exports: [DenetimService, DenetimInterceptor],
})
export class DenetimModule {}
