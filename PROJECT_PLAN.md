# خطة مشروع "بيت الأسماك" — نظام إدارة مطعم سمك متكامل

> **المسار:** `d:\nabil\ai\elbharah\`
> **التاريخ:** يوليو 2026
> **الحالة:** جاهز للتنفيذ

---

## 1. نظرة عامة

نظام ويب متكامل لإدارة مطعم سمك (بيت الأسماك)، مبني على بيانات حقيقية من ميزانية شهر يونيو 2026. النظام يغطي: المبيعات اليومية، مشتريات السمك من الدلالين، حسابات الدلالين، تكلفة السمك، الموازنات (ماكينات الدفع)، الملخص الشهري مع جرد الأسماك، المصروفات، التقارير الشاملة، والإحصائيات.

### المبادئ
- كل صفحة تعرض بيانات حقيقية ودقيقة مبنية على منطق ملف الإكسل
- النظام responsive لكل الشاشات (موبايل، تابلت، ديسكتوب)
- UI/UX احترافي بأعلى مستوى
- كل البيانات في PostgreSQL قابلة للتصدير والتقرير
- النظام جاهز للرفع على سيرفر عبر Docker

---

## 2. Tech Stack

| الطبقة | التقنية | السبب |
|---|---|---|
| **Frontend** | Vue.js 3 + Vite + Tailwind CSS + Pinia | مطابق لمعمارية V3 |
| **UI Components** | Headless UI + Lucide Icons + Chart.js | مكونات احترافية + رسوم بيانية |
| **Backend** | Node.js + Express + Sequelize ORM | API قوي + ORM مرن |
| **Database** | PostgreSQL 16 | قاعدة بيانات علائقية قوية |
| **Auth** | JWT + bcrypt | مصادقة آمنة |
| **Deployment** | Docker Compose | رفع سهل على أي سيرفر |
| **Reports Export** | PDF (puppeteer) + Excel (exceljs) | تصدير احترافي |

---

## 3. هيكل المشروع

```
elbharah/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/           ← database, auth, cors
│   │   ├── middleware/       ← auth, role, error
│   │   ├── models/           ← 18 نموذج (مفصلة في القسم 4)
│   │   ├── routes/           ← 12 route group
│   │   ├── controllers/      ← مطابق لكل route
│   │   ├── services/         ← report, statistics, inventory
│   │   └── seeders/          ← بيانات أولية (دلالين، سمك، تصنيفات، ماكينات)
│   ├── migrations/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   ├── router/           ← مسارات محمية
│   │   ├── stores/           ← auth, dashboard, ui
│   │   ├── layouts/          ← AuthLayout, DashboardLayout
│   │   ├── components/       ← DataTable, DateRangePicker, StatCard, ChartCard, Modal, ExportButton...
│   │   ├── views/            ← 21+ صفحة (مفصلة في القسم 5)
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker/
│   ├── docker-compose.yml    ← PostgreSQL + Backend + Frontend + Nginx
│   ├── nginx/nginx.conf
│   └── .env.example
├── .gitignore
├── README.md
└── PROJECT_PLAN.md
```

---

## 4. قاعدة البيانات — التصميم الكامل

### 4.1 مخطط العلاقات (ERD)

```
Users ──< DailySales
Users ──< Purchases
Users ──< Expenses
Users ──< CancelledInvoices

Suppliers (الدلالين) ──< Purchases ──< PurchaseItems (الأقلام)
FishTypes (أنواع السمك) ──< PurchaseItems
FishTypes ──< FishInventory

DailySales ──< PosTransactions (ماكينات الدفع)
DailySales ──< DeliveryOrders (طلبات التوصيل)

PosMachines (الماكينات) ──< PosTransactions
DeliveryPlatforms (تطبيقات التوصيل) ──< DeliveryOrders
SaleChannels (قنوات البيع) ──< DailySaleChannels

ExpenseCategories ──< Expenses

CreditAccounts (حسابات الآجل) ──< CreditSales (مبيعات آجل)

