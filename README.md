# 💧 AquaCRM - MERN Stack Water Store CRM

Ushbu loyiha Optom Suv sotish do'konlari uchun maxsus ishlab chiqilgan bo'lib, mijozlar, qarzlar, to'lovlar, mahsulotlar va sklad nazoratini avtomatlashtirish imkonini beradi.

## 🚀 Texnologiyalar
* **Frontend:** React, Vite, React-Router-DOM, Hot-Toast, Recharts
* **Backend:** Node.js, Express.js
* **Baza:** MongoDB Atlas, Mongoose
* **Uslub/Dizayn:** Vanilla CSS (To'q yashil va oltin rangli premium dizayn)

---

## 🛠 Lokal muhitda ishga tushirish (Local Development)

Loyihani o'z kompyuteringizda ishga tushirish uchun quyidagi buyruqlardan foydalaning:

1. **MongoDB'ni sozlash:**
`backend/.env` faylini ochib, mahalliy bazani kiriting:
```env
MONGO_URI=mongodb://localhost:27017/water-crm
PORT=5000
JWT_SECRET=water_crm_secret_key_2024
```

2. **Backend'ni ishga tushirish:**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend'ni ishga tushirish:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Internetga chiqarish (Deployment - Render & Vercel)

Loyiha arxitekturasi **Render** va **Vercel** platformalariga moslashtirilgan. Siz xohlasangiz har ikkisiga alohida, yoki faqat Render'ga to'liq joylashtirishingiz mumkin.

### 1-usul: Render.com ga to'liq (Full-Stack) yuklash
Agar siz backend va frontendni bitta joyda (Render.com) host qilmoqchi bo'lsangiz:
1. Render.com da **New Web Service** oching.
2. Ushbu GitHub repozitoriyani tanlang.
3. **Root Directory:** `backend`
4. **Environment:** `Node`
5. **Build Command:** `npm install && cd ../frontend && npm install --include=dev && npm run build`
6. **Start Command:** `node server.js`
7. **Environment Variables:** `MONGO_URI` (MongoDB Atlas manzilingiz) va `NODE_ENV=production` qo'shing.

*Izoh: `server.js` ichida frontend qurilgan `dist` papkasini avtomatik o'qiydigan kod yozilgan.*

### 2-usul: Frontend (Vercel) va Backend (Render) alohida
Agar Vercel orqali tekinroq va tezroq frontend joylamoqchi bo'lsangiz:

**A. Backend (Render.com)**
1. **New Web Service** ochib repo ni tanlaysiz.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Environment Variables:** `MONGO_URI` kiritib deploy qilasiz. Linkini oling (masalan: `https://water-crm-api.onrender.com`).

**B. Frontend (Vercel.com)**
1. Vercel da yangi loyiha ochasiz va repo ni tanlaysiz.
2. **Framework Preset:** Vite
3. **Root Directory:** `frontend`
4. **Environment Variables:** qismiga `VITE_API_URL` va qiymatiga Backend linkini yozasiz (masalan: `https://water-crm-api.onrender.com/api`).
5. Deploy qilasiz.

---

### ⚠️ MongoDB Atlas haqida eslatma
Agar bazaga ulana olmasangiz (`Network Error` yoki `ECONNREFUSED` xatosi), **MongoDB Atlas -> Network Access** bo'limida `0.0.0.0/0` IP manzili (hamma uchun ruxsat) qo'shilganligini, hamda internetingiz provayderi tomonidan maxsus yopilmaganligini tekshiring. Serverlarga yuklanganda bunday muammo bo'lmaydi.
