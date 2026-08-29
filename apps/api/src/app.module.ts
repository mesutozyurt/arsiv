import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { KimlikGuard } from "./auth/kimlik.guard";
import { RolGuard } from "./auth/rol.guard";
import { DenetimInterceptor } from "./denetim/denetim.interceptor";
import { DenetimModule } from "./denetim/denetim.module";
import { DepoModule } from "./depo/depo.module";
import { HealthModule } from "./health/health.module";
import { KayitModule } from "./kayit/kayit.module";
import { PrismaModule } from "./prisma/prisma.module";
import { YasamModule } from "./yasam/yasam.module";

@Module({
  imports: [
    PrismaModule,
    DepoModule,
    AuthModule,
    DenetimModule,
    HealthModule,
    KayitModule,
    YasamModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: KimlikGuard },
    { provide: APP_GUARD, useClass: RolGuard },
    { provide: APP_INTERCEPTOR, useClass: DenetimInterceptor },
  ],
})
export class AppModule {}
