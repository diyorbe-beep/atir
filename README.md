# HIDIM Backend API

HIDIM Parfum Brendi uchun RESTful API server.

## O'rnatish

```bash
npm install
```

## Ishga tushirish

```bash
npm start
```

Yoki development rejimida:

```bash
npm run dev
```

Server `http://localhost:3001` da ishlaydi.

## API Endpoints

### Orders (Buyurtmalar)
- `GET /api/orders` - Barcha buyurtmalar
- `GET /api/orders/:id` - Bitta buyurtma
- `POST /api/orders` - Yangi buyurtma yaratish
- `PUT /api/orders/:id` - Buyurtmani yangilash
- `DELETE /api/orders/:id` - Buyurtmani o'chirish

### Customers (Mijozlar)
- `GET /api/customers` - Barcha mijozlar
- `POST /api/customers` - Yangi mijoz yaratish
- `PUT /api/customers/:id` - Mijozni yangilash

### Profiles (Hid profillari)
- `GET /api/profiles` - Barcha profillar
- `POST /api/profiles` - Yangi profil yaratish
- `PUT /api/profiles/:id` - Profilni yangilash
- `DELETE /api/profiles/:id` - Profilni o'chirish

### Discounts (Chegirmalar)
- `GET /api/discounts` - Barcha promo kodlar
- `POST /api/discounts` - Yangi promo kod yaratish
- `PUT /api/discounts/:id` - Promo kodni yangilash
- `DELETE /api/discounts/:id` - Promo kodni o'chirish

### Feedback
- `GET /api/feedback` - Barcha feedbacklar
- `POST /api/feedback` - Yangi feedback yaratish

### Surveys (Surovnomalar)
- `GET /api/surveys` - Barcha surovnomalar
- `POST /api/surveys` - Yangi surovnoma yaratish

### Settings (Sozlamalar)
- `GET /api/settings` - Sozlamalarni olish
- `PUT /api/settings` - Sozlamalarni yangilash

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistikasi

### Health Check
- `GET /api/health` - Server holatini tekshirish

## Ma'lumotlar bazasi

Barcha ma'lumotlar `data.json` faylida saqlanadi. Bu fayl avtomatik yaratiladi va yangilanadi.

## Port

Default port: `3001`

Portni o'zgartirish uchun environment variable ishlating:
```bash
PORT=3002 npm start
```


