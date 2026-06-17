import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import { Fragment, jsx, jsxs } from "@oai/artifact-tool/presentation-jsx/jsx-runtime";

const ROOT = "C:/Users/hy971/source/repos/MyDietitianMobileApp";
const OUT = path.join(ROOT, "outputs/manual-20260612-dytopia-posters/presentations/dytopia-10-posters/output");
const PREVIEW = path.join(ROOT, "outputs/manual-20260612-dytopia-posters/presentations/dytopia-10-posters/preview-final");
const W = 1307;
const H = 918;
const NAVY = "#172A55";
const INK = "#101828";
const MUTED = "#475467";
const PAPER = "#FFFFFF";
const SOFT = "#F5F6F3";
const GREEN = "#E9F5EF";
const PURPLE = "#F0EEFC";
const ORANGE = "#FFF1E6";

const refs = [
  "Burke (2002)",
  "Ricci vd. (2022)",
  "Chen vd. (2023)",
  "Li vd. (2023)",
  "Kim vd. (2025)",
  "Dytopia benchmark (2026)",
];

const posters = [
  {
    slug: "01-genel-sistem",
    title: "DYTOPIA: ÇOK AŞAMALI MALZEME NORMALİZASYONU VE AÇIKLANABİLİR TARİF ÖNERİ SİSTEMİ",
    problem: "Danışanlar evdeki malzemeleri farklı yazım, marka ve günlük dil biçimleriyle ifade eder. Bu girdi doğrudan tarif kurallarıyla karşılaştırıldığında yanlış eşleşme, gereksiz tarif eleme ve açıklanamayan öneri riski oluşur.",
    question: "Serbest metin malzeme girdileri güvenli biçimde standartlaştırılıp diyetisyen kurallarıyla açıklanabilir tarif kararına dönüştürülebilir mi?",
    goals: ["Serbest metni canonical malzeme kimliğine dönüştürmek.", "Zorunlu, opsiyonel, yasak ve alternatif rolleri birlikte değerlendirmek.", "Mobil, web panel ve API katmanlarını ortak veri modeliyle bütünleştirmek."],
    method: ["Serbest metin / tarama", "Canonical + Alias", "Fuzzy + Unresolved", "Kural tabanlı motor", "Açıklanabilir öneri"],
    integration: ["React Native / Expo", "ASP.NET Core API", "EF Core + PostgreSQL", "Next.js Web Panel"],
    metrics: [["Normalizasyon", "98,63%", 0.9863], ["Tarif kararı", "100%", 1], ["Güvenlik", "100%", 1]],
    results: ["73 senaryoda 72 doğru normalizasyon ve %0,00 false match.", "36 tarif karar senaryosunun tamamı doğru sonuçlandı.", "Premium Guard ve Tenant Isolation kontrolleri 10/10 başarı gösterdi."],
    conclusion: ["Dytopia, belirsiz girdiyi doğrudan öneriye çevirmek yerine ölçülebilir resolver katmanlarından geçirir.", "Yapay zekâ nihai karar verici değil, belirsiz girdiler için kontrollü yardımcı katmandır.", "Bulgular klinik etkinlik değil, teknik uygulanabilirlik ve açıklanabilirlik kanıtıdır."],
  },
  {
    slug: "02-malzeme-normalizasyonu",
    title: "DYTOPIA: SERBEST METİN MALZEME GİRDİLERİNİN ÇOK AŞAMALI NORMALİZASYONU",
    problem: "“Yoğurt”, “yogurt”, “inek sütü” veya yazım hatalı girdiler aynı anlamı taşıyabilir. Yalnızca tam metin eşleştirme kullanıldığında kapsama düşer; agresif fuzzy eşleştirme kullanıldığında yanlış ürün eşleşmesi oluşabilir.",
    question: "Canonical, alias, fuzzy ve unresolved katmanları doğruluk ile güvenli reddetme arasında nasıl denge kurar?",
    goals: ["Türkçe karakter ve yazım varyasyonlarını çözmek.", "Belirsiz girdiyi yanlış eşleştirmek yerine unresolved bırakmak.", "Her çözümün katmanını ve güven skorunu kaydetmek."],
    method: ["Ön işleme", "Canonical eşleşme", "Alias eşleşme", "Fuzzy doğrulama", "Unresolved / LLM"],
    integration: ["Mobil malzeme girişi", "Resolver servisi", "Ingredient tabloları", "Benchmark endpoint"],
    metrics: [["Canonical", "49,32%", 0.4932], ["+ Alias", "80,82%", 0.8082], ["+ Fuzzy", "98,63%", 0.9863]],
    results: ["Toplam 73 senaryoda 72 doğru sonuç elde edildi.", "Yanlış eşleşme oranı %0,00; unresolved oranı %15,07 olarak ölçüldü.", "Katman dağılımı: 26 canonical, 23 alias, 13 fuzzy, 11 unresolved."],
    conclusion: ["Alias ve fuzzy katmanları canonical-only doğruluğunu %49,32’den %98,63’e yükseltti.", "Unresolved sonucu güvenlik mekanizması olarak korunmuştur.", "LLM katmanı opsiyoneldir; deterministik katmanların yerine geçmez."],
  },
  {
    slug: "03-tarif-oneri-motoru",
    title: "DYTOPIA: TAKSONOMİ TABANLI AÇIKLANABİLİR TARİF ÖNERİ MOTORU",
    problem: "Klasik tarif eşleştirme, eldeki malzeme sayısına odaklandığında zorunlu malzeme eksikliğini veya yasak içeriği gözden kaçırabilir. Son kullanıcıya neden önerildiği açıklanamayan tarifler güveni azaltır.",
    question: "Malzeme rollerini ve ikame ilişkilerini kullanan kural motoru güvenli ve açıklanabilir öneri üretebilir mi?",
    goals: ["Zorunlu ve yasak malzemeleri kararın merkezine almak.", "Alternatif malzemeleri taksonomi ilişkileriyle değerlendirmek.", "Her tarif için eksik, ikame ve red nedenini göstermek."],
    method: ["Sepet normalizasyonu", "Aday tarif havuzu", "Rol tabanlı kontrol", "İkame değerlendirme", "Skor + açıklama"],
    integration: ["Mutfak ekranı", "Recipe evaluator", "Taksonomi tabloları", "Tarif sonuç ekranı"],
    metrics: [["Karar doğruluğu", "100%", 1], ["Yasak filtre", "100%", 1], ["İkame başarısı", "100%", 1]],
    results: ["36/36 karar senaryosu doğru sınıflandırıldı.", "Yasak malzeme filtresi ve condiment-only guard %100 başarı sağladı.", "Ortalama işlem süresi 0,0246 ms; P95 0,0706 ms ölçüldü."],
    conclusion: ["Motor, yalnızca benzerlik skoru değil açık karar kuralları üretir.", "Zorunlu malzeme eksikliği opsiyonel eşleşmelerle maskelenmez.", "İkame ilişkileri tarifin neden uygun olduğunu kullanıcıya aktarır."],
  },
  {
    slug: "04-taksonomi-ve-ikame",
    title: "DYTOPIA: MALZEME TAKSONOMİSİ VE GÜVENLİ İKAME YÖNETİMİ",
    problem: "Aynı ailedeki ürünler her tarifte birbirinin yerine kullanılamaz. Kontrolsüz ikame, alerjen, diyet kuralı veya tarif bütünlüğü açısından hatalı öneri üretebilir.",
    question: "Aile, varyant ve uyumluluk ilişkileri tarif ikamesini nasıl denetlenebilir hâle getirir?",
    goals: ["Malzeme aileleri ile varyantları ayrı modellemek.", "İkame gücü ve uyumsuzluk kurallarını saklamak.", "Tarif kararında en güçlü güvenli ikameyi seçmek."],
    method: ["Canonical kimlik", "Aile üyeliği", "Uyumluluk kuralı", "İkame katmanı", "Tarif kararı"],
    integration: ["368 malzeme", "23 aile", "126 aile üyeliği", "48 uyumluluk kuralı"],
    metrics: [["Malzeme", "368", 0.92], ["Aile üyesi", "126", 0.70], ["Uyumluluk", "48", 0.48]],
    results: ["Süt ailesinde baz ve varyant ayrımı veri modelinde korunur.", "Birden fazla ikame varsa motor daha güçlü katmanı tercih eder.", "Uyumsuzluk kuralı, tarifin pişirilebilir görünmesini engeller."],
    conclusion: ["Taksonomi, metin benzerliğini alan bilgisiyle sınırlar.", "İkame kararı izlenebilir veri ilişkilerine dayanır.", "Model yeni aile, varyant ve uyumluluk kurallarıyla genişletilebilir."],
  },
  {
    slug: "05-premium-guard-tenant",
    title: "DYTOPIA: ACCESS KEY, PREMIUM GUARD VE TENANT ISOLATION İLE GÜVENLİ B2B2C MİMARİSİ",
    problem: "Diyetisyen destekli çoklu kiracılı platformlarda bir kliniğin tarif, plan ve danışan verisinin başka kiracıya sızması kritik güvenlik riskidir. Premium içerik bağlantısı da doğrulanabilir olmalıdır.",
    question: "Access Key aktivasyonu ve tenant filtreleri danışan-diyetisyen bağını güvenli biçimde koruyabilir mi?",
    goals: ["Access Key ile doğrulanmış bağlantı kurmak.", "Premium içeriği yalnızca bağlı klinik kapsamında göstermek.", "Kiracılar arası veri erişimini servis ve sorgu düzeyinde engellemek."],
    method: ["Access Key üretimi", "Danışan aktivasyonu", "Klinik bağlama", "Premium Guard", "Tenant filtresi"],
    integration: ["Web erişim anahtarı", "JWT / RBAC", "API politika katmanı", "PostgreSQL tenant alanı"],
    metrics: [["Guard", "10/10", 1], ["Tenant", "10/10", 1], ["Hatalı erişim", "0", 0.04]],
    results: ["Premium Guard ve Tenant Isolation testlerinin tamamı geçti.", "Bağlı klinik tarifleri görünürken diğer klinik tarifleri gizlendi.", "Draft ve kapsam dışı tarifler evaluator katmanına ulaşmadı."],
    conclusion: ["Yetkilendirme yalnızca arayüzde değil API ve veri erişiminde uygulanır.", "Access Key, B2B2C bağlantısını denetlenebilir hâle getirir.", "Sonuçlar kontrollü test senaryolarında veri izolasyonunu doğrular."],
  },
  {
    slug: "06-uctan-uca-mimari",
    title: "DYTOPIA: MOBİL, WEB VE BACKEND KATMANLARININ UÇTAN UCA SİSTEM MİMARİSİ",
    problem: "Beslenme platformlarında mobil danışan deneyimi, diyetisyen operasyonu ve öneri motoru ayrı veri modelleriyle geliştirildiğinde tutarsızlık ve bakım maliyeti artar.",
    question: "Ortak domain modeli ve katmanlı servis mimarisi uçtan uca iş akışını nasıl bütünleştirir?",
    goals: ["Mobil ve web istemcilerini ortak API çevresinde birleştirmek.", "Domain, application ve infrastructure sorumluluklarını ayırmak.", "Gerçek zamanlı iletişim ve veri kalıcılığını desteklemek."],
    method: ["React Native istemci", "REST + SignalR", "ASP.NET Core servisleri", "EF Core", "PostgreSQL"],
    integration: ["Mobil danışan", "API gateway / auth", "Domain servisleri", "Diyetisyen web paneli"],
    metrics: [["Tarif API P95", "2,58 ms", 0.88], ["Öneri API P95", "6,02 ms", 0.72], ["Hata", "0", 0.04]],
    results: ["Mobil uygulama, web panel ve backend aynı domain varlıklarını kullanır.", "Tarif eşleştirme HTTP testinde ortalama 1,808 ms ölçüldü.", "Öneri endpoint’i 30 istekte hata üretmedi."],
    conclusion: ["Katmanlı mimari, karar mantığını istemci arayüzlerinden ayırır.", "Ortak API sözleşmesi mobil ve web iş akışını senkronize eder.", "Mimari yeni istemci ve servislerin eklenmesine uygundur."],
  },
  {
    slug: "07-mobil-danisan-deneyimi",
    title: "DYTOPIA: DANIŞAN MOBİL UYGULAMASINDA AKILLI MUTFAK VE UYUM TAKİBİ",
    problem: "Danışanlar diyet planına erişse bile evde ne hazırlayacağını, eksik malzemeyi ve uygun alternatifi hızlıca belirlemekte zorlanabilir. Parçalı ekranlar günlük uyumu azaltır.",
    question: "Plan, dolap, mutfak ve geri bildirim akışları tek mobil deneyimde nasıl birleştirilebilir?",
    goals: ["Günlük plan ve ilerlemeyi görünür kılmak.", "Dolaptaki malzemelerden açıklanabilir tarif önermek.", "Alışveriş listesi, öğün kaydı ve geri bildirimi bağlamak."],
    method: ["Planı görüntüle", "Malzeme ekle / tara", "Tarif öner", "Pişirme modu", "Öğün kaydı"],
    integration: ["Expo / React Native", "Kamera ve tarama", "Kitchen API", "Care SignalR"],
    metrics: [["Temel akış", "5 adım", 0.75], ["Tarif kararı", "100%", 1], ["Öneri P95", "6,02 ms", 0.72]],
    results: ["Mobil akış plan, mutfak, tarif detayı ve alışveriş listesini bütünleştirir.", "Kullanıcıya eksik, ikame ve yasak malzeme nedenleri gösterilir.", "Diyetisyen bağlantısı ve bildirimler aynı hesap bağlamında korunur."],
    conclusion: ["Mobil deneyim, öneri sonucundan önce veri kalitesini görünür kılar.", "Açıklamalar kullanıcının öneriyi değerlendirmesini kolaylaştırır.", "Uygulama klinik karar vermez; diyetisyen planını destekler."],
  },
  {
    slug: "08-diyetisyen-web-paneli",
    title: "DYTOPIA: DİYETİSYEN WEB PANELİNDE PLAN, TARİF VE DANIŞAN YÖNETİMİ",
    problem: "Diyetisyenlerin plan, tarif kuralı, danışan durumu ve iletişim süreçlerini farklı araçlarda yürütmesi veri kopukluğu ve operasyon yükü oluşturur.",
    question: "Tek web paneli diyetisyen operasyonunu danışan mobil akışıyla nasıl senkronize eder?",
    goals: ["Danışan ve plan yönetimini merkezileştirmek.", "Tariflerde zorunlu, opsiyonel, yasak ve alternatif rolleri tanımlamak.", "Access Key ve Care Hub süreçlerini yönetmek."],
    method: ["Danışan seçimi", "Plan oluşturma", "Tarif kural girişi", "Access Key", "İzleme ve iletişim"],
    integration: ["Next.js panel", "Diyetisyen API", "Tarif / plan tabloları", "Mobil senkronizasyon"],
    metrics: [["Ana modül", "6", 0.78], ["Guard", "100%", 1], ["Tenant", "100%", 1]],
    results: ["Dashboard, danışan, plan, tarif, erişim anahtarı ve iletişim modülleri geliştirildi.", "Tarif kuralları mobil öneri motoruyla aynı veri modelini kullanır.", "Klinik kapsamı veri izolasyonu testleriyle doğrulandı."],
    conclusion: ["Web paneli operasyonel kuralları doğrudan öneri motoruna bağlar.", "Aynı domain modeli veri tekrarını ve tutarsızlığı azaltır.", "Panel, danışan deneyimini yöneten denetlenebilir kontrol yüzeyidir."],
  },
  {
    slug: "09-performans-ve-gecikme",
    title: "DYTOPIA: KARAR DESTEK SERVİSLERİNDE PERFORMANS VE YANIT SÜRESİ ANALİZİ",
    problem: "Doğru öneri üreten bir sistem, mobil kullanımda gecikme yüksekse pratik değerini kaybeder. Özellikle çok aşamalı normalizasyon ve veri filtreleri ayrı ayrı ölçülmelidir.",
    question: "Dytopia servisleri kontrollü test ortamında etkileşimli kullanım için yeterli yanıt süresi sunuyor mu?",
    goals: ["Operasyon ve HTTP katmanı gecikmelerini ayrı ölçmek.", "Ortalama, medyan ve P95 değerlerini raporlamak.", "Hata sayısı ve darboğazları görünür kılmak."],
    method: ["100 işlem tekrarı", "30 HTTP isteği", "Ortalama / medyan", "P95 analizi", "Hata kontrolü"],
    integration: ["Benchmark controller", "Test server", "Servis politikaları", "Artifact raporları"],
    metrics: [["Tarif P95", "2,58 ms", 0.18], ["Öneri P95", "6,02 ms", 0.30], ["Norm. P95", "97,67 ms", 0.86]],
    results: ["HTTP tarif eşleştirme ortalaması 1,808 ms; P95 2,5794 ms.", "HTTP öneri ortalaması 3,6471 ms; P95 6,0163 ms.", "Normalizasyon HTTP P95 değeri 97,673 ms ve hata sayısı 0."],
    conclusion: ["Deterministik tarif ve öneri servisleri düşük gecikme göstermiştir.", "Normalizasyon daha maliyetli olsa da kontrollü testte 100 ms P95 altında kalmıştır.", "Dış ağ ve gerçek cihaz gecikmesi bu ölçümlere dahil değildir."],
  },
  {
    slug: "10-dogrulama-ve-sinirlar",
    title: "DYTOPIA: SENARYO TABANLI DOĞRULAMA, ABLATION VE GEÇERLİK SINIRLARI",
    problem: "Öneri sistemlerinde yalnızca çalışan demo sunmak doğruluk, güvenlik ve genellenebilirlik hakkında yeterli kanıt sağlamaz. Sonuçların hangi koşullarda üretildiği açık olmalıdır.",
    question: "Senaryo tabanlı benchmark ve ablation analizi sistemin teknik katkısını ve sınırlarını nasıl gösterir?",
    goals: ["Her ana bileşen için ölçülebilir test senaryosu tanımlamak.", "Katmanların katkısını ablation ile karşılaştırmak.", "Klinik etkinlik ile teknik doğrulamayı birbirinden ayırmak."],
    method: ["Veri seti tanımı", "Beklenen sonuç", "Otomatik test", "Artifact üretimi", "Sınır analizi"],
    integration: ["73 normalizasyon", "36 tarif kararı", "10 güvenlik", "210 API testi"],
    metrics: [["Norm. doğru", "72/73", 0.9863], ["Tarif doğru", "36/36", 1], ["API geçti", "203/210", 0.9667]],
    results: ["Canonical-only %49,32 iken alias + fuzzy ile doğruluk %98,63’e çıktı.", "Final API testinde 210 toplam testten 203’ü geçti, 7’si atlandı, başarısız test yoktu.", "OpenAI fallback anahtar yapılandırılmadığı için çalıştırılmadı ve açıkça raporlandı."],
    conclusion: ["Ablation, performans artışının hangi katmanlardan geldiğini gösterir.", "Atlanan veya çalıştırılmayan bileşenler başarı olarak sunulmamıştır.", "Sonuçlar yazılım prototipinin teknik uygulanabilirliğini destekler; klinik etkinlik iddiası taşımaz."],
  },
];