Settings (إعدادات)
```

### 4.2 الجداول بالتفصيل

#### `users` — المستخدمين
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| username | VARCHAR(50) UNIQUE | اسم المستخدم |
| password_hash | VARCHAR(255) | كلمة المرور (bcrypt) |
| full_name | VARCHAR(100) | الاسم الكامل |
| role | ENUM('admin','manager','cashier','accountant') | الصلاحية |
| is_active | BOOLEAN | نشط/موقوف |
| last_login | TIMESTAMP | آخر دخول |
| created_at / updated_at | TIMESTAMP | |

#### `suppliers` — الدلالين
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| code | VARCHAR(20) UNIQUE | رمز الدلال |
| name | VARCHAR(100) | اسم الدلال |
| phone | VARCHAR(20) | الهاتف |
| balance | DECIMAL(12,2) DEFAULT 0 | الرصيد المستحق |
| is_active | BOOLEAN | نشط/لا |
| notes | TEXT | ملاحظات |

**Seed Data (16 دلال):** بن وازن، عاشور، جازان، طلال، عبدالله ثويمر، جدة، عبدالمنعم، حمدان، عميد البحارة، عطيوي الرفاعي، مستورة، البنقلة، الشريف، البرك، رامي - مستورة، معاذ الجباري

#### `fish_types` — أنواع السمك
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(50) UNIQUE | نوع السمك |
| name_en | VARCHAR(50) | الاسم الإنجليزي |
| is_active | BOOLEAN | |

**Seed Data:** شعور، شريفي، وريق، قمر، هامور، ناجل، ترباني، فرهودي، خضاري، صيادية فارس، سيجان، خرمي، أبو عين، نجار، بغاة، كنعد، عمار، صقور، زبيدي

#### `purchases` — فواتير شراء السمك
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| invoice_number | VARCHAR(50) UNIQUE | رقم الفاتورة |
| supplier_id | INT FK → suppliers | الدلال |
| purchase_date | DATE | تاريخ الشراء |
| total_weight | DECIMAL(10,3) | إجمالي الوزن (كجم) |
| total_amount | DECIMAL(12,2) | إجمالي القيمة (ريال) |
| payment_method | ENUM('cash','credit','transfer') | طريقة الدفع |
| notes | TEXT | ملاحظات |
| created_by | INT FK → users | |

#### `purchase_items` — أصناف فاتورة الشراء (الأقلام)
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| purchase_id | INT FK → purchases | الفاتورة |
| fish_type_id | INT FK → fish_types | نوع السمك |
| weight | DECIMAL(10,3) | الوزن (كجم) |
| price_per_kilo | DECIMAL(10,2) | سعر الكيلو |
| total_price | DECIMAL(12,2) | الإجمالي (وزن × سعر) |
| is_damaged | BOOLEAN | تالف/بدال تالف |
| damaged_weight | DECIMAL(10,3) | وزن التالف |
| notes | TEXT | |

> **مهم:** كل "قلم" يدخل بشكل مستقل. مثلاً: يوم 4 من عطيوي — 3 قلم شعور، 2 قلم حريد، 5 قلم ناجل، 4 قلم هامور = 14 قلم (14 صف في purchase_items) تتبع نفس الفاتورة.

#### `daily_sales` — الحركة المالية اليومية
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| sale_date | DATE UNIQUE | التاريخ |
| day_name | VARCHAR(10) | اسم اليوم (الجمعة...) |
| total_sales | DECIMAL(12,2) | إجمالي المبيعات |
| other_sales | DECIMAL(12,2) DEFAULT 0 | مبيعات أخرى |
| credit_sales | DECIMAL(12,2) DEFAULT 0 | مبيعات آجل |
| cash_box | DECIMAL(12,2) DEFAULT 0 | الصندوق (نقدي) |
| app_elbharah | DECIMAL(12,2) DEFAULT 0 | تطبيق البحارة |
| hunger_station | DECIMAL(12,2) DEFAULT 0 | هنقر ستيشن |
| keta | DECIMAL(12,2) DEFAULT 0 | كيتا |
| toyo | DECIMAL(12,2) DEFAULT 0 | تويو |
| mada | DECIMAL(12,2) DEFAULT 0 | مدى |
| visa | DECIMAL(12,2) DEFAULT 0 | فيزا |
| mastercard | DECIMAL(12,2) DEFAULT 0 | ماستر كارد |
| net_sales | DECIMAL(12,2) | صافي المبيعات (محسوب) |
| recorded_sales | DECIMAL(12,2) | المبيعات المقيدة |
| surplus_deficit | DECIMAL(12,2) | الفائض/العجز (محسوب) |
| network_sales | DECIMAL(12,2) | مبيعات الشبكة (محسوب) |
| delivery_sales | DECIMAL(12,2) DEFAULT 0 | مبيعات التوصيل |
| delivery_orders_count | INT DEFAULT 0 | عدد طلبات التوصيل |
| notes | TEXT | |
| created_by | INT FK → users | |

**الحقول المحسوبة تلقائياً:**
- `net_sales` = cash_box + app_elbharah + hunger_station + keta + toyo + mada + visa + mastercard
- `surplus_deficit` = net_sales - total_sales
- `network_sales` = mada + visa + mastercard

#### `pos_machines` — ماكينات الدفع (الموازنات)
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| machine_number | INT | رقم الماكينة (1, 2, 3...) |
| terminal_id | VARCHAR(50) | رقم التيرمينال |
| bank | VARCHAR(50) | البنك |
| is_active | BOOLEAN | |

#### `pos_transactions` — حركات ماكينات الدفع
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| pos_machine_id | INT FK → pos_machines | الماكينة |
| daily_sale_id | INT FK → daily_sales | الحركة المالية |
| transaction_date | DATE | التاريخ |
| card_type | ENUM('mada','visa','visa_plus','mastercard','mastercard_plus') | نوع البطاقة |
| amount | DECIMAL(12,2) | المبلغ الأصلي |
| fee_percentage | DECIMAL(5,4) | نسبة الرسوم |
| amount_after_fee | DECIMAL(12,2) | المبلغ بعد الرسوم (محسوب) |

> **منطق الموازنات:** كل ماكينة تسجل يومياً: مدى، فيزا، فيزا+، ماستر كارد، ماستر كارد+. المبلغ بعد الرسوم يُحسب تلقائياً (فيزا = المبلغ × 0.975 = بعد خصم 2.5%).

#### `fish_inventory` — جرد الأسماك الشهري
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| fish_type_id | INT FK → fish_types | نوع السمك |
| month_year | DATE | الشهر (أول الشهر) |
| avg_price_per_kilo | DECIMAL(10,2) | متوسط سعر الكيلو |
| price_per_kilo | DECIMAL(10,2) | سعر الكيلو |
| opening_balance_kg | DECIMAL(10,3) | رصيد أول الشهر (كجم) |
| opening_balance_cost | DECIMAL(12,2) | تكلفة رصيد أول المدة |
| opening_balance_value | DECIMAL(12,2) | قيمة رصيد أول المدة |
| incoming_fish_value | DECIMAL(12,2) | قيمة السمك الوارد |
| total_month_cost | DECIMAL(12,2) | إجمالي تكلفة الشهر |
| total_incoming_kg | DECIMAL(10,3) | إجمالي السمك الوارد (كجم) |
| incoming_fish_kg | DECIMAL(10,3) | السمك الوارد |
| waste_kg | DECIMAL(10,3) | الهدر |
| waste_cost | DECIMAL(12,2) | تكلفة الهدر |
| closing_balance_kg | DECIMAL(10,3) | رصيد آخر الشهر (كجم) |
| closing_balance_cost | DECIMAL(12,2) | تكلفة رصيد نهاية الشهر |
| cogs | DECIMAL(12,2) | تكلفة تشغيل البضاعة المباعة |
| incoming_quantity | DECIMAL(10,3) | كمية الأسماك الداخلة |
| purchase_price | DECIMAL(10,2) | سعر الشراء |
| balance_match | BOOLEAN | مطابقة الرصيد |

#### `expense_categories` — تصنيفات المصروفات
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| code | INT UNIQUE | الرمز (1-50) |
| name | VARCHAR(100) | اسم التصنيف |
| is_active | BOOLEAN | |

> **مصدر التصنيفات:** الـ 50 تصنيف مستخرجة من ورقة "الملخص الشهري" في ملف الإكسل (ميزانية شهر 06 - 2026). هي قائمة بيان نفقات المطعم الرسمية المستخدمة فعلياً في المحاسبة الشهرية. يمكن إضافة أو تعديل أو حذف أي تصنيف من صفحة الإعدادات.

**Seed Data (50 تصنيف من ملف الإكسل):**
1. الأسماك، 2. الخضار والفواكه، 3. الزيت، 4. مواد الطبخ، 5. الأرز، 6. البهارات، 7. البطاطس، 8. المقبلات، 9. المجمدات، 10. المشروبات، 11. الخبز، 12. إعاشة عمال، 13. الثلج، 14. الغاز، 15. الفحم، 16. الوقود، 17. الصيانة العامة، 18. السيارات، 19. الصرف الصحي، 20. النثريات، 21. الرسوم الحكومية، 22. الرسوم البلدية، 23. رسوم الأقامات، 24. المخالفات الحكومية، 25. المخالفات المرورية، 26. التأمينات الاجتماعية، 27. الزكاة والدخل، 28. ضريبة القيمة المضافة، 29. الاستثمارات العامة، 30. صدقات لوجه الله، 31. أصول المطعم، 32. أدوات مكتبية، 33. أدوات مطبخ، 34. الأثاث، 35. الإنشاءات والتجديدات، 36. مصروفات المستودع، 37. فواتير الكهرباء، 38. فواتير المياه، 39. فواتير الاتصالات، 40. الإيجارات، 41. أجور النقل والمواصلات، 42. الدعاية والإعلان، 43. الرواتب، 44. الرعاية الصحية، 45. المنظفات، 46. الضيافة، 47. مواد التغليف، 48. تذاكر السفر، 49. عمولات شراء الأسماك، 50. المستهلكات

#### `expenses` — المصروفات
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| category_id | INT FK → expense_categories | التصنيف |
| expense_date | DATE | التاريخ |
| amount | DECIMAL(12,2) | المبلغ |
| description | TEXT | الوصف |
| payment_method | ENUM('cash','credit','transfer') | طريقة الدفع |
| created_by | INT FK → users | |

#### `other_sales` — مبيعات أخرى
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| sale_date | DATE | التاريخ |
| item_name | VARCHAR(100) | الصنف (مثل: زيت مستخدم) |
| unit_price | DECIMAL(10,2) | سعر الوحدة |
| quantity | DECIMAL(10,2) | الكمية المباعة |
| total | DECIMAL(12,2) | الإجمالي (محسوب) |

#### `credit_accounts` — حسابات الآجل
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| company_name | VARCHAR(100) | الشركة |
| phone | VARCHAR(20) | الهاتف |
| total_balance | DECIMAL(12,2) | إجمالي الرصيد |

#### `credit_sales` — مبيعات آجل
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| credit_account_id | INT FK → credit_accounts | الحساب |
| sale_date | DATE | تاريخ البيع |
| due_date | DATE | تاريخ السداد |
| amount | DECIMAL(12,2) | المبلغ |
| is_paid | BOOLEAN | مسدد/لا |
| paid_date | DATE | تاريخ السداد الفعلي |

#### `delivery_platforms` — تطبيقات التوصيل (CRUD)
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(50) | اسم التطبيق |
| key | VARCHAR(30) UNIQUE | المفتاح |
| icon | VARCHAR(50) | أيقونة |
| is_active | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Seed Data:** تطبيق البحارة، هنقر ستيشن، كيتا، تويو

#### `sale_channels` — قنوات البيع (CRUD)
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| key | VARCHAR(30) UNIQUE | المفتاح |
| name | VARCHAR(50) | الاسم |
| type | ENUM('cash','app','pos','delivery') | النوع |
| is_active | BOOLEAN | |
| icon | VARCHAR(50) | أيقونة |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Seed Data:** الصندوق (cash)، تطبيق البحارة (app)، هنقر ستيشن (app)، كيتا (app)، تويو (app)، مدى (pos)، فيزا (pos)، ماستر كارد (pos)

#### `daily_sale_channels` — قنوات البيع اليومية (ربط dynamic)
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| daily_sale_id | INT FK → daily_sales | الحركة المالية |
| sale_channel_id | INT FK → sale_channels | القناة |
| amount | DECIMAL(12,2) | المبلغ |
| created_at | TIMESTAMP | |

> **ملاحظة تصميمية:** الجدولين `sale_channels` و `daily_sale_channels` يدعمان إضافة قنوات بيع جديدة dynamically. الأعمدة الثابتة في `daily_sales` (cash_box, mada, visa, mastercard) تبقى للقنوات الأساسية الثابتة. أي قناة جديدة تُضاف عبر `sale_channels` وتُسجل في `daily_sale_channels`.

#### `delivery_orders` — طلبات التوصيل
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| daily_sale_id | INT FK → daily_sales | الحركة المالية |
| delivery_platform_id | INT FK → delivery_platforms | المنصة |
| order_number | VARCHAR(50) | رقم الطلب |
| amount | DECIMAL(10,2) | المبلغ |
| order_date | DATE | التاريخ |

#### `cancelled_invoices` — الفواتير الملغية
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| invoice_date | DATE | التاريخ |
| invoice_number | VARCHAR(50) | رقم الفاتورة |
| invoice_amount | DECIMAL(12,2) | مبلغ الفاتورة |
| returned_amount | DECIMAL(12,2) | المبلغ المرتجع |
| responsible_person | VARCHAR(100) | المتسبب |
| reason | TEXT | شرح لسبب المشكلة |
| created_by | INT FK → users | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### `settings` — إعدادات النظام
| الحقل | النوع | الوصف |
|---|---|---|
| id | SERIAL PK | |
| restaurant_name | VARCHAR(100) | اسم المطعم |
| tax_rate | DECIMAL(5,2) DEFAULT 15.00 | نسبة الضريبة |
| currency | VARCHAR(10) DEFAULT 'SAR' | العملة |
| logo_url | VARCHAR(255) | الشعار |
| phone | VARCHAR(20) | الهاتف |
| address | TEXT | العنوان |

---

## 5. الصفحات (Frontend) — تفصيل كامل

### 5.1 تسجيل الدخول (`/login`)
- شاشة دخول احترافية بخلفية متدرجة + شعار المطعم
- حقل اسم المستخدم + كلمة المرور
- زر "تذكرني"
- رسائل خطأ واضحة
- بعد الدخول: توجيه للداشبورد

### 5.2 الداشبورد (`/dashboard`)
لوحة تحكم تعرض معلومات دقيقة في شكل بطاقات ورسوم بيانية:

**بطاقات إحصائية (StatCards):**
- مبيعات اليوم
- مشتريات اليوم (سمك)
- مصروفات اليوم
- صافي ربح اليوم
- عدد طلبات التوصيل
- إجمالي مبيعات الشهر
- إجمالي مشتريات الشهر
- الرصيد في الصندوق

**رسوم بيانية (ChartCards):**
- رسم خطي: المبيعات اليومية خلال الشهر
- رسم دائري: توزيع المبيعات حسب القناة (صندوق، تطبيق البحارة، هنقر، كيتا، تويو، مدى، فيزا، ماستر)
- رسم أعمدة: مشتريات السمك اليومية
- رسم أعمدة: أعلى 5 دلالين بالمشتريات الشهرية
- جدول: آخر 5 فواتير شراء
- جدول: آخر 5 حركات مالية

### 5.3 الحركة المالية (`/financial-movement`)
صفحة تسجيل وعرض المبيعات اليومية. جدول كامل بالأعمدة التالية:

| التاريخ | اجمالي المبيعات | مبيعات أخرى | مبيعات اجل | الصندوق | تطبيق البحارة | هنقر ستيشن | كيتا | تويو | مدى | فيزا | ماستر كارد | صافي المبيعات | الفائض/العجز | مبيعات شبكة | مبيعات التوصيل | عدد طلبات التوصيل |

**الميزات:**
- إضافة سجل يومي جديد (نموذج بكل الحقول)
- تعديل/حذف سجل
- البحث بالتاريخ
- تصدير Excel/PDF
- الحقول المحسوبة تُحسب تلقائياً (صافي، فائض/عجز، شبكة)
- فلترة بالمدة (يوم، أسبوع، شهر)
- زر "نسخ من يوم سابق" لتسهيل الإدخال

### 5.4 الموازنات (`/pos-machines`)
صفحة لكل ماكينة دفع (POS) تسجل حركتها اليومية:

**الماكينات:** جهاز رقم 1، جهاز رقم 2، جهاز رقم 3...

لكل ماكينة جدول يومي بالأعمدة:
| اليوم | التاريخ | مدى | فيزا | فيزا + | ماستر كارد | ماستر كارد + | الإجمالي |

**الميزات:**
- إضافة حركة ماكينة ليوم معين
- اختيار نوع البطاقة + المبلغ → حساب تلقائي للمبلغ بعد الرسوم
- جدول مقارنة بين الماكينات
- إجمالي شهري لكل ماكينة
- تصدير Excel/PDF
- فلترة بالمدة

### 5.5 الملخص الشهري (`/monthly-summary`)
صفحة شاملة تلخص الشهر كاملاً في قسمين:

**القسم الأول: جرد الأسماك**
جدول بكل أنواع السمك والأعمدة التالية:

| نوع الأسماك | متوسط سعر الكيلو | سعر الكيلو | رصيد أول الشهر | تكلفة رصيد أول المدة | قيمة رصيد أول المدة | قيمة السمك الوارد | إجمالي تكلفة الشهر | إجمالي السمك الوارد | السمك الوارد | الهدر | رصيد آخر الشهر | كمية الأسماك الداخلة | سعر الشراء | رصيد نهاية الشهر | التكلفة | مطابقة الرصيد | تكلفة تشغيل البضاعة المباعة |

**القسم الثاني: بيان نفقات المطعم**
| الرمز | البيان | المبلغ |
(50 تصنيف مصروفات + الإجمالي)

**الميزات:**
- اختيار الشهر من قائمة
- كل القيم تُحسب تلقائياً من المشتريات والمبيعات والمصروفات
- تصدير Excel/PDF بالشكل الاحترافي

### 5.6 تكلفة السمك (`/fish-cost`)
صفحة تتبع أسعار السمك بأنواعه من كل دلال:

**جدول رئيسي:** لكل نوع سمك، عرض:
- إجمالي الوزن من كل الدلالين
- إجمالي القيمة
- سعر الكيلو المتوسط

**جدول تفصيلي:** لكل نوع سمك، عرض مفصل لكل دلال:
| الدلال | الوزن | القيمة | سعر الكيلو |

**جدول زمني:** تتبع سعر السمك يومياً:
| التاريخ | نوع السمك | الدلال | الوزن | القيمة | سعر الكيلو |

**الميزات:**
- فلترة حسب نوع السمك
- فلترة حسب الدلال
- فلترة بالمدة
- رسم خطي: تغير سعر الكيلو لكل نوع سمك خلال الشهر
- تصدير Excel/PDF

### 5.7 الدلالين (`/suppliers`)
ثلاث صفحات فرعية:

#### 5.7.1 قائمة الدلالين (`/suppliers`)
- جدول بكل الدلالين: الاسم، الرمز، الهاتف، إجمالي المشتريات الشهرية، الرصيد المستحق، الحالة
- زر إضافة دلال جديد
- زر تعديل/حذف
- بحث بالاسم أو الرمز

#### 5.7.2 تفاصيل الدلال (`/suppliers/:id`)
- بطاقة معلومات الدلال
- جدول المشتريات اليومية: كل يوم كم اشترى (مثل ملف الإكسل)
| اليوم | 1 | 2 | 3 | 4 | 5 | ... | 31 | الإجمالي |
- جدول تفصيلي بكل فواتير الشراء من هذا الدلال
- رسم بياني: مشتريات هذا الدلال خلال الشهر

#### 5.7.3 تقرير الدلال (`/suppliers/:id/report`)
- اختيار مدة (يوم، أسبوع، شهر، ربع سنوي، نصف سنوي، سنوي)
- إجمالي المشتريات في المدة
- تفصيل بأنواع السمك
- عدد الفواتير
- متوسط الشراء اليومي
- تصدير PDF

### 5.8 مشتريات الأسماك (`/purchases`)
ثلاث صفحات فرعية:

#### 5.8.1 قائمة المشتريات (`/purchases`)
- جدول بكل الفواتير: رقم الفاتورة، التاريخ، الدلال، عدد الأقلام، إجمالي الوزن، إجمالي المبلغ
- فلترة بالتاريخ / بالدلال
- بحث برقم الفاتورة
- زر "فاتورة جديدة"

#### 5.8.2 نموذج فاتورة شراء (`/purchases/new`)
- اختيار الدلال (dropdown)
- اختيار التاريخ
- اختيار طريقة الدفع (نقدي/آجل/تحويل)
- جدول الأصناف (الأقلام):
  - كل صف: نوع السمك (dropdown) + الوزن + سعر الكيلو + الإجمالي (محسوب تلقائياً) + تالف؟ + وزن التالف
  - زر "إضافة قلم" لإضافة صف جديد
  - زر "حذف قلم"
- إجمالي الوزن والإجمالي يُحسب تلقائياً في الأسفل
- حقل ملاحظات
- زر "حفظ الفاتورة"

#### 5.8.3 تفاصيل فاتورة (`/purchases/:id`)
- عرض كل بيانات الفاتورة + جدول الأقلام
- زر تعديل / حذف
- زر تصدير PDF

### 5.9 الإحصائيات (`/statistics`)
صفحة إحصائيات مجمعة قابلة للفلترة:

**الفلاتر:**
- اختيار التاريخ (يوم محدد)
- اختيار الدلال
- اختيار نوع السمك

**الإحصائيات المعروضة:**
مثال: يوم 4، الدلال عطيوي — 4 أنواع سمك:
- 3 قلم شعور → إجمالي الوزن + إجمالي القيمة + متوسط سعر الكيلو + عدد الأقلام
- 2 قلم حريد → نفس التفصيل
- 5 قلم ناجل → نفس التفصيل
- 4 قلم هامور → نفس التفصيل

**جدول الإحصائية:**
| الدلال | التاريخ | نوع السمك | عدد الأقلام | إجمالي الوزن | إجمالي القيمة | متوسط سعر الكيلو | متوسط الوزن للقلم |

**رسوم بيانية:**
- رسم دائري: توزيع الأوزان حسب نوع السمك
- رسم أعمدة: عدد الأقلام لكل نوع
- رسم أعمدة: مقارنة الأسعار بين الدلالين لنفس نوع السمك

**الميزات:**
- فلترة بالمدة (يوم، أسبوع، شهر)
- تجميع حسب: الدلال / نوع السمك / التاريخ
- تصدير Excel/PDF

### 5.10 المصروفات (`/expenses`)
- جدول بكل المصروفات: التاريخ، التصنيف، المبلغ، الوصف، طريقة الدفع
- إضافة مصروف: اختيار التصنيف (50 تصنيف) + المبلغ + التاريخ + الوصف
- فلترة بالتصنيف / بالمدة
- إجمالي المصروفات في المدة المحددة
- رسم دائري: توزيع المصروفات حسب التصنيف
- تصدير Excel/PDF

### 5.11 مبيعات أخرى (`/other-sales`)
- جدول: التاريخ، الصنف، سعر الوحدة، الكمية، الإجمالي
- إضافة مبيعة أخرى (مثل: زيت مستخدم)
- الإجمالي يُحسب تلقائياً
- فلترة بالمدة

### 5.12 مبيعات آجل (`/credit-sales`)
- جدول بكل حسابات الآجل: الشركة، تاريخ البيع، تاريخ السداد، المبلغ، الحالة (مسدد/لا)
- إضافة مبيعة آجل جديدة
- تحديد كمسدد
- فلترة بالشركة / بالحالة / بالمدة
- إجمالي المستحقات
- تصدير PDF

### 5.13 مركز التقارير (`/reports`)
مركز شامل للتقارير مع فلترة بالمدة:

**أنواع التقارير:**

| التقرير | الوصف | الفلاتر |
|---|---|---|
| **تقرير المبيعات** | مبيعات يومية/شهرية بالتفصيل | مدة، قناة بيع |
| **تقرير الأسماك** | مشتريات الأسماك، الأسعار، الأوزان | مدة، نوع سمك، دلال |
| **تقرير تطبيقات التوصيل** | مبيعات كل تطبيق (بحرارة، هنقر، كيتا، تويو) | مدة، تطبيق |
| **تقرير الدلالين** | حساب كل دلال، مشتريات، مستحقات | مدة، دلال |
| **تقرير المصروفات** | مصروفات بالتصنيف | مدة، تصنيف |
| **تقرير الأرباح** | مبيعات - مشتريات - مصروفات = صافي الربح | مدة |
| **تقرير الموازنات** | حركة كل ماكينة دفع | مدة، ماكينة |
| **تقرير الآجل** | مستحقات، مسدد، متأخر | مدة، شركة |
| **تقرير الضريبة** | ضريبة القيمة المضافة | مدة |

**فلاتر المدة (لكل تقرير):**
- يومي (يوم محدد)
- أسبوعي
- شهري
- ربع سنوي
- نصف سنوي
- سنوي
- مدة مخصصة (from - to)

**خيارات التصدير:**
- PDF احترافي (بشعار المطعم + التاريخ + الجداول)
- Excel (بنفس تنسيق الجداول)
- طباعة مباشرة

### 5.14 الفواتير الملغية (`/cancelled-invoices`)
صفحة خاصة بعرض وإدارة الفواتير الملغية/المرتجعة:

| التاريخ | رقم الفاتورة | مبلغ الفاتورة | المبلغ المرتجع | المتسبب | شرح لسبب المشكلة |

**الميزات:**
- جدول بكل الفواتير الملغية
- إضافة فاتورة ملغية: التاريخ، رقم الفاتورة، المبلغ، المبلغ المرتجع، اسم المتسبب، شرح السبب
- تعديل/حذف سجل
- البحث برقم الفاتورة أو بالتاريخ
- فلترة بالمدة (يوم، أسبوع، شهر)
- فلترة بالمتسبب
- إجمالي المبالغ الملغية + إجمالي المرتجع في المدة المحددة
- تصدير Excel/PDF
- رسم بياني: الفواتير الملغية خلال الشهر

### 5.15 المستخدمين والإدارة (`/users`)
- جدول بكل المستخدمين: الاسم، اسم المستخدم، الصلاحية، الحالة، آخر دخول
- إضافة مستخدم: اسم، اسم مستخدم، كلمة مرور، صلاحية (admin/manager/cashier/accountant)
- تعديل/حذف/توقيف مستخدم
- تغيير كلمة المرور

### 5.16 الإعدادات (`/settings`)
- اسم المطعم
- نسبة الضريبة (افتراضي 15%)
- العملة (افتراضي SAR)
- شعار المطعم (رفع صورة)
- الهاتف والعنوان

#### إدارة أنواع السمك (CRUD كامل)
- إضافة نوع سمك جديد (اسم عربي + اسم إنجليزي)
- تعديل نوع سمك موجود
- حذف نوع سمك (مع تأكيد — لا يمكن الحذف إذا مرتبط بفواتير)
- تفعيل/تعطيل نوع سمك
- البحث بالاسم

#### إدارة الدلالين (CRUD كامل)
- إضافة دلال جديد (اسم، رمز، هاتف، ملاحظات)
- تعديل دلال موجود
- حذف دلال (مع تأكيد — لا يمكن الحذف إذا مرتبط بفواتير)
- تفعيل/تعطيل دلال
- البحث بالاسم أو الرمز

#### إدارة أجهزة الدفع / الموازنات (CRUD كامل)
- إضافة جهاز مدى جديد (رقم الجهاز، رقم التيرمينال، البنك)
- تعديل جهاز موجود
- حذف جهاز (مع تأكيد — لا يمكن الحذف إذا مرتبط بحركات)
- تفعيل/تعطيل جهاز

#### إدارة تطبيقات التوصيل (CRUD كامل)
- إضافة تطبيق توصيل جديد (اسم، نوع، أيقونة)
- تعديل تطبيق موجود
- حذف تطبيق (مع تأكيد — لا يمكن الحذف إذا مرتبط بطلبات)
- تفعيل/تعطيل تطبيق

#### إدارة تصنيفات المصروفات (CRUD كامل)
- إضافة تصنيف مصروفات جديد
- تعديل تصنيف موجود
- حذف تصنيف (مع تأكيد — لا يمكن الحذف إذا مرتبط بمصروفات)
- تفعيل/تعطيل تصنيف

> **ملاحظة:** كل القوائم اللي فوق (أنواع سمك، دلالين، أجهزة، تطبيقات، تصنيفات) يمكن إضافتها وتعديلها وحذفها من صفحة الإعدادات. الحذف محمي — لو العنصر مرتبط ببيانات موجودة (فواتير، حركات، مصروفات) النظام يمنع الحذف ويعرض رسالة واضحة.

---

## 6. تصميم UI/UX

### 6.1 الهوية البصرية
- **الشعار:** الشعار الرسمي للمطعم (موجود في `logo (1) (1).png`)
- **الألوان الرئيسية (مستخرجة من الشعار):**
  - أزرق بحري داكن: `#0D3B4F` (الخلفية الأساسية)
  - أزرق متوسط: `#1A5E7A` (التدرجات)
  - ذهبي/أصفر: `#D4A843` (التمييز والأيقونات)
  - أبيض: `#FFFFFF` (النصوص)
