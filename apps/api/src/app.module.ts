import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { KayitModule } from "./kayit/kayit.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, HealthModule, KayitModule],
})
export class AppModule {}
