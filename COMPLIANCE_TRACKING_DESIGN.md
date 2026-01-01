# Compliance Tracking System - Design Document

## 📋 Overview

Bu doküman, **diyetisyen-danışan gerçek zamanlı takip sistemi** için domain model, database şeması, uyum skoru algoritması ve API tasarımını içerir.

---

## 1️⃣ Domain Model & Entity Relationships

### Mevcut Entities
- `Dietitian` - Diyetisyen
- `Client` - Danışan
- `Recipe` - Tarif (template)
- `Ingredient` - Malzeme
- `AccessKey` - Erişim anahtarı

### Yeni Entities (Eklenecek)

```
Dietitian
 └── Clients
      └── DietPlans (NEW)
           └── DietDays (NEW)
                └── Meals (NEW)
                     └── MealItems (NEW)
                          └── MealItemCompliance (NEW) ⭐ CORE
```

### Entity Definitions

#### 1. DietPlan
**Amaç:** Bir danışan için oluşturulan diyet planı (ör: "3 Aylık Premium Program")

```csharp
public class DietPlan
{
    public Guid Id { get; private set; }
    public Guid DietitianId { get; private set; }
    public Guid ClientId { get; private set; }
    public string Name { get; private set; } // "3 Aylık Premium Program"
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public bool IsActive { get; private set; }
    public IReadOnlyCollection<DietDay> Days => _days.AsReadOnly();
    
    private readonly List<DietDay> _days = new();
}
```

#### 2. DietDay
**Amaç:** Belirli bir günün diyet planı (tarih bazlı)

```csharp
public class DietDay
{
    public Guid Id { get; private set; }
    public Guid DietPlanId { get; private set; }
    public DateOnly Date { get; private set; } // 2024-01-15
    public IReadOnlyCollection<Meal> Meals => _meals.AsReadOnly();
    
    private readonly List<Meal> _meals = new();
}
```

#### 3. Meal
**Amaç:** Öğün (Kahvaltı, Öğle, Akşam, Ara öğün)

```csharp
public enum MealType
{
    Breakfast = 1,
    Lunch = 2,
    Dinner = 3,
    Snack = 4
}

public class Meal
{
    public Guid Id { get; private set; }
    public Guid DietDayId { get; private set; }
    public MealType Type { get; private set; }
    public Guid? RecipeId { get; private set; } // Optional: Hangi tarif kullanıldı
    public string? CustomName { get; private set; } // Recipe yoksa custom isim
    public IReadOnlyCollection<MealItem> Items => _items.AsReadOnly();
    
    private readonly List<MealItem> _items = new();
}
```

#### 4. MealItem
**Amaç:** Öğündeki spesifik bir besin/malzeme

```csharp
public class MealItem
{
    public Guid Id { get; private set; }
    public Guid MealId { get; private set; }
    public Guid IngredientId { get; private set; } // Referans: Ingredient entity
    public bool IsMandatory { get; private set; } // Zorunlu mu?
    public decimal? Amount { get; private set; } // Miktar (opsiyonel)
    public string? Unit { get; private set; } // Birim (g, ml, adet, vs.)
}
```

#### 5. MealItemCompliance ⭐ CORE
**Amaç:** Danışanın gerçek uyum logları (sistemin bel kemiği)

```csharp
public enum ComplianceStatus
{
    Done = 1,           // ✅ Yapıldı
    Skipped = 2,        // ❌ Atlanıldı
    Alternative = 3     // ⚠️ Alternatif kullanıldı
}

public class MealItemCompliance
{
    public Guid Id { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid DietPlanId { get; private set; }
    public Guid DietDayId { get; private set; }
    public Guid MealId { get; private set; }
    public Guid MealItemId { get; private set; }
    public Guid IngredientId { get; private set; }
    public ComplianceStatus Status { get; private set; }
    public Guid? AlternativeIngredientId { get; private set; } // Alternatif kullanıldıysa
    public DateTime MarkedAt { get; private set; } // Ne zaman işaretlendi
    
    // Index için kritik alanlar:
    // - ClientId + Date (günlük sorgu)
    // - ClientId + DietPlanId (plan bazlı)
}
```

---

## 2️⃣ Database Schema (PostgreSQL)

### Tablolar ve İlişkiler