- **ألوان مساعدة:**
  - أخضر: `#16A34A` (للربح/الإيجابي)
  - أحمر: `#DC2626` (للخسارة/السلبي)
  - رمادي فاتح: `#F3F4F6` (خلفيات ثانوية)
  - رمادي متوسط: `#6B7280` (نصوص ثانوية)
- **الخط:** Cairo (عربي) + Inter (إنجليزي) — يدعم RTL
- **تطبيق الألوان:**
  - Sidebar: أزرق بحري داكن `#0D3B4F`
  - Navbar: أبيض مع ظل خفيف
  - أزرار رئيسية: ذهبي `#D4A843`
  - روابط نشطة: ذهبي `#D4A843`
  - بطاقات إحصائية: خلفية بيضاء مع border أزرق فاتح

### 6.2 التخطيط (Layout)
```
┌─────────────────────────────────────────────┐
│  Navbar (شعار + إشعارات + المستخدم)          │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  Sidebar │       محتوى الصفحة               │
│          │                                  │
│  - داشبورد│  (بطاقات + جداول + رسوم)         │
│  - مالية  │                                  │
│  - موازنات│                                  │
│  - ملخص   │                                  │
│  - سمك    │                                  │
│  - دلالين │                                  │
│  - مشتريات│                                  │
│  - إحصاء  │                                  │
│  - مصروفات│                                  │
│  - ملغية  │                                  │
│  - تقارير │                                  │
│  - مستخدمين│                                 │
│  - إعدادات│                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### 6.3 Responsive Design
- **ديسكتوب (>1024px):** sidebar ثابت + محتوى واسع
- **تابلت (768-1024px):** sidebar قابل للطي + محتوى متوسط
- **موبايل (<768px):** sidebar يتحول لـ drawer + الجداول تتحول لبطاقات + الرسوم تتكيف

### 6.4 مكونات UI المشتركة
- **DataTable:** جدول قابل للفرز، البحث، التصفيف، اختيار عدد الصفوف
- **StatCard:** بطاقة إحصائية بأيقونة + رقم + عنوان + نسبة تغيير
- **ChartCard:** بطاقة رسم بياني (خطي، دائري، أعمدة)
- **DateRangePicker:** اختيار مدة (يوم/أسبوع/شهر/ربع/سنة/مخصص)
- **ExportButton:** زر تصدير (PDF/Excel/طباعة)
- **Modal:** نافذة منبثقة للإضافة/التعديل
- **ConfirmDialog:** تأكيد الحذف
- **SearchBar:** شريط بحث فوري
- **LoadingSpinner:** مؤشر تحميل
- **EmptyState:** حالة فارغة برسم توضيحي

### 6.5 تجربة المستخدم (UX)
- انتقالات سلسة بين الصفحات
- إشعارات toast للعمليات (نجاح/خطأ)
- تحميل تدريجي للبيانات (skeleton loading)
- اختصارات لوحة المفاتيح
- بحث عام في كل الصفحات
- حفظ تلقائي للمسودات
- تأكيد قبل أي حذف
- رسائل خطأ واضحة ومفيدة

---

## 7. API Endpoints

### Auth
| Method | Path | الوصف |
|---|---|---|
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/logout` | تسجيل الخروج |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |
| PUT | `/api/auth/password` | تغيير كلمة المرور |

