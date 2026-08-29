import { SetMetadata } from "@nestjs/common";

export const PUBLIC_ANAHTAR = "arsiv_public";
export const Public = () => SetMetadata(PUBLIC_ANAHTAR, true);