```sql
-- 1. DietPlans
CREATE TABLE "DietPlans" (
    "Id" UUID PRIMARY KEY,
    "DietitianId" UUID NOT NULL,
    "ClientId" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "StartDate" DATE NOT NULL,
    "EndDate" DATE NOT NULL,
    "IsActive" BOOLEAN NOT NULL,
    FOREIGN KEY ("DietitianId") REFERENCES "Dietitians"("Id"),
    FOREIGN KEY ("ClientId") REFERENCES "Clients"("Id")
);

CREATE INDEX "IX_DietPlans_DietitianId" ON "DietPlans"("DietitianId");
CREATE INDEX "IX_DietPlans_ClientId" ON "DietPlans"("ClientId");

-- 2. DietDays
CREATE TABLE "DietDays" (
    "Id" UUID PRIMARY KEY,
    "DietPlanId" UUID NOT NULL,
    "Date" DATE NOT NULL,
    FOREIGN KEY ("DietPlanId") REFERENCES "DietPlans"("Id")
);

CREATE INDEX "IX_DietDays_DietPlanId" ON "DietDays"("DietPlanId");
CREATE UNIQUE INDEX "IX_DietDays_DietPlanId_Date" ON "DietDays"("DietPlanId", "Date");

-- 3. Meals
CREATE TABLE "Meals" (
    "Id" UUID PRIMARY KEY,
    "DietDayId" UUID NOT NULL,
    "Type" INTEGER NOT NULL, -- MealType enum
    "RecipeId" UUID NULL,
    "CustomName" TEXT NULL,
    FOREIGN KEY ("DietDayId") REFERENCES "DietDays"("Id"),
    FOREIGN KEY ("RecipeId") REFERENCES "Recipes"("Id")
);

CREATE INDEX "IX_Meals_DietDayId" ON "Meals"("DietDayId");

-- 4. MealItems
CREATE TABLE "MealItems" (
    "Id" UUID PRIMARY KEY,
    "MealId" UUID NOT NULL,
    "IngredientId" UUID NOT NULL,
    "IsMandatory" BOOLEAN NOT NULL,
    "Amount" DECIMAL(10,2) NULL,
    "Unit" TEXT NULL,
    FOREIGN KEY ("MealId") REFERENCES "Meals"("Id"),
    FOREIGN KEY ("IngredientId") REFERENCES "Ingredients"("Id")
);

CREATE INDEX "IX_MealItems_MealId" ON "MealItems"("MealId");

-- 5. MealItemCompliance ⭐ CORE TABLE
CREATE TABLE "MealItemCompliance" (
    "Id" UUID PRIMARY KEY,
    "ClientId" UUID NOT NULL,
    "DietPlanId" UUID NOT NULL,
    "DietDayId" UUID NOT NULL,
    "MealId" UUID NOT NULL,
    "MealItemId" UUID NOT NULL,
    "IngredientId" UUID NOT NULL,
    "Status" INTEGER NOT NULL, -- ComplianceStatus enum
    "AlternativeIngredientId" UUID NULL,
    "MarkedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("ClientId") REFERENCES "Clients"("Id"),
    FOREIGN KEY ("DietPlanId") REFERENCES "DietPlans"("Id"),
    FOREIGN KEY ("DietDayId") REFERENCES "DietDays"("Id"),
    FOREIGN KEY ("MealId") REFERENCES "Meals"("Id"),
    FOREIGN KEY ("MealItemId") REFERENCES "MealItems"("Id"),
    FOREIGN KEY ("IngredientId") REFERENCES "Ingredients"("Id")
);

-- Kritik Indexler (Performance için)
CREATE INDEX "IX_MealItemCompliance_ClientId_Date" 
    ON "MealItemCompliance"("ClientId", "MarkedAt" DATE);
CREATE INDEX "IX_MealItemCompliance_ClientId_DietPlanId" 
    ON "MealItemCompliance"("ClientId", "DietPlanId");
CREATE INDEX "IX_MealItemCompliance_MarkedAt" 
    ON "MealItemCompliance"("MarkedAt");
```

---

## 3️⃣ Compliance Score Algorithm (Uyum Skoru)

### Senaryo Örneği
**Mert'in Akşam Yemeği:**
- ✅ Yumurta (Zorunlu) → Done
- ❌ Yoğurt (Zorunlu) → Alternative (Kefir)
- ✅ Salatalık (Opsiyonel) → Done

### Hesaplama Formülü

```
Daily Compliance % = (Score / Max Score) * 100

Score Calculation:
- Mandatory Done: +10 points
- Mandatory Alternative: +7 points (kısmi puan)
- Mandatory Skipped: +0 points
- Optional Done: +3 points (bonus)
- Optional Skipped: +0 points (ceza yok)

Max Score = (Mandatory Items * 10) + (Optional Items * 3)
```

### Örnek Hesaplama

```
Akşam Yemeği:
- Yumurta (Zorunlu, Done) → +10
- Yoğurt (Zorunlu, Alternative) → +7
- Salatalık (Opsiyonel, Done) → +3
─────────────────────────────
Score: 20
Max Score: (2 * 10) + (1 * 3) = 23
Compliance: (20 / 23) * 100 = 86.96% ≈ 87%
```

### Günlük Compliance