### Dashboard
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/dashboard/today` | إحصائيات اليوم |
| GET | `/api/dashboard/month` | إحصائيات الشهر |
| GET | `/api/dashboard/charts` | بيانات الرسوم البيانية |

### Financial Movement (الحركة المالية)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/sales` | قائمة المبيعات (مع فلترة) |
| GET | `/api/sales/:id` | تفاصيل سجل |
| POST | `/api/sales` | إضافة سجل |
| PUT | `/api/sales/:id` | تعديل |
| DELETE | `/api/sales/:id` | حذف |
| GET | `/api/sales/export` | تصدير Excel/PDF |

### POS Machines (الموازنات)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/pos/machines` | قائمة الماكينات |
| POST | `/api/pos/machines` | إضافة ماكينة |
| GET | `/api/pos/transactions` | حركات الماكينات |
| POST | `/api/pos/transactions` | إضافة حركة |
| GET | `/api/pos/report` | تقرير ماكينة |

### Suppliers (الدلالين)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/suppliers` | قائمة الدلالين |
| POST | `/api/suppliers` | إضافة دلال |
| PUT | `/api/suppliers/:id` | تعديل |
| DELETE | `/api/suppliers/:id` | حذف |
| GET | `/api/suppliers/:id` | تفاصيل + حساب |
| GET | `/api/suppliers/:id/daily` | مشتريات يومية |
| GET | `/api/suppliers/:id/report` | تقرير دلال |