const box = (x, y, w, h, fill = PAPER, radius = "roundRect", line = NAVY, lw = 1.4) =>
  jsx("shape", { geometry: radius, position: { left: x, top: y, width: w, height: h }, fill, line: { fill: line, width: lw } });

const text = (value, x, y, w, h, size = 15, bold = false, align = "left", color = INK, extra = "") =>
  jsx("text", {
    position: { left: x, top: y, width: w, height: h },
    style: `font-family: Arial; font-size: ${size}px; color: ${color}; font-weight: ${bold ? "bold" : "normal"}; align: ${align}; anchor: top; wrap: square; autofit: shrink; inset: 0px; ${extra}`,
    children: value,
  });

const section = (title, x, y, w, h) => [box(x, y, w, h), text(title, x + 8, y + 7, w - 16, 25, 19, true, "center")];

function bulletLines(items) {
  return items.map((item) => `• ${item}`).join("\n");
}

function flowNodes(items, x, y, w, h, accent) {
  const gap = 12;
  const nodeW = (w - gap * (items.length - 1)) / items.length;
  const elements = [];
  items.forEach((item, i) => {
    const nx = x + i * (nodeW + gap);
    elements.push(box(nx, y, nodeW, h, i % 2 ? GREEN : SOFT, "roundRect", accent, 0.8));
    elements.push(text(item, nx + 5, y + 10, nodeW - 10, h - 20, 12, true, "center", i % 2 ? "#12633B" : INK, "anchor: middle;"));
    if (i < items.length - 1) elements.push(text("→", nx + nodeW, y + 13, gap, h - 16, 18, true, "center", MUTED));
  });
  return elements;
}

