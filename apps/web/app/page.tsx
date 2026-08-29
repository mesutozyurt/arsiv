async function apiDurumu(): Promise<string> {
  try {
    const yanit = await fetch("http://arsiv-api:3001/api/v1/health", {
      cache: "no-store",
    });
    if (!yanit.ok) return "yanıt yok";
    const govde = (await yanit.json()) as { status?: string };
    return govde.status === "ok" ? "çalışıyor" : "beklenmeyen yanıt";
  } catch {
    return "bağlanamadı";
  }
}

export default async function Page() {
  const durum = await apiDurumu();
  return (
    <main style={{ maxWidth: "40rem", margin: "4rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "1.4rem" }}>Arşiv laboratuvarı</h1>
      <p>
        Belediye arşiv yazılımı — Dilim 1: fon, seri, dosya, belge ve fiziksel konum.
      </p>
      <p>
        API: <strong>{durum}</strong>
      </p>
      <p>
        <a href="/kayit">Kayıt ekranına git</a>
      </p>
    </main>
  );
}
