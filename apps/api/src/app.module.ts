import { Module } from "@nestjs/common";
import { DepoModule } from "./depo/depo.module";
import { HealthModule } from "./health/health.module";
import { KayitModule } from "./kayit/kayit.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, DepoModule, HealthModule, KayitModule],
})
export class AppModule {}
