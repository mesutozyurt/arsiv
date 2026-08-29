const TATILLER = new Set([
  "2026-01-01",
  "2026-03-20",
  "2026-03-21",
  "2026-04-23",
  "2026-05-01",
  "2026-05-19",
  "2026-07-15",
  "2026-08-30",
  "2026-10-29",
]);

export function isGunuMu(tarih: Date): boolean {
  const gun = tarih.getUTCDay();
  if (gun === 0 || gun === 6) return false;
  const iso = tarih.toISOString().slice(0, 10);
  return !TATILLER.has(iso);
}

/** Başlangıç gününden sonra `adet` iş günü ekler (hafta sonu + 2026 resmi tatil). */
export function isGunuEkle(baslangic: Date, adet: number): Date {
  const d = new Date(baslangic);
  let kalan = adet;
  while (kalan > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isGunuMu(d)) kalan -= 1;
  }
  return d;
}