function architectureNodes(items, x, y, w, accent) {
  const elements = [];
  items.forEach((item, i) => {
    const yy = y + i * 54;
    elements.push(box(x + (i % 2) * 20, yy, w - 20, 38, i === 1 ? PURPLE : SOFT, "roundRect", accent, 0.8));
    elements.push(text(item, x + 8 + (i % 2) * 20, yy + 8, w - 36, 22, 12, true, "center", i === 1 ? "#3A2D83" : INK));
    if (i < items.length - 1) elements.push(text("↓", x + w / 2 - 10, yy + 37, 20, 18, 16, true, "center", MUTED));
  });
  return elements;
}

function metricChart(metrics, x, y, w, h, accent) {
  const elements = [];
  const gap = 24;
  const barW = (w - gap * 4) / 3;
  metrics.forEach((m, i) => {
    const bx = x + gap + i * (barW + gap);
    const bh = Math.max(8, (h - 55) * m[2]);
    elements.push(jsx("shape", { geometry: "rect", position: { left: bx, top: y + h - 34 - bh, width: barW, height: bh }, fill: i === 2 ? "#C43D34" : accent, line: { fill: i === 2 ? "#C43D34" : accent, width: 0 } }));
    elements.push(text(m[1], bx - 5, y + h - 58 - bh, barW + 10, 22, 12, true, "center", INK));
    elements.push(text(m[0], bx - 8, y + h - 28, barW + 16, 24, 10, true, "center", MUTED));
  });
  elements.push(jsx("shape", { geometry: "rect", position: { left: x + 12, top: y + h - 35, width: w - 24, height: 1 }, fill: MUTED, line: { fill: MUTED, width: 0 } }));
  return elements;
}

