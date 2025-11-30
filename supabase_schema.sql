-- HIDIM Backend - Supabase Database Schema
-- Bu SQL skriptni Supabase Dashboard > SQL Editor'da ishga tushiring

-- Orders jadvali
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT, -- Frontend uchun string ID (#001, #002)
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product TEXT NOT NULL,
  price TEXT NOT NULL,
  comment TEXT,
  status TEXT DEFAULT 'Yangi',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers jadvali
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT,
  age TEXT,
  orders INTEGER DEFAULT 0,
  profile TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles jadvali
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  customers INTEGER DEFAULT 0
);

-- Discounts jadvali
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- Feedback jadvali
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer TEXT NOT NULL,
  product TEXT,
  comment TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys jadvali
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  age TEXT,
  gender TEXT,
  season TEXT,
  character TEXT[],
  favorite_perfumes TEXT,
  disliked_scents TEXT,
  intensity TEXT,
  occasion TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings jadvali
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram TEXT,
  instagram TEXT,
  email TEXT,
  phone TEXT,
  probnik_price TEXT,
  price50ml TEXT,
  price100ml TEXT
);

-- Initial data qo'shish
INSERT INTO profiles (name, code, description, customers) VALUES
  ('Fresh', 'FRESH_01', 'Sauvage, Bleu de Chanel ruhidagi toza, yangicha, energiyali hidlar.', 45),
  ('Sweet & Oriental', 'SWEET_01', 'Vanilla, amber, oud notalari bilan issiq, chiroyli hidi yo''nalishlari.', 32),
  ('Ocean & Marine', 'OCEAN_01', 'Megamare va dengiz shamoli uslubida nam, sho''r, sof hidlar.', 28)
ON CONFLICT DO NOTHING;

INSERT INTO discounts (code, discount, description, active) VALUES
  ('VIDEO10', 10, 'Video fikr uchun', true),
  ('FIRST10', 10, 'Birinchi buyurtma uchun', true),
  ('WINTER15', 15, 'Qish mavsumi uchun', false),
  ('VIP20', 20, 'VIP mijozlar uchun', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO feedback (customer, product, comment, video_url) VALUES
  ('Sarvar', '50 ml EDP', 'Probnikdan keyin 50 ml oldim. Kiyimdan ikki kun hid ketmadi.', ''),
  ('Dilnoza', '10 ml Probnik', 'Surovnoma orqali tanlangan hid menga juda mos tushdi. Yengil, lekin sezilarli.', 'https://youtube.com/watch?v=example1'),
  ('Jamshid', '100 ml EDP', 'Yoqmasa almashtirish imkoniyati borligi uchun bemalol sinab ko''rdim.', '')
ON CONFLICT DO NOTHING;

INSERT INTO settings (telegram, instagram, email, phone, probnik_price, price50ml, price100ml) VALUES
  ('@hidim_parfum', '@hidim.official', 'info@hidim.uz', '+998901234567', '45000', '299000', '499000')
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) o'chirish (anon key bilan ishlash uchun)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS policies - barcha operatsiyalar uchun ruxsat berish
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on discounts" ON discounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on feedback" ON feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on surveys" ON surveys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