### Purchases (مشتريات الأسماك)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/purchases` | قائمة الفواتير |
| GET | `/api/purchases/:id` | تفاصيل فاتورة |
| POST | `/api/purchases` | إضافة فاتورة |
| PUT | `/api/purchases/:id` | تعديل |
| DELETE | `/api/purchases/:id` | حذف |
| GET | `/api/purchases/export` | تصدير |

### Fish Cost (تكلفة السمك)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/fish-cost/summary` | ملخص تكلفة كل نوع |
| GET | `/api/fish-cost/detail/:fishTypeId` | تفصيل دلالين لنوع سمك |
| GET | `/api/fish-cost/timeline` | تتبع الأسعار يومياً |
| GET | `/api/fish-cost/export` | تصدير |

### Monthly Summary (الملخص الشهري)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/monthly-summary/:monthYear` | ملخص شهر كامل |
| GET | `/api/monthly-summary/inventory/:monthYear` | جرد الأسماك |
| GET | `/api/monthly-summary/expenses/:monthYear` | بيان المصروفات |
| GET | `/api/monthly-summary/export` | تصدير |

### Statistics (الإحصائيات)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/statistics/by-supplier` | إحصائية حسب الدلال |
| GET | `/api/statistics/by-fish` | إحصائية حسب نوع السمك |
| GET | `/api/statistics/by-date` | إحصائية حسب اليوم |
| GET | `/api/statistics/aggregate` | إحصائية مجمعة |