```
Günlük Compliance = Tüm öğünlerin ortalaması

Örnek:
- Kahvaltı: 90%
- Öğle: 85%
- Akşam: 87%
─────────────────
Günlük: (90 + 85 + 87) / 3 = 87.3%
```

### Haftalık Compliance

```
Haftalık Compliance = Haftanın tüm günlerinin ortalaması
```

---

## 4️⃣ API Design

### 4.1 Mark Compliance (Mobile App → Backend)

```http
POST /api/compliance/mark
Authorization: Bearer {client_token}

Body:
{
  "mealItemId": "guid",
  "status": "Done" | "Skipped" | "Alternative",
  "alternativeIngredientId": "guid?" // Optional, sadece Alternative ise
}
```

**Response:**
```json
{
  "success": true,
  "complianceId": "guid",
  "dailyCompliance": 87.3
}
```

### 4.2 Get Daily Compliance

```http
GET /api/compliance/daily?clientId={guid}&date=2024-01-15
Authorization: Bearer {dietitian_token}
```

**Response:**
```json
{
  "clientId": "guid",
  "date": "2024-01-15",
  "compliancePercentage": 87.3,
  "meals": [
    {
      "mealId": "guid",
      "mealType": "Breakfast",
      "compliancePercentage": 90.0,
      "items": [
        {
          "mealItemId": "guid",
          "ingredientName": "Yumurta",
          "isMandatory": true,
          "status": "Done",
          "markedAt": "2024-01-15T08:30:00Z"
        }
      ]
    }
  ]
}
```

### 4.3 Get Compliance Summary

```http
GET /api/compliance/summary?clientId={guid}&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {dietitian_token}
```

**Response:**
```json
{
  "clientId": "guid",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "averageCompliance": 85.5,
  "dailyCompliance": [
    { "date": "2024-01-01", "percentage": 90.0 },
    { "date": "2024-01-02", "percentage": 85.0 }
  ],
  "weeklyTrend": [
    { "week": "2024-W01", "average": 87.5 },
    { "week": "2024-W02", "average": 83.5 }
  ]
}
```

### 4.4 Get Live Clients (Real-time Dashboard)

```http
GET /api/dietitian/live-clients
Authorization: Bearer {dietitian_token}
```

**Response:**
```json
{
  "activeClients": [
    {
      "clientId": "guid",
      "clientName": "Mert",
      "lastActivity": "2024-01-15T19:30:00Z",
      "todayCompliance": 87.3,
      "currentMeal": "Dinner",
      "lastMealItem": "Ton Balıklı Yoğurtlu Salata"
    }
  ]
}
```

---

## 5️⃣ Real-time Strategy

### Phase 1: Polling (İlk Aşama)
- Web panel 30 saniyede bir `GET /api/dietitian/live-clients` çağırır
- Basit, hızlı implementasyon
- Yeterli performans (küçük-orta ölçekli)

### Phase 2: SignalR (Gelecek)
- Backend → Frontend push notifications
- Anlık güncellemeler
- Daha kompleks, daha performanslı

**Karar:** Phase 1 ile başla, Phase 2'yi sonra ekle.

---

## 6️⃣ Implementation Phases

### ✅ Phase 1: Domain & Database
- [ ] DietPlan, DietDay, Meal, MealItem, MealItemCompliance entity'leri
- [ ] EF Core migrations
- [ ] Repository interfaces

### ✅ Phase 2: Backend APIs
- [ ] POST /api/compliance/mark
- [ ] GET /api/compliance/daily
- [ ] GET /api/compliance/summary
- [ ] GET /api/dietitian/live-clients
- [ ] Authorization (dietitian sadece kendi client'larını görebilir)

### ✅ Phase 3: Web Panel
- [ ] Clients page (danışan listesi)
- [ ] Client Detail page (günlük timeline, öğün bazlı checklist)
- [ ] Live Compliance dashboard section
- [ ] Color-coded status (yeşil/sarı/kırmızı)

### ✅ Phase 4: UX & Metrics
- [ ] Daily compliance percentage
- [ ] Weekly trend charts
- [ ] Last activity timestamp
- [ ] Empty/loading states

---

## 7️⃣ Önemli Notlar

1. **Authorization:** Diyetisyen sadece kendi client'larını görebilir
2. **Performance:** MealItemCompliance tablosu için indexler kritik
3. **Data Integrity:** Client → DietPlan → DietDay → Meal → MealItem hiyerarşisi korunmalı
4. **Scalability:** Compliance logları çok büyüyebilir, partition/archive stratejisi düşünülebilir

---

## ✅ Onay Bekleniyor

Bu tasarım onaylandıktan sonra implementation'a geçilebilir.

**Önerilen Başlangıç:** Phase 1 (Domain & Database)

