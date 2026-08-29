import { SetMetadata } from "@nestjs/common";
import { Rol } from "@prisma/client";

export const ROLLER_ANAHTAR = "arsiv_roller";
export const Roller = (...roller: Rol[]) => SetMetadata(ROLLER_ANAHTAR, roller);
