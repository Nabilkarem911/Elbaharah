# 🐟 بيت الأسماك — نظام إدارة مطعم السمك

نظام إدارة متكامل واحترافي لمطعم أسماك، مبني بأحدث التقنيات. يشمل المبيعات، المشتريات، الدلالين، المصروفات، التقارير، والإحصائيات — كل ذلك بواجهة عربية RTL أنيقة وسريعة.

---

## ✨ المميزات

### الوحدات الرئيسية
- **داشبورد** — إحصائيات لحظية + رسوم بيانية تفاعلية + بطاقات إحصائية (أفضل يوم، أكثر نوع سمك، أكثر دلال)
- **مؤشر الأداء** — مقارنة المبيعات والمشتريات بالشهر السابق مع نسبة النمو/الانخفاض
- **إشعارات ذكية** — تنبيهات للديون المتأخرة، تجاوز حد الائتمان، نقص المخزون
- **الحركة المالية** — تسجيل المبيعات اليومية بكل قنوات البيع + عداد كاش لتقسيم الفئات
- **الموازنات** — حركة ماكينات الدفع (مدى، فيزا، ماستر) مع حساب الرسوم
- **الملخص الشهري** — جرد الأسماك وبيان النفقات
- **تكلفة السمك** — تتبع أسعار وأنواع الأسماك من كل دلال
- **الدلالين** — إدارة كاملة للموردين + كشف حساب لكل دلال
- **المشتريات** — فواتير شراء بالأقلام (نوع، وزن، سعر، تالف) + تعديل + طباعة PDF
- **الإحصائيات** — تجميع الأقلام والوزن والأسعار + فلترة بالتاريخ والدلال والنوع
- **المصروفات** — 50 تصنيف جاهز
- **مبيعات أخرى** — مبيعات خارج قائمة المطعم
- **مبيعات آجل** — حسابات الشركات والمستحقات + تنبيه الآجل المتأخر (لون أحمر)
- **تسوية آجل** — تسجيل دفعات العملاء وتقليل الأرصدة
- **الفواتير الملغية** — تسجيل وأسباب
- **مركز التقارير** — 9 أنواع تقارير شاملة (مبيعات، أسماك، توصيل، دلالين، مصروفات، أرباح، POS، آجل، ضريبة)
- **المستخدمين** — إدارة الحسابات والصلاحيات
- **الإعدادات** — أنواع سمك، أجهزة دفع، تطبيقات توصيل، تصنيفات، قنوات بيع

### المميزات الإضافية
- **تصدير Excel/PDF/طباعة** — متاح في الحركة المالية، المشتريات، المصروفات، الآجل
- **بحث سريع** — في كل الجداول
- **عداد الكاش** — تقسيم الفئات (500، 200، 100، 50، 20، 10، 5، 1) + فلوس فضية + بطاقات
- **فاتورة شراء PDF** — طباعة فاتورة منسقة بالشعار والتاريخ والأقلام

### التقنيات
| الطبقة | التقنية |
|---|---|
| Frontend | Vue.js 3 + Vite + Tailwind CSS + Pinia + Chart.js + XLSX |
| Backend | Node.js + Express + Sequelize ORM |
| Database | PostgreSQL 16 |
| Deployment | Docker + Docker Compose |

---

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 20+
- PostgreSQL 16+

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env   # عدّل بيانات القاعدة
npm run dev            # يعمل على http://localhost:3000
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev            # يعمل على http://localhost:5173
```

### 3) بيانات الدخول الافتراضية
| المستخدم | كلمة المرور | الدور |
|---|---|---|
| `admin` | `admin123` | مدير عام |
| `manager` | `manager123` | محاسب |

---

## 🐳 التشغيل بـ Docker (محلي)

```bash
docker compose up -d --build
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **PostgreSQL:** localhost:5432

---

## ☁️ النشر على VPS عبر Dokploy

### الخطوة 1: ارفع المشروع على GitHub
```bash
git init
git add .
git commit -m "Initial commit — Fish Market System"
git remote add origin https://github.com/USERNAME/elbharah.git
git push -u origin main
```

### الخطوة 2: أنشئ PostgreSQL Database على Dokploy
1. افتح لوحة Dokploy → **Databases** → **Create Database**
2. اختر **PostgreSQL**
3. اسم القاعدة: `elbharah`، المستخدم: `elbharah`، كلمة مرور قوية
4. احفظ البيانات (Host, Port, User, Password)