### Expenses (المصروفات)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/expenses` | قائمة المصروفات |
| POST | `/api/expenses` | إضافة |
| PUT | `/api/expenses/:id` | تعديل |
| DELETE | `/api/expenses/:id` | حذف |
| GET | `/api/expenses/categories` | التصنيفات |

### Other Sales (مبيعات أخرى)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/other-sales` | قائمة |
| POST | `/api/other-sales` | إضافة |
| PUT | `/api/other-sales/:id` | تعديل |
| DELETE | `/api/other-sales/:id` | حذف |

### Credit Sales (مبيعات آجل)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/credit/accounts` | حسابات الآجل |
| POST | `/api/credit/accounts` | إضافة حساب |
| GET | `/api/credit/sales` | مبيعات آجل |
| POST | `/api/credit/sales` | إضافة مبيعة |
| PUT | `/api/credit/sales/:id` | تعديل / تحديد كمسدد |

### Reports (التقارير)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/reports/sales` | تقرير المبيعات |
| GET | `/api/reports/fish` | تقرير الأسماك |
| GET | `/api/reports/delivery` | تقرير التوصيل |
| GET | `/api/reports/suppliers` | تقرير الدلالين |
| GET | `/api/reports/expenses` | تقرير المصروفات |
| GET | `/api/reports/profit` | تقرير الأرباح |
| GET | `/api/reports/pos` | تقرير الموازنات |
| GET | `/api/reports/credit` | تقرير الآجل |
| GET | `/api/reports/tax` | تقرير الضريبة |
| GET | `/api/reports/export` | تصدير أي تقرير |

