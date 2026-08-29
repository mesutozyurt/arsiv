import { Global, Module } from "@nestjs/common";
import { DepoService } from "./depo.service";

@Global()
@Module({
  providers: [DepoService],
  exports: [DepoService],
})
export class DepoModule {}
