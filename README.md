# HIDIM Backend API

Backend server HIDIM parfum brendi uchun API xizmatlarini ta'minlaydi.

## O'rnatish

```bash
npm install
```

## Sozlash

### Email Yuborish

Email yuborish funksiyasini ishlatish uchun:

1. **Gmail App Password yarating**:
   - https://myaccount.google.com/ → Security
   - 2-Step Verification yoqing
   - App passwords → Mail → "HIDIM Backend"
   - 16 xonali parol oling

2. **.env fayl yarating**:
   ```bash
   cp .env.example .env
   ```

3. **.env faylini to'ldiring**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   ```

## Ishga Tushirish

```bash
npm start
```

Yoki development rejimida:
```bash
npm run dev
```

Server `http://localhost:3001` da ishlaydi.

## API Endpoints

### Orders
- `GET /api/orders` - Barcha buyurtmalar
- `GET /api/orders/:id` - Buyurtma ma'lumotlari
- `POST /api/orders` - Yangi buyurtma
- `PUT /api/orders/:id` - Buyurtmani yangilash
- `DELETE /api/orders/:id` - Buyurtmani o'chirish

### Customers
- `GET /api/customers` - Barcha mijozlar
- `POST /api/customers` - Yangi mijoz
- `PUT /api/customers/:id` - Mijozni yangilash

### Profiles
- `GET /api/profiles` - Barcha hid profillari
- `POST /api/profiles` - Yangi profil
- `PUT /api/profiles/:id` - Profilni yangilash
- `DELETE /api/profiles/:id` - Profilni o'chirish

### Discounts
- `GET /api/discounts` - Barcha chegirmalar
- `POST /api/discounts` - Yangi chegirma
- `PUT /api/discounts/:id` - Chegirmani yangilash
- `DELETE /api/discounts/:id` - Chegirmani o'chirish

### Feedback
- `GET /api/feedback` - Barcha feedbacklar
- `POST /api/feedback` - Yangi feedback

### Surveys
- `GET /api/surveys` - Barcha surovnomalar
- `POST /api/surveys` - Yangi surovnoma

### Settings
- `GET /api/settings` - Sozlamalar
- `PUT /api/settings` - Sozlamalarni yangilash

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistikasi

### Email Verification
- `POST /api/email/send-code` - Tasdiqlash kodini email ga yuborish
- `POST /api/email/verify-code` - Kodni tekshirish

### Health Check
- `GET /api/health` - Server holati

## Ma'lumotlar

Barcha ma'lumotlar `data.json` faylida saqlanadi. Bu fayl avtomatik yaratiladi va yangilanadi.

## Eslatmalar

- Email yuborish funksiyasi `.env` faylida EMAIL_USER va EMAIL_PASS sozlanmagan bo'lsa ishlamaydi
- Kodlar 5 daqiqa davomida amal qiladi
- Eski kodlar har 10 daqiqada avtomatik tozalanadi