### Users
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/users` | قائمة المستخدمين |
| POST | `/api/users` | إضافة |
| PUT | `/api/users/:id` | تعديل |
| DELETE | `/api/users/:id` | حذف |

### Cancelled Invoices (الفواتير الملغية)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/cancelled-invoices` | قائمة الفواتير الملغية |
| POST | `/api/cancelled-invoices` | إضافة |
| PUT | `/api/cancelled-invoices/:id` | تعديل |
| DELETE | `/api/cancelled-invoices/:id` | حذف |
| GET | `/api/cancelled-invoices/export` | تصدير |

### Settings (الإعدادات + CRUD فرعي)
| Method | Path | الوصف |
|---|---|---|
| GET | `/api/settings` | الإعدادات |
| PUT | `/api/settings` | تعديل الإعدادات |
| GET/POST/PUT/DELETE | `/api/settings/fish-types` | CRUD أنواع السمك |
| GET/POST/PUT/DELETE | `/api/settings/suppliers` | CRUD الدلالين |
| GET/POST/PUT/DELETE | `/api/settings/pos-machines` | CRUD أجهزة الدفع |
| GET/POST/PUT/DELETE | `/api/settings/delivery-platforms` | CRUD تطبيقات التوصيل |
| GET/POST/PUT/DELETE | `/api/settings/expense-categories` | CRUD تصنيفات المصروفات |
| GET/POST/PUT/DELETE | `/api/settings/sale-channels` | CRUD قنوات البيع |

