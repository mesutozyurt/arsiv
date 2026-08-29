import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/public";

@Controller("v1/health")
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: "ok", service: "arsiv-api" };
  }
}