function makePoster(p, index) {
  const accent = index % 3 === 0 ? "#264E86" : index % 3 === 1 ? "#27745A" : "#5B4AA2";
  return jsxs("group", {
    position: { left: 0, top: 0, width: W, height: H },
    children: [
      jsx("shape", { geometry: "rect", position: { left: 0, top: 0, width: W, height: H }, fill: PAPER, line: { fill: PAPER, width: 0 } }),
      jsx("image", { path: LOGO, position: { left: 48, top: 26, width: 135, height: 105 }, fit: "contain", alt: "Dytopia logo" }),
      text(p.title, 245, 35, 820, 76, 27, true, "center", "#000000", "anchor: middle;"),
      text("Halil İbrahim YILDIRIM", 350, 113, 610, 23, 18, false, "center", "#000000"),
      text("Danışman: Dr. Öğr. Üyesi Volkan ATEŞ", 320, 139, 670, 23, 17, false, "center", "#000000"),
      text("Tarsus Üniversitesi, Mühendislik Fakültesi, Bilgisayar Mühendisliği Bölümü, 2026", 250, 166, 820, 22, 16, false, "center", "#000000"),
      text("DYTOPIA", 1135, 105, 125, 30, 21, true, "center", accent, "font-style: italic;"),

      ...section("GİRİŞ / PROBLEM", 48, 208, 275, 372),
      text(p.problem, 63, 247, 245, 180, 13, false, "left", INK, "leading: 108;"),
      text("Araştırma Sorusu:", 63, 444, 245, 20, 13, true),
      text(p.question, 63, 466, 245, 100, 13, false, "left", INK, "leading: 108;"),

      ...section("AMAÇ", 48, 592, 275, 258),
      text(bulletLines(p.goals), 65, 634, 240, 200, 13, false, "left", INK, "leading: 112;"),

      ...section("METODOLOJİ VE MODEL MİMARİSİ", 335, 208, 482, 394),
      ...flowNodes(p.method, 365, 252, 422, 58, accent),
      text("Katmanlar arası kontrollü karar akışı", 410, 326, 330, 20, 12, true, "center", MUTED),
      ...architectureNodes(p.integration, 405, 356, 342, accent),
      text("Deterministik kurallar önce çalışır; belirsizlik açık durum olarak korunur.", 375, 574, 402, 18, 10, false, "center", MUTED),

      ...section("BULGULAR", 335, 614, 482, 236),
      ...metricChart(p.metrics, 365, 657, 210, 125, accent),
      text(bulletLines(p.results), 590, 660, 205, 155, 12, false, "left", INK, "leading: 108;"),

      ...section("SİSTEM ENTEGRASYONU", 829, 208, 441, 536),
      ...flowNodes(p.integration, 858, 252, 382, 54, accent),
      box(882, 338, 335, 55, SOFT, "roundRect", accent, 0.9),
      text("Dytopia Backend API", 892, 348, 315, 20, 13, true, "center"),
      text("Kimlik doğrulama · iş kuralları · veri erişimi", 892, 370, 315, 16, 10, false, "center", MUTED),
      text("↑                         ↓                         ↑", 905, 397, 290, 22, 17, true, "center", MUTED),
      box(858, 432, 112, 60, ORANGE, "roundRect", "#C97A3D", 0.8),
      box(990, 432, 112, 60, PURPLE, "roundRect", "#6C5CB5", 0.8),
      box(1122, 432, 112, 60, GREEN, "roundRect", "#3E8C68", 0.8),
      text("İstemci\nEtkileşimi", 867, 446, 94, 34, 11, true, "center", "#8A431B"),
      text("Karar\nServisleri", 999, 446, 94, 34, 11, true, "center", "#40318A"),
      text("Veri\nKalıcılığı", 1131, 446, 94, 34, 11, true, "center", "#12633B"),
      text("Ortak domain modeli mobil danışan, diyetisyen paneli ve backend servislerinin aynı kuralları uygulamasını sağlar.", 870, 526, 355, 80, 13, false, "center", INK, "leading: 110;"),
      text("Ölçüm ve test artifact’leri karar katmanlarının davranışını izlenebilir hâle getirir.", 870, 628, 355, 60, 12, false, "center", MUTED),

      ...section("SONUÇ", 829, 756, 441, 150),
      text(bulletLines(p.conclusion), 846, 792, 408, 104, 12, false, "left", INK, "leading: 108;"),

      ...section("KAYNAKLAR", 48, 862, 769, 44),
      text(refs.map((r) => `• ${r}`).join("     "), 62, 889, 740, 14, 9, false, "center", INK),
    ],
  });
}