### الخطوة 3: ارفع المشروع كـ Compose Application
1. Dokploy → **Applications** → **Create Application**
2. اختر **Compose**
3. اربط بـ GitHub repo
4. حدد ملف `docker-compose.dokploy.yml`
5. في **Environment Variables** أضف:

```env
DB_HOST=<اسم container البوستجريس من Dokploy>
DB_PORT=5432
DB_NAME=elbharah
DB_USER=elbharah
DB_PASSWORD=<كلمة المرور من الخطوة 2>
JWT_SECRET=<سلسلة عشوائية طويلة>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

6. اضغط **Deploy** 🚀

### الخطوة 4: اربط الدومين
1. إعدادات الـ Application → **Domains**
2. أضف الدومين (مثل `elbharah.com`)
3. فعّل **SSL/TLS** (Let's Encrypt تلقائي)

> **تغيير الدومين:** يمكنك تغيير الدومين من Dokploy مباشرة بدون أي تعديل في الكود — الكود لا يحتوي على أي hardcoded domain.

### الخطوة 5: شغّل الـ Seeds (بيانات أولية)
```bash
docker exec -it elbharah_backend npx sequelize-cli db:seed:all
```

---

## 🧹 مسح البيانات

### مسح كل البيانات (إعادة ضبط كاملة)
```bash
# على الخادم (Docker)
docker exec -it elbharah_backend npx sequelize-cli db:drop
docker exec -it elbharah_backend npx sequelize-cli db:create
docker exec -it elbharah_backend npx sequelize-cli db:migrate
docker exec -it elbharah_backend npx sequelize-cli db:seed:all
```

### مسح بيانات جدول معين (عبر SQL)
```bash
# الدخول لـ psql داخل Docker
docker exec -it <postgres_container> psql -U elbharah -d elbharah
```

ثم نفّذ أمر المسح حسب الجدول:

```sql
-- مسح المبيعات اليومية (الحركة المالية)
TRUNCATE daily_sales CASCADE;

-- مسح المشتريات وأقلامها
TRUNCATE purchase_items CASCADE;
TRUNCATE purchases CASCADE;

-- مسح المصروفات
TRUNCATE expenses CASCADE;

-- مسح المبيعات الآجلة
TRUNCATE credit_sales CASCADE;

-- مسح حسابات الآجل
TRUNCATE credit_accounts CASCADE;

-- مسح المبيعات الأخرى
TRUNCATE other_sales CASCADE;

-- مسح الفواتير الملغية
TRUNCATE cancelled_invoices CASCADE;

-- مسح حركات ماكينات الدفع
TRUNCATE pos_transactions CASCADE;

-- مسح جرد الأسماك
TRUNCATE fish_inventory CASCADE;

-- مسح أوامر التوصيل
TRUNCATE delivery_orders CASCADE;

