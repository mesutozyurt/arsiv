import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Rol } from "@prisma/client";
import type { Aktor } from "./aktor";
import { ROLLER_ANAHTAR } from "./roller.decorator";

@Injectable()
export class RolGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const gereken = this.reflector.getAllAndOverride<Rol[]>(ROLLER_ANAHTAR, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!gereken?.length) return true;
    const req = ctx.switchToHttp().getRequest<{ aktor?: Aktor }>();
    if (!req.aktor || !gereken.includes(req.aktor.rol)) {
      throw new ForbiddenException("Bu işlem için yetki yok");
    }
    return true;
  }
}