function iShape(slide, x, y, w, h, fill = PAPER, geometry = "roundRect", line = NAVY, lw = 1.4) {
  return slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: line, width: lw },
  });
}

function iText(slide, value, x, y, w, h, size = 15, bold = false, align = "left", color = INK, valign = "top") {
  const shape = slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill: "#00000000",
    line: { fill: "#00000000", width: 0 },
  });
  shape.text = value;
  shape.text.fontSize = size;
  shape.text.color = color;
  shape.text.bold = bold;
  shape.text.typeface = "Arial";
  shape.text.alignment = align;
  shape.text.verticalAlignment = valign;
  shape.text.insets = { left: 0, right: 0, top: 0, bottom: 0 };
  return shape;
}

function iSection(slide, title, x, y, w, h) {
  iShape(slide, x, y, w, h);
  iText(slide, title, x + 8, y + 6, w - 16, 24, 18, true, "center");
}

function iFlow(slide, items, x, y, w, h, accent) {
  const gap = 10;
  const nodeW = (w - gap * (items.length - 1)) / items.length;
  items.forEach((item, i) => {
    const nx = x + i * (nodeW + gap);
    iShape(slide, nx, y, nodeW, h, i % 2 ? GREEN : SOFT, "roundRect", accent, 0.8);
    iText(slide, item, nx + 4, y + 10, nodeW - 8, h - 18, 10, true, "center", i % 2 ? "#12633B" : INK, "middle");
    if (i < items.length - 1) iText(slide, "→", nx + nodeW, y + 18, gap, 18, 14, true, "center", MUTED);
  });
}