-- مسح قنوات البيع اليومية
TRUNCATE daily_sale_channels CASCADE;
```

### مسح بيانات معينة (عبر API)
كل الـ endpoints تدعم DELETE. تحتاج توكن JWT:

```bash
# تسجيل دخول للحصول على التوكن
TOKEN=$(curl -s -X POST https://your-domain/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# حذف سجل مبيعات معين
curl -X DELETE https://your-domain/api/sales/1 \
  -H "Authorization: Bearer $TOKEN"

# حذف فاتورة شراء معينة
curl -X DELETE https://your-domain/api/purchases/1 \
  -H "Authorization: Bearer $TOKEN"

# حذف مصروف معين
curl -X DELETE https://your-domain/api/expenses/1 \
  -H "Authorization: Bearer $TOKEN"

# حذف مبيعة آجل معينة
curl -X DELETE https://your-domain/api/credit/sales/1 \
  -H "Authorization: Bearer $TOKEN"
```

### مسح كل البيانات مع الاحتفاظ بالمستخدمين والإعدادات
```sql
TRUNCATE daily_sales, purchases, purchase_items, expenses, other_sales,
  credit_sales, credit_accounts, pos_transactions, fish_inventory,
  delivery_orders, daily_sale_channels, cancelled_invoices CASCADE;
```

> **ملاحظة:** `CASCADE` يضمن مسح البيانات المرتبطة (مثل أقلام الفاتورة مع الفاتورة).

---

## 📁 هيكل المشروع

```
elbharah/
├── backend/
│   ├── src/
│   │   ├── config/         # إعدادات القاعدة
│   │   ├── models/         # 20 نموذج Sequelize
│   │   ├── controllers/    # Auth + Dashboard + Reports + CRUD Factory
│   │   ├── middleware/     # JWT + RBAC + Error handler
│   │   ├── routes/         # API routes + Reports routes
│   │   ├── seeders/        # بيانات أولية
│   │   └── server.js       # نقطة البداية
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/     # مكونات مشتركة (DataTable, ExportButton, CashCounter, Modal, etc.)
│   │   ├── layouts/        # Dashboard layout
│   │   ├── router/         # Vue Router
│   │   ├── stores/         # Pinia stores
│   │   ├── styles/         # Tailwind CSS
│   │   └── views/          # 24 صفحة
│   ├── public/
│   │   └── logo.png        # شعار المطعم
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml          # للـ local (مع PostgreSQL)
├── docker-compose.dokploy.yml  # للـ Dokploy (بدون PostgreSQL)
└── README.md
```

---

## 🔐 الأدوار والصلاحيات (RBAC)

| الميزة | admin | manager | cashier | accountant |
|---|---|---|---|---|
| عرض البيانات | ✅ | ✅ | ✅ | ✅ |
| إضافة/تعديل/حذف | ✅ | ✅ | ✅ | ❌ |
| التقارير | ✅ | ✅ | ❌ | ✅ |
| إدارة المستخدمين | ✅ | ❌ | ❌ | ❌ |
| الإعدادات | ✅ | ✅ | ❌ | ❌ |

---

## 📊 قاعدة البيانات

20 جدول تشمل: `users`, `suppliers`, `fish_types`, `purchases`, `purchase_items`, `daily_sales`, `pos_machines`, `pos_transactions`, `fish_inventory`, `expense_categories`, `expenses`, `other_sales`, `credit_accounts`, `credit_sales`, `delivery_platforms`, `sale_channels`, `daily_sale_channels`, `delivery_orders`, `cancelled_invoices`, `settings`

---

## 🎨 الهوية البصرية

| اللون | الكود | الاستخدام |
|---|---|---|
| كحلي داكن (Primary) | `#071746` | اللون الأساسي — الـ sidebar، النصوص، العناوين |
| أزرق بحري ساطع (Accent) | `#1A89C8` | اللون الثانوي — العناصر المميزة |
| ذهبي | `#D4A843` | الأزرار والتمييز |
| أبيض | `#FFFFFF` | الخلفيات |

الخط: **Cairo** — دعم كامل لـ RTL.

---

## 📡 API Endpoints

### Dashboard
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/api/dashboard/today` | إحصائيات اليوم |
| GET | `/api/dashboard/month` | إحصائيات الشهر |
| GET | `/api/dashboard/charts` | بيانات الرسوم البيانية |
| GET | `/api/dashboard/insights` | بطاقات إحصائية + مؤشر الأداء |
| GET | `/api/dashboard/notifications` | الإشعارات والتنبيهات |

### Reports
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/api/reports/sales` | تقرير المبيعات |
| GET | `/api/reports/fish` | تقرير الأسماك |
| GET | `/api/reports/delivery` | تقرير التوصيل |
| GET | `/api/reports/suppliers` | تقرير الدلالين |
| GET | `/api/reports/expenses` | تقرير المصروفات |
| GET | `/api/reports/profit` | تقرير الأرباح |
| GET | `/api/reports/pos` | تقرير ماكينات الدفع |
| GET | `/api/reports/credit` | تقرير الآجل |
| GET | `/api/reports/tax` | تقرير الضريبة |

### CRUD Endpoints
كل الموارد التالية تدعم: `GET (list)`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id`

| المورد | Endpoint |
|---|---|
| الدلالين | `/api/suppliers` |
| أنواع السمك | `/api/fish-types` |
| المشتريات | `/api/purchases` |
| المبيعات اليومية | `/api/sales` |
| ماكينات الدفع | `/api/pos/machines` |
| حركات الماكينات | `/api/pos/transactions` |
| المصروفات | `/api/expenses` |
| تصنيفات المصروفات | `/api/expense-categories` |
| مبيعات أخرى | `/api/other-sales` |
| حسابات الآجل | `/api/credit/accounts` |
| مبيعات الآجل | `/api/credit/sales` |
| تطبيقات التوصيل | `/api/delivery-platforms` |
| قنوات البيع | `/api/sale-channels` |
| الفواتير الملغية | `/api/cancelled-invoices` |
| جرد الأسماك | `/api/fish-inventory` |
| المستخدمين | `/api/users` |
| الإعدادات | `/api/settings` |

---

## 📝 الترخيص
MIT License — حر في الاستخدام والتعديل.
