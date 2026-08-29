import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { KimlikGuard } from "./kimlik.guard";
import { RolGuard } from "./rol.guard";

@Module({
  controllers: [AuthController],
  providers: [AuthService, KimlikGuard, RolGuard],
  exports: [AuthService, KimlikGuard, RolGuard],
})
export class AuthModule {}
