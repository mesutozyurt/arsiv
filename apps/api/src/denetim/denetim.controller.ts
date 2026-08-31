import { Controller, Get } from "@nestjs/common";
import { Rol } from "@prisma/client";
import { Roller } from "../auth/roller.decorator";
import { DenetimService } from "./denetim.service";

@Controller("v1/denetim")
export class DenetimController {
  constructor(private readonly denetim: DenetimService) {}

  @Get()
  @Roller(Rol.DENETCI, Rol.UST_YONETICI, Rol.ARSIV_MEMURU)
  liste() {
    return this.denetim.liste();
  }

  @Get("dogrula")
  @Roller(Rol.DENETCI, Rol.UST_YONETICI, Rol.ARSIV_MEMURU)
  dogrula() {
    return this.denetim.dogrula();
  }
}
