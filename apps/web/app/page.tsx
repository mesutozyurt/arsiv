export default function Page() {
  return (
    <main className="kabuk">
      <div className="kahraman">
        <section className="kart kahraman-govde">
          <p className="meta">İlçe belediyesi · kurum arşivi</p>
          <h1>Kayıt, konum, ödünç ve imha tek defterde</h1>
          <p className="lede">
            Personel fon–seri–dosya tasnifini, raf konumunu ve taramayı işler.
            Vatandaş arşivi doğrudan aramaz; suret talebi memur üzerinden yürür.
          </p>
          <p>
            <a className="dugme dugme-ana" href="/giris">
              Personel girişi
            </a>
          </p>
        </section>
        <aside className="kart kahraman-yan">
          <h2>Bu turda</h2>
          <p className="meta">Konum olmadan kayıt tamamlanmaz.</p>
          <p className="meta">Aynı asıl ikinci kişiye ödünç verilmez.</p>
          <p className="meta">İmha otomatik çalışmaz; kapılar sırayladır.</p>
        </aside>
      </div>
      <div className="ozet-kartlar">
        <article className="kart ozet-kart">
          <strong>Tasnif</strong>
          Fon, seri, dosya, belge ve fiziksel konum.
        </article>
        <article className="kart ozet-kart">
          <strong>İşlemler</strong>
          Arama, ödünç, ayıklama-imha, suret, denetim.
        </article>
        <article className="kart ozet-kart">
          <strong>Kanıt</strong>
          Özgün tarama silinmez; imha 10 yıl iz bırakır.
        </article>
      </div>
    </main>
  );
}