function iArchitecture(slide, items, x, y, w, accent) {
  items.forEach((item, i) => {
    const yy = y + i * 51;
    iShape(slide, x + (i % 2) * 18, yy, w - 18, 35, i === 1 ? PURPLE : SOFT, "roundRect", accent, 0.8);
    iText(slide, item, x + 7 + (i % 2) * 18, yy + 8, w - 32, 18, 11, true, "center", i === 1 ? "#3A2D83" : INK);
    if (i < items.length - 1) iText(slide, "↓", x + w / 2 - 8, yy + 35, 16, 14, 13, true, "center", MUTED);
  });
}

function iChart(slide, metrics, x, y, w, h, accent) {
  const gap = 20;
  const barW = (w - gap * 4) / 3;
  iShape(slide, x + 10, y + h - 31, w - 20, 1, MUTED, "rect", MUTED, 0);
  metrics.forEach((m, i) => {
    const bx = x + gap + i * (barW + gap);
    const bh = Math.max(7, (h - 50) * m[2]);
    iShape(slide, bx, y + h - 30 - bh, barW, bh, i === 2 ? "#C43D34" : accent, "rect", i === 2 ? "#C43D34" : accent, 0);
    iText(slide, m[1], bx - 6, y + h - 50 - bh, barW + 12, 18, 10, true, "center");
    iText(slide, m[0], bx - 8, y + h - 26, barW + 16, 22, 8, true, "center", MUTED);
  });
}

