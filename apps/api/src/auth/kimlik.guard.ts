import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Rol } from "@prisma/client";
import { Reflector } from "@nestjs/core";
import { verify } from "jsonwebtoken";
import { PUBLIC_ANAHTAR } from "./public";
import type { Aktor } from "./aktor";

@Injectable()
export class KimlikGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const acik = this.reflector.getAllAndOverride<boolean>(PUBLIC_ANAHTAR, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (acik) return true;
    const req = ctx.switchToHttp().getRequest<{ headers: { authorization?: string }; aktor?: Aktor }>();
    const ham = req.headers.authorization ?? "";
    const token = ham.startsWith("Bearer ") ? ham.slice(7) : "";
    if (!token) throw new UnauthorizedException("Oturum gerekli");
    try {
      const gizli = process.env.JWT_SECRET ?? "lab-jwt-degistir";
      req.aktor = verify(token, gizli) as Aktor;
      const method = ctx.switchToHttp().getRequest<{ method: string }>().method;
      if (req.aktor.rol === Rol.DENETCI && method !== "GET") {
        throw new ForbiddenException("Denetçi yalnız okur");
      }
      return true;
    } catch {
      throw new UnauthorizedException("Oturum geçersiz");
    }
  }
}
