import { Rol } from "@prisma/client";

export type Aktor = {
  id: string;
  kullaniciAdi: string;
  ad: string;
  rol: Rol;
  birimId: string | null;
};