function buildPoster(slide, p, index) {
  const accent = index % 3 === 0 ? "#264E86" : index % 3 === 1 ? "#27745A" : "#5B4AA2";
  slide.background.fill = PAPER;
  iText(slide, "TARSUS", 55, 55, 125, 34, 24, true, "center", NAVY);
  iText(slide, "ÜNİVERSİTESİ", 55, 88, 125, 20, 11, false, "center", NAVY);
  iText(slide, p.title, 235, 30, 845, 82, 25, true, "center", "#000000", "middle");
  iText(slide, "Halil İbrahim YILDIRIM", 350, 112, 610, 22, 17, false, "center", "#000000");
  iText(slide, "Danışman: Dr. Öğr. Üyesi Volkan ATEŞ", 320, 138, 670, 22, 16, false, "center", "#000000");
  iText(slide, "Tarsus Üniversitesi, Mühendislik Fakültesi, Bilgisayar Mühendisliği Bölümü, 2026", 250, 165, 820, 22, 15, false, "center", "#000000");
  iText(slide, "DYTOPIA", 1135, 105, 125, 28, 20, true, "center", accent);

  iSection(slide, "GİRİŞ / PROBLEM", 48, 208, 275, 372);
  iText(slide, p.problem, 63, 247, 245, 180, 12, false, "left", INK);
  iText(slide, "Araştırma Sorusu:", 63, 444, 245, 18, 12, true);
  iText(slide, p.question, 63, 466, 245, 100, 12, false, "left", INK);
  iSection(slide, "AMAÇ", 48, 592, 275, 258);
  iText(slide, bulletLines(p.goals), 65, 634, 240, 200, 12, false, "left", INK);

  iSection(slide, "METODOLOJİ VE MODEL MİMARİSİ", 335, 208, 482, 394);
  iFlow(slide, p.method, 365, 252, 422, 55, accent);
  iText(slide, "Katmanlar arası kontrollü karar akışı", 410, 322, 330, 18, 11, true, "center", MUTED);
  iArchitecture(slide, p.integration, 405, 350, 342, accent);
  iText(slide, "Deterministik kurallar önce çalışır; belirsizlik açık durum olarak korunur.", 375, 574, 402, 16, 9, false, "center", MUTED);

  iSection(slide, "BULGULAR", 335, 614, 482, 236);
  iChart(slide, p.metrics, 365, 657, 210, 125, accent);
  iText(slide, bulletLines(p.results), 590, 660, 205, 155, 11, false, "left", INK);

  iSection(slide, "SİSTEM ENTEGRASYONU", 829, 208, 441, 536);
  iFlow(slide, p.integration, 858, 252, 382, 52, accent);
  iShape(slide, 882, 338, 335, 55, SOFT, "roundRect", accent, 0.9);
  iText(slide, "Dytopia Backend API", 892, 348, 315, 18, 12, true, "center");
  iText(slide, "Kimlik doğrulama · iş kuralları · veri erişimi", 892, 370, 315, 14, 9, false, "center", MUTED);
  iText(slide, "↑                 ↓                 ↑", 905, 397, 290, 20, 15, true, "center", MUTED);
  iShape(slide, 858, 432, 112, 60, ORANGE, "roundRect", "#C97A3D", 0.8);
  iShape(slide, 990, 432, 112, 60, PURPLE, "roundRect", "#6C5CB5", 0.8);
  iShape(slide, 1122, 432, 112, 60, GREEN, "roundRect", "#3E8C68", 0.8);
  iText(slide, "İstemci\nEtkileşimi", 867, 446, 94, 34, 10, true, "center", "#8A431B");
  iText(slide, "Karar\nServisleri", 999, 446, 94, 34, 10, true, "center", "#40318A");
  iText(slide, "Veri\nKalıcılığı", 1131, 446, 94, 34, 10, true, "center", "#12633B");
  iText(slide, "Ortak domain modeli mobil danışan, diyetisyen paneli ve backend servislerinin aynı kuralları uygulamasını sağlar.", 870, 526, 355, 78, 12, false, "center", INK);
  iText(slide, "Ölçüm ve test artifact’leri karar katmanlarının davranışını izlenebilir hâle getirir.", 870, 628, 355, 55, 11, false, "center", MUTED);

  iSection(slide, "SONUÇ", 829, 756, 441, 150);
  iText(slide, bulletLines(p.conclusion), 846, 792, 408, 104, 11, false, "left", INK);
  iSection(slide, "KAYNAKLAR", 48, 862, 769, 44);
  iText(slide, refs.map((r) => `• ${r}`).join("     "), 62, 888, 740, 14, 8, false, "center", INK);
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(PREVIEW, { recursive: true });

for (let i = 0; i < posters.length; i += 1) {
  const p = posters[i];
  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  const slide = presentation.slides.add();
  buildPoster(slide, p, i);
  const png = await presentation.export({ slide, format: "png", scale: 1.5 });
  await fs.writeFile(path.join(PREVIEW, `${p.slug}.png`), Buffer.from(await png.arrayBuffer()));
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(path.join(OUT, `${p.slug}.pptx`));
}

console.log(`Generated ${posters.length} posters in ${OUT}`);
