export default function Kilavuz() {
  return (
    <main className="kabuk">
      <header className="sayfa-baslik">
        <h1>Kısa kılavuz</h1>
        <p>Personel günlük iş sırası. Vatandaş arşivi aramaz.</p>
      </header>
      <section className="kart">
        <h2>Tasnif</h2>
        <ol>
          <li>Dosyayı kod, konu, seri, birim, asıl/kopya ile açın.</li>
          <li>Raf konumunu verin; yoksa kayıt tamamlanmaz.</li>
          <li>Saklama planı sürümünü bağlayın (geri alınamaz).</li>
          <li>Belge ekleyin, özgün dosyayı ve taramayı yükleyin. Yeniden tarama eskisini silmez.</li>
          <li>OCR metni öneri olarak kaydedilir; İşlemler → OCR onay olmadan konu değişmez.</li>
        </ol>
      </section>
      <section className="kart">
        <h2>Ödünç ve imha</h2>
        <ol>
          <li>Dışarıdaki asıl ikinci kişiye verilmez. İade ve uzatma İşlemler’dedir.</li>
          <li>İmha adayı yalnız süresi dolmuş, plansız olmayan, bekletmesiz kayıtlı dosyadır (`DSY-2010-0001` örnek).</li>
          <li>Beş komisyon üyesi oy verir; çoğunluk + DAB + üst onay olmadan icra yok.</li>
        </ol>
      </section>
      <section className="kart">
        <h2>Başvuru</h2>
        <p>
          Vatandaş <a href="/basvuru">/basvuru</a> ile kayıt açar. Personel dosyayı İşlemler’de bağlar ve cevaplar.
        </p>
      </section>
    </main>
  );
}
