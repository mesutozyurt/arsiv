import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";
import type { Aktor } from "../auth/aktor";
import { DenetimService } from "./denetim.service";

@Injectable()
export class DenetimInterceptor implements NestInterceptor {
  constructor(private readonly denetim: DenetimService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<{
      method: string;
      url: string;
      aktor?: Aktor;
    }>();
    if (req.url.includes("/health") || req.url.includes("/oturum")) {
      return next.handle();
    }
    return next.handle().pipe(
      tap(() => {
        void this.denetim.yaz(
          req.aktor,
          req.method,
          req.url,
          `${req.method} ${req.url}`,
        );
      }),
    );
  }
}
