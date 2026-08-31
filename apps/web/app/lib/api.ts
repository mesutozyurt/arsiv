export type Aktor = {
  id: string;
  kullaniciAdi: string;
  ad: string;
  rol: string;
  birimId: string | null;
};

const ANAHTAR = "arsiv-token";

export function tokenAl(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ANAHTAR);
}

export function tokenYaz(token: string) {
  sessionStorage.setItem(ANAHTAR, token);
}

export function cikis() {
  sessionStorage.removeItem(ANAHTAR);
}

export async function api<T>(yol: string, init?: RequestInit): Promise<T> {
  const token = tokenAl();
  const yanit = await fetch(yol, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (yanit.status === 401 && typeof window !== "undefined" && !yol.startsWith("/api/v1/halk")) {
    window.location.href = "/giris";
  }
  const govde = await yanit.json().catch(() => ({}));
  if (!yanit.ok) {
    const mesaj =
      (govde as { message?: string | string[] }).message ?? yanit.statusText;
    throw new Error(Array.isArray(mesaj) ? mesaj.join(", ") : String(mesaj));
  }
  return govde as T;
}

export async function yukle<T>(yol: string, form: FormData): Promise<T> {
  const token = tokenAl();
  const yanit = await fetch(yol, {
    method: "POST",
    body: form,
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  const govde = await yanit.json().catch(() => ({}));
  if (!yanit.ok) {
    const mesaj =
      (govde as { message?: string | string[] }).message ?? yanit.statusText;
    throw new Error(Array.isArray(mesaj) ? mesaj.join(", ") : String(mesaj));
  }
  return govde as T;
}
