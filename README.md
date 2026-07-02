# 🐟 بيت الأسماك — نظام إدارة مطعم السمك

نظام إدارة متكامل واحترافي لمطعم أسماك، مبني بأحدث التقنيات. يشمل المبيعات، المشتريات، الدلالين، المصروفات، التقارير، والإحصائيات — كل ذلك بواجهة عربية RTL أنيقة وسريعة.

---

## ✨ المميزات

### الوحدات الرئيسية
- **داشبورد** — إحصائيات لحظية + رسوم بيانية تفاعلية
- **الحركة المالية** — تسجيل المبيعات اليومية بكل قنوات البيع (صندوق، تطبيقات، ماكينات)
- **الموازنات** — حركة ماكينات الدفع (مدى، فيزا، ماستر) مع حساب الرسوم
- **الملخص الشهري** — جرد الأسماك وبيان النفقات
- **تكلفة السمك** — تتبع أسعار وأنواع الأسماك من كل دلال
- **الدلالين** — إدارة كاملة للموردين + كشف حساب لكل دلال
- **المشتريات** — فواتير شراء بالأقلام (نوع، وزن، سعر، تالف)
- **الإحصائيات** — تجميع الأقلام والوزن والأسعار
- **المصروفات** — 50 تصنيف جاهز
- **مبيعات أخرى** — مبيعات خارج قائمة المطعم
- **مبيعات آجل** — حسابات الشركات والمستحقات
- **الفواتير الملغية** — تسجيل وأسباب
- **مركز التقارير** — 9 أنواع تقارير شاملة
- **المستخدمين** — إدارة الحسابات والصلاحيات
- **الإعدادات** — أنواع سمك، أجهزة دفع، تطبيقات توصيل، تصنيفات، قنوات بيع

### التقنيات
| الطبقة | التقنية |
|---|---|
| Frontend | Vue.js 3 + Vite + Tailwind CSS + Pinia + Chart.js |
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

### الخطوة 5: شغّل الـ Seeds (بيانات أولية)
```bash
docker exec -it elbharah_backend npx sequelize-cli db:seed:all
```

---

## 📁 هيكل المشروع

```
elbharah/
├── backend/
│   ├── src/
│   │   ├── config/         # إعدادات القاعدة
│   │   ├── models/         # 18 نموذج Sequelize
│   │   ├── controllers/    # Auth + Dashboard + CRUD Factory
│   │   ├── middleware/     # JWT + RBAC + Error handler
│   │   ├── routes/         # API routes
│   │   ├── seeders/        # بيانات أولية
│   │   └── server.js       # نقطة البداية
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/     # مكونات مشتركة
│   │   ├── layouts/        # Dashboard layout
│   │   ├── router/         # Vue Router
│   │   ├── stores/         # Pinia stores
│   │   ├── styles/         # Tailwind CSS
│   │   └── views/          # 22 صفحة
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
| كحلي | `#0D3B4F` | اللون الأساسي |
| أزرق متوسط | `#1A5E7A` | التدرجات |
| ذهبي | `#D4A843` | الأزرار والتمييز |
| أبيض | `#FFFFFF` | الخلفيات |

الخط: **Cairo** — دعم كامل لـ RTL.

---

## 📝 الترخيص
MIT License — حر في الاستخدام والتعديل.
