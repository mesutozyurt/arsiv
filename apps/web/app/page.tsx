export default function Page() {
  return (
    <main style={{ maxWidth: "40rem", margin: "3rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem" }}>Kurum arşivi</h1>
      <p>
        Fiziksel ve elektronik kayıtların tasnifi, konumu, ödünç, tarama, saklama ve imha
        kapıları. Vatandaş arşivi doğrudan arayamaz; suret talebi arşiv personeli üzerinden
        işlenir.
      </p>
      <p>
        <a href="/giris">Personel girişi</a>
      </p>
    </main>
  );
}
