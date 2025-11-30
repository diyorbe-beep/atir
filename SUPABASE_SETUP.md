# Supabase Setup - HIDIM Backend

## Qadam 1: Supabase paketini o'rnatish

```bash
cd backend
npm install
```

## Qadam 2: Environment variables sozlash

`.env` fayl yarating yoki mavjud `.env` faylga qo'shing:

```env
SUPABASE_URL=https://ghvtzeweuqwmikyactwf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnR6ZXdldXF3bWlreWFjdHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODI5NzMsImV4cCI6MjA4MDA1ODk3M30.guoQ7Bp1qMdSqm_MDomZfeFYLlV9jVqzIN2dX9f4Deg
```

## Qadam 3: Supabase'da jadvallarni yaratish

1. Supabase Dashboard'ga kiring: https://supabase.com/dashboard
2. Loyihangizni tanlang
3. **SQL Editor** bo'limiga o'ting
4. `supabase_schema.sql` faylini ochib, barcha SQL kodini nusxalang
5. SQL Editor'ga yopishtiring va **RUN** tugmasini bosing

## Qadam 4: Backend serverni ishga tushirish

```bash
npm start
```

## Jadval strukturalari

### orders
- `id` (UUID, Primary Key)
- `customer` (TEXT)
- `phone` (TEXT)
- `email` (TEXT)
- `product` (TEXT)
- `price` (TEXT)
- `comment` (TEXT)
- `status` (TEXT, default: 'Yangi')
- `date` (DATE)
- `created_at` (TIMESTAMP)

### customers
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `gender` (TEXT)
- `age` (TEXT)
- `orders` (INTEGER)
- `profile` (TEXT)
- `created_at` (TIMESTAMP)

### profiles
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `code` (TEXT)
- `description` (TEXT)
- `customers` (INTEGER)

### discounts
- `id` (UUID, Primary Key)
- `code` (TEXT, UNIQUE)
- `discount` (INTEGER)
- `description` (TEXT)
- `active` (BOOLEAN)

### feedback
- `id` (UUID, Primary Key)
- `customer` (TEXT)
- `product` (TEXT)
- `comment` (TEXT)
- `video_url` (TEXT)
- `created_at` (TIMESTAMP)

### surveys
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `age` (TEXT)
- `gender` (TEXT)
- `season` (TEXT)
- `character` (TEXT[])
- `favorite_perfumes` (TEXT)
- `disliked_scents` (TEXT)
- `intensity` (TEXT)
- `occasion` (TEXT)
- `phone` (TEXT)
- `created_at` (TIMESTAMP)

### settings
- `id` (UUID, Primary Key)
- `telegram` (TEXT)
- `instagram` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `probnik_price` (TEXT)
- `price50ml` (TEXT)
- `price100ml` (TEXT)

## Eslatmalar

- Barcha jadvallar UUID id ishlatadi (JSON file'dagi integer id emas)
- Row Level Security (RLS) yoqilgan va barcha operatsiyalar uchun ruxsat berilgan
- Initial data avtomatik qo'shiladi (profiles, discounts, feedback, settings)