---

## 8. الصلاحيات (RBAC)

| الصلاحية | الداشبورد | الحركة المالية | الموازنات | الملخص الشهري | تكلفة السمك | الدلالين | المشتريات | الإحصائيات | المصروفات | الفواتير الملغية | التقارير | المستخدمين | الإعدادات |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **cashier** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅(قراءة) | ❌ | ❌ |
| **accountant** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 9. Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: elbharah
      POSTGRES_USER: elbharah
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: elbharah
      DB_USER: elbharah
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres_data:
```

### الرفع على السيرفر
```bash
# 1. نسخ المشروع للسيرفر
scp -r elbharah/ user@server:/opt/elbharah

# 2. إعداد .env
cp .env.example .env
# تعديل DB_PASSWORD و JWT_SECRET

# 3. تشغيل
cd /opt/elbharah
docker compose up -d

# 4. تشغيل migrations و seeders
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all
```

---

## 10. خطة التنفيذ — مراحل

### المرحلة 1: البنية التحتية (Infrastructure)
- [ ] إعداد هيكل المشروع (backend + frontend + docker)
- [ ] إعداد Docker Compose + PostgreSQL
- [ ] إعداد Sequelize + migrations
- [ ] إنشاء كل الـ models (18 نموذج)
- [ ] إنشاء seeders (دلالين، أنواع سمك، تصنيفات، ماكينات، قنوات، admin)

### المرحلة 2: Backend API
- [ ] Auth (login + JWT + middleware)
- [ ] Dashboard API
- [ ] Suppliers API (CRUD + reports)
- [ ] Purchases API (CRUD + items)
- [ ] Daily Sales API (CRUD + calculated fields)
- [ ] POS Machines API (CRUD + transactions)
- [ ] Fish Cost API (summary + detail + timeline)
- [ ] Monthly Summary API (inventory + expenses)
- [ ] Statistics API (aggregate)
- [ ] Expenses API (CRUD)
- [ ] Other Sales API (CRUD)
- [ ] Credit Sales API (CRUD)
- [ ] Cancelled Invoices API (CRUD + export)
- [ ] Reports API (9 أنواع تقارير + تصدير)
- [ ] Users API (CRUD)
- [ ] Settings API (إعدادات + CRUD فرعي: أنواع سمك، دلالين، أجهزة، تطبيقات، تصنيفات، قنوات)

### المرحلة 3: Frontend — الأساس
- [ ] إعداد Vue 3 + Vite + Tailwind + Pinia + Router
- [ ] AuthLayout + LoginView
- [ ] DashboardLayout (Sidebar + Navbar)
- [ ] مكونات مشتركة (DataTable, StatCard, ChartCard, DateRangePicker, ExportButton, Modal, etc.)
- [ ] Auth store + route guards

### المرحلة 4: Frontend — الصفحات
- [ ] DashboardView
- [ ] FinancialMovementView
- [ ] PosMachinesView
- [ ] MonthlySummaryView
- [ ] FishCostView
- [ ] SuppliersListView + SupplierDetailView + SupplierReportView
- [ ] PurchasesListView + PurchaseFormView + PurchaseDetailView
- [ ] StatisticsView
- [ ] ExpensesView
- [ ] OtherSalesView
- [ ] CreditSalesView
- [ ] CancelledInvoicesView
- [ ] ReportsHubView + 7 صفحات تقارير
- [ ] UsersListView + UserFormView
- [ ] SettingsView (مع CRUD فرعي لكل القوائم)

### المرحلة 5: التقارير والتصدير
- [ ] خدمة تصدير PDF (puppeteer)
- [ ] خدمة تصدير Excel (exceljs)
- [ ] ربط التصدير بكل الصفحات
- [ ] تصميم قوالب PDF احترافية (شعار + تاريخ + جداول)

### المرحلة 6: الاختبار والنشر
- [ ] اختبار كل الصفحات والـ APIs
- [ ] اختبار Responsive (موبايل/تابلت/ديسكتوب)
- [ ] اختبار الصلاحيات
- [ ] اختبار التصدير
- [ ] Docker build + deploy
- [ ] README نهائي

---

## 11. ملاحظات تقنية

### الحقول المحسوبة تلقائياً
- **صافي المبيعات** = مجموع كل قنوات البيع
- **الفائض/العجز** = صافي المبيعات - إجمالي المبيعات
- **مبيعات الشبكة** = مدى + فيزا + ماستر كارد
- **إجمالي فاتورة الشراء** = مجموع (وزن × سعر الكيلو) لكل الأقلام
- **المبلغ بعد الرسوم** = المبلغ × (1 - نسبة الرسوم)
- **متوسط سعر الكيلو** = إجمالي القيمة ÷ إجمالي الوزن
- **تكلفة تشغيل البضاعة المباعة** = رصيد أول المدة + المشتريات - رصيد آخر المدة

### RTL Support
- الواجهة بالكامل RTL (من اليمين لليسار)
- الخط Cairo للعربية
- التواريخ بالتقويم الميلادي مع أسماء الأيام بالعربية (الجمعة، السبت...)

### الأمان
- كلمات المرور مشفرة (bcrypt)
- JWT مع انتهاء صلاحية
- حماية كل المسارات (except login)
- صلاحيات RBAC على كل endpoint
- CORS محدد
- SQL injection protection (Sequelize parameters)

---

## 12. الخلاصة

| البند | العدد |
|---|---|
| **جداول قاعدة البيانات** | 20 جدول |
| **نماذج Backend** | 18 نموذج |
| **API Endpoints** | 60+ endpoint |
| **صفحات Frontend** | 22+ صفحة |
| **مكونات مشتركة** | 10+ مكون |
| **أنواع التقارير** | 9 أنواع |
| **بيانات أولية (Seed)** | 16 دلال + 19 نوع سمك + 50 تصنيف + 3 ماكينات + 8 قنوات بيع |
| **مراحل التنفيذ** | 6 مراحل |

> **هذه الخطة شاملة ولم تترك أي تفصيل. كل ما ذكر في ملف الإكسل ومتطلبات المستخدم مغطى بالكامل.**
