# DYTOPIA CANVA POSTER METİNLERİ

## Üst Başlık

DYTOPIA: ÇOK AŞAMALI MALZEME NORMALİZASYONU VE AÇIKLANABİLİR TARİF ÖNERİ SİSTEMİ

Halil İbrahim YILDIRIM

Danışman: Dr. Öğr. Üyesi Volkan ATEŞ

Tarsus Üniversitesi, Mühendislik Fakültesi, Bilgisayar Mühendisliği Bölümü, 2026

---

## GİRİŞ / PROBLEM

Danışanlar evde bulunan malzemeleri farklı yazım biçimleri, günlük dil ifadeleri ve marka adlarıyla sisteme girebilmektedir. Bu girdiler doğrudan tarif kurallarıyla karşılaştırıldığında yanlış eşleşme, uygun tariflerin elenmesi ve öneri nedenlerinin açıklanamaması riski oluşur. Ayrıca diyetisyen planı, yasaklı malzemeler ve güvenli alternatifler öneri sürecinde birlikte değerlendirilmelidir.

**Araştırma Sorusu:** Serbest metin malzeme girdileri güvenli biçimde standartlaştırılarak diyetisyen kurallarıyla açıklanabilir ve uygulanabilir tarif önerilerine dönüştürülebilir mi?

---

## AMAÇ

• Serbest metin malzeme girdilerini standart malzeme kimliklerine dönüştürmek.

• Zorunlu, opsiyonel, yasaklı ve alternatif malzemeleri birlikte değerlendiren açıklanabilir bir tarif öneri motoru geliştirmek.

• Danışan mobil uygulaması, diyetisyen web paneli ve backend servislerini ortak veri modeliyle bütünleştirmek.

• Premium içerik erişimini ve klinikler arası veri izolasyonunu güvenli hâle getirmek.

---

## METODOLOJİ VE MODEL MİMARİSİ

**Canva'da soldan sağa kutular:**

Serbest Metin / Tarama → Canonical Eşleşme → Alias Eşleşmesi → Fuzzy Eşleşme → Unresolved / Kontrollü Yardımcı Katman

**Alt karar akışı:**

Normalize Edilmiş Malzemeler → Aday Tarifler → Rol Tabanlı Kontrol → İkame Değerlendirmesi → Skor ve Açıklanabilir Öneri

**Kısa açıklama:**

Sistem önce deterministik normalizasyon katmanlarını çalıştırır. Belirsiz girdiler yanlış bir malzemeye bağlanmak yerine unresolved olarak korunur. Tarif motoru; zorunlu, opsiyonel, yasaklı ve alternatif malzemeleri değerlendirerek öneri, eksik malzeme ve red nedenlerini üretir.

---

## DYTOPIA SİSTEM ENTEGRASYONU

**Üst kutular:**

Danışan Mobil Uygulaması | Diyetisyen Web Paneli | Tarif ve Plan Yönetimi

**Orta kutu:**

Dytopia Backend API (ASP.NET Core)

Kimlik doğrulama • iş kuralları • öneri servisleri • veri erişimi

**Alt kutular:**

React Native / Expo | Next.js Web Panel | EF Core + PostgreSQL | SignalR

**Kısa açıklama:**

Mobil danışan uygulaması ve diyetisyen web paneli ortak backend servislerini kullanır. Diyetisyenin tanımladığı plan ve tarif kuralları mobil öneri sürecine aktarılır; sonuçlar açıklamalarıyla birlikte kullanıcıya sunulur.

**Bu bölüme eklenecek görseller:**

`mobile-kitchen.png`, `mobile-recommendation.png` ve `web-dashboard.jpg`

---

## BULGULAR

• Normalizasyon sistemi 73 senaryonun 72'sinde doğru sonuç üreterek %98,63 doğruluğa ulaştı.

• Yanlış malzemeye bağlanma oranı (false match) %0,00 olarak ölçüldü.

• Alias ve fuzzy katmanları, canonical-only doğruluğunu %49,32'den %98,63'e yükseltti.

• Tarif öneri motoru 36 senaryonun tamamında doğru karar üretti: %100 başarı.

• Premium Guard ve Tenant Isolation testleri 10/10 başarı gösterdi.

**Grafik altı kısa metin:**

Çok aşamalı normalizasyon, yüksek doğruluk sağlarken belirsiz girdileri güvenli biçimde unresolved olarak bırakmıştır.

**Bu bölüme önerilen ana grafik:**

`core-success-metrics.png`

**Alternatif grafikler:**

`resolver-layer-distribution.png` veya `api-average-latency.png`

---

## SONUÇ

• Dytopia, serbest metin malzeme girdilerini çok aşamalı bir normalizasyon hattından geçirerek güvenli ve açıklanabilir tarif kararlarına dönüştürmektedir.

• Geliştirilen tarif motoru yalnızca benzerlik skoruna değil; diyetisyen tarafından tanımlanan zorunlu, yasaklı ve alternatif malzeme kurallarına dayanmaktadır.

• Teknik doğrulama sonuçları, sistemin yüksek doğruluk, sıfır yanlış eşleşme ve başarılı veri izolasyonu sağladığını göstermiştir.

• Yapay zekâ nihai karar verici olarak değil, deterministik katmanların çözemediği belirsiz girdiler için kontrollü yardımcı katman olarak konumlandırılmıştır.

---

## KAYNAKLAR

• Ricci, F., Rokach, L. ve Shapira, B. (2022). Recommender Systems Handbook. Springer.

• Dytopia Teknik Benchmark ve Test Sonuçları (2026).

---

## CANVA YERLEŞİMİ İÇİN KISA NOTLAR

• Arkadaşınızın posterindeki `TarsusFer ENTEGRASYONU` başlığını `DYTOPIA SİSTEM ENTEGRASYONU` olarak değiştirin.

• Bulgular alanında tek ana grafik kullanacaksanız `core-success-metrics.png` dosyasını kullanın.

• Entegrasyon alanında üç görsel kullanacaksanız `mobile-kitchen.png`, `mobile-recommendation.png` ve `web-dashboard.jpg` dosyalarını kullanın.

• Metin kutularında taşma olursa ilk olarak Giriş / Problem bölümünün ilk paragrafını kısaltın; sayısal bulguları silmeyin.

• Ana renk olarak Dytopia logosundaki yeşil tonlarını, çerçevelerde Tarsus Üniversitesi logosundaki lacivert tonu kullanın.
