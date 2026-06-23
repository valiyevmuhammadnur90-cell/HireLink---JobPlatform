# Job Finder — To'liq Full-Stack Loyiha

MongoDB + Express + React (MERN) asosida qurilgan professional ish qidirish platformasi.

## Tuzilma

```
job-finder/
├── backend/      Node.js + Express + MongoDB API
└── frontend/     React + Vite + Tailwind CSS
```

## Backend ishga tushirish

```bash
cd backend
cp .env.example .env      # .env faylini sozlang (MONGO_URI, JWT_SECRET)
npm install
npm run dev                # nodemon bilan (yoki npm start)
```

API manzili: `http://localhost:5000/api`

### Talab qilinadigan muhit (.env)
- `MONGO_URI` — MongoDB ulanish manzili (lokal yoki MongoDB Atlas)
- `JWT_SECRET` — JWT tokenlarini imzolash uchun maxfiy kalit
- `PORT` — server porti (default 5000)
- `CLIENT_URL` — frontend manzili (CORS uchun)

## Frontend ishga tushirish

```bash
cd frontend
npm install
npm run dev
```

Sayt manzili: `http://localhost:5173` (Vite dev-server `/api` so'rovlarini avtomatik backendga proksi qiladi)

## Asosiy funksiyalar

**Backend (API)**
- JWT autentifikatsiya (Register/Login), rolga asoslangan ruxsatlar (jobseeker/employer/admin)
- User, Job, Application modellari (MongoDB/Mongoose)
- Vakansiyalar uchun to'liq CRUD, qidiruv (`$text` index) va filtrlash (tur, manzil, tajriba, maosh)
- Ariza topshirish, holatini boshqarish (pending/reviewed/accepted/rejected)
- Saqlangan vakansiyalar (saved jobs)
- Rezyume (CV) va boshqa fayllarni yuklash (Multer)
- Admin: foydalanuvchi/vakansiya boshqaruvi va statistik dashboard API

**Frontend (React)**
- Bosh sahifa, vakansiyalar ro'yxati (qidiruv + filtr + pagination)
- Vakansiya tafsilotlari va ariza topshirish formasi (fayl yuklash bilan)
- Ro'yxatdan o'tish / Kirish, profil tahrirlash, CV yuklash
- Ish izlovchi: saqlangan vakansiyalar, mening arizalarim
- Ish beruvchi: vakansiya yaratish, "mening vakansiyalarim" va arizalarni boshqarish
- Admin panel: statistik grafiklar (Recharts), foydalanuvchi/vakansiya boshqaruvi

## Texnologiyalar
Backend: Express, Mongoose, JWT, bcryptjs, Multer
Frontend: React 18, React Router, Axios, Tailwind CSS, Recharts, Vite

## Keyingi qadamlar (production uchun tavsiya)
- `.env` dagi `JWT_SECRET`ni kuchli qiymatga almashtiring
- MongoDB Atlas yoki boshqa boshqariladigan bazadan foydalaning
- Fayllarni S3/Cloudinary kabi bulutli xizmatda saqlang (lokal `/uploads` o'rniga)
- Backend va frontendni alohida deploy qiling (masalan: Render/Railway — backend, Vercel/Netlify — frontend)
