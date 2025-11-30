require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 3001

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ghvtzeweuqwmikyactwf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnR6ZXdldXF3bWlreWFjdHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODI5NzMsImV4cCI6MjA4MDA1ODk3M30.guoQ7Bp1qMdSqm_MDomZfeFYLlV9jVqzIN2dX9f4Deg'
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Supabase client yaratildi:', supabaseUrl)

// Data file path (fallback uchun)
const dataFile = path.join(__dirname, 'data.json')

// Ensure data.json exists with initial data
if (!fs.existsSync(dataFile)) {
  const initialData = {
    orders: [],
    customers: [],
    profiles: [
      { id: 1, name: "Fresh", code: "FRESH_01", description: "Sauvage, Bleu de Chanel ruhidagi toza, yangicha, energiyali hidlar.", customers: 45 },
      { id: 2, name: "Sweet & Oriental", code: "SWEET_01", description: "Vanilla, amber, oud notalari bilan issiq, chiroyli hidi yo'nalishlari.", customers: 32 },
      { id: 3, name: "Ocean & Marine", code: "OCEAN_01", description: "Megamare va dengiz shamoli uslubida nam, sho'r, sof hidlar.", customers: 28 },
    ],
    discounts: [
      { id: 1, code: "VIDEO10", discount: 10, description: "Video fikr uchun", active: true },
      { id: 2, code: "FIRST10", discount: 10, description: "Birinchi buyurtma uchun", active: true },
      { id: 3, code: "WINTER15", discount: 15, description: "Qish mavsumi uchun", active: false },
      { id: 4, code: "VIP20", discount: 20, description: "VIP mijozlar uchun", active: true },
    ],
    feedback: [
      { id: 1, customer: "Sarvar", product: "50 ml EDP", comment: "Probnikdan keyin 50 ml oldim. Kiyimdan ikki kun hid ketmadi.", videoUrl: "" },
      { id: 2, customer: "Dilnoza", product: "10 ml Probnik", comment: "Surovnoma orqali tanlangan hid menga juda mos tushdi. Yengil, lekin sezilarli.", videoUrl: "https://youtube.com/watch?v=example1" },
      { id: 3, customer: "Jamshid", product: "100 ml EDP", comment: "Yoqmasa almashtirish imkoniyati borligi uchun bemalol sinab ko'rdim.", videoUrl: "" },
    ],
    surveys: [],
    settings: {
      telegram: "@hidim_parfum",
      instagram: "@hidim.official",
      email: "info@hidim.uz",
      phone: "+998901234567",
      probnikPrice: "45000",
      price50ml: "299000",
      price100ml: "499000"
    }
  }
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2))
  console.log('Initial data.json created')
}

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Helper function to read data
const readData = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const fileContent = fs.readFileSync(dataFile, 'utf8')
      const data = JSON.parse(fileContent)
      console.log(`📖 Data fayl o'qildi: ${dataFile}`)
      console.log(`📊 Buyurtmalar soni: ${(data.orders || []).length}`)
      return data
    }
    console.warn(`⚠️ Data fayl topilmadi: ${dataFile}`)
    return { orders: [], customers: [], profiles: [], discounts: [], feedback: [], surveys: [], settings: {} }
  } catch (error) {
    console.error('❌ Error reading data:', error)
    return { orders: [], customers: [], profiles: [], discounts: [], feedback: [], surveys: [], settings: {} }
  }
}

// Helper function to write data
const writeData = (data) => {
  try {
    console.log(`💾 Data faylga yozilmoqda: ${dataFile}`)
    console.log(`📊 Buyurtmalar soni: ${(data.orders || []).length}`)
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
    console.log(`✅ Data faylga yozildi: ${dataFile}`)
    
    // Tekshirish: yozilgan ma'lumotlarni o'qib ko'ramiz
    const verifyData = readData()
    console.log(`✅ Tekshirish: Buyurtmalar soni: ${(verifyData.orders || []).length}`)
    
    return true
  } catch (error) {
    console.error('❌ Error writing data:', error)
    console.error('❌ Data file path:', dataFile)
    return false
  }
}

// ==================== ORDERS ====================
app.get('/api/orders', async (req, res) => {
  try {
    console.log(`📥 GET /api/orders - So'rov keldi`)
    
    // Supabase'dan buyurtmalarni olish
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Supabase xatosi:', error)
      throw error
    }
    
    // Frontend uchun id ni order_id ga o'zgartirish
    const formattedOrders = (orders || []).map(order => ({
      ...order,
      id: order.order_id || order.id
    }))
    
    console.log(`📥 GET /api/orders - Buyurtmalar soni: ${formattedOrders.length}`)
    
    if (formattedOrders.length > 0) {
      console.log(`📋 Birinchi buyurtma:`, JSON.stringify(formattedOrders[0], null, 2))
    }
    
    res.json(formattedOrders)
  } catch (error) {
    console.error('❌ GET /api/orders xatosi:', error)
    console.error('❌ Error stack:', error.stack)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.get('/api/orders/:id', async (req, res) => {
  try {
    // order_id yoki id bo'yicha qidirish
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_id.eq.${req.params.id},id.eq.${req.params.id}`)
      .single()
    
    if (error) {
      console.error('❌ Supabase xatosi:', error)
      return res.status(404).json({ error: 'Order not found' })
    }
    
    // Frontend uchun id ni order_id ga o'zgartirish
    const responseOrder = {
      ...order,
      id: order.order_id || order.id
    }
    
    res.json(responseOrder)
  } catch (error) {
    console.error('❌ GET /api/orders/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    console.log('📤 POST /api/orders - Yangi buyurtma:', JSON.stringify(req.body, null, 2))
    
    // Buyurtmalar sonini olish (order_id yaratish uchun)
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const orderNumber = (count || 0) + 1
    const orderId = `#${String(orderNumber).padStart(3, '0')}`
    
    // Buyurtma ma'lumotlarini tayyorlash
    const orderData = {
      order_id: orderId, // Frontend uchun string ID
      customer: req.body.customer,
      phone: req.body.phone,
      email: req.body.email || '',
      product: req.body.product,
      price: req.body.price,
      comment: req.body.comment || '',
      status: req.body.status || 'Yangi',
      date: req.body.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
    
    console.log(`📝 Supabase'ga yuborilmoqda:`, JSON.stringify(orderData, null, 2))
    
    // Supabase'ga buyurtma yaratish
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase xatosi:', error)
      throw error
    }
    
    // Frontend uchun id ni order_id ga o'zgartirish
    const responseOrder = {
      ...newOrder,
      id: newOrder.order_id || newOrder.id
    }
    
    console.log(`✅ Buyurtma saqlandi:`, JSON.stringify(responseOrder, null, 2))
    res.json(responseOrder)
  } catch (error) {
    console.error('❌ POST /api/orders xatosi:', error)
    console.error('❌ Error stack:', error.stack)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.put('/api/orders/:id', async (req, res) => {
  try {
    // order_id yoki id bo'yicha yangilash
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(req.body)
      .or(`order_id.eq.${req.params.id},id.eq.${req.params.id}`)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase xatosi:', error)
      return res.status(404).json({ error: 'Order not found' })
    }
    
    // Frontend uchun id ni order_id ga o'zgartirish
    const responseOrder = {
      ...updatedOrder,
      id: updatedOrder.order_id || updatedOrder.id
    }
    
    res.json(responseOrder)
  } catch (error) {
    console.error('❌ PUT /api/orders/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.delete('/api/orders/:id', async (req, res) => {
  try {
    // order_id yoki id bo'yicha o'chirish
    const { error } = await supabase
      .from('orders')
      .delete()
      .or(`order_id.eq.${req.params.id},id.eq.${req.params.id}`)
    
    if (error) {
      console.error('❌ Supabase xatosi:', error)
      return res.status(404).json({ error: 'Order not found' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('❌ DELETE /api/orders/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== CUSTOMERS ====================
app.get('/api/customers', async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    res.json(customers || [])
  } catch (error) {
    console.error('❌ GET /api/customers xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.post('/api/customers', async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      orders: req.body.orders || 0,
      created_at: new Date().toISOString()
    }
    
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()
    
    if (error) throw error
    res.json(newCustomer)
  } catch (error) {
    console.error('❌ POST /api/customers xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()
    
    if (error) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json(updatedCustomer)
  } catch (error) {
    console.error('❌ PUT /api/customers/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== PROFILES ====================
app.get('/api/profiles', async (req, res) => {
  try {
    const { data: profiles, error } = await supabase.from('profiles').select('*')
    if (error) throw error
    res.json(profiles || [])
  } catch (error) {
    console.error('❌ GET /api/profiles xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.post('/api/profiles', async (req, res) => {
  try {
    const profileData = { ...req.body, customers: req.body.customers || 0 }
    const { data: newProfile, error } = await supabase.from('profiles').insert([profileData]).select().single()
    if (error) throw error
    res.json(newProfile)
  } catch (error) {
    console.error('❌ POST /api/profiles xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.put('/api/profiles/:id', async (req, res) => {
  try {
    const { data: updatedProfile, error } = await supabase.from('profiles').update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(404).json({ error: 'Profile not found' })
    res.json(updatedProfile)
  } catch (error) {
    console.error('❌ PUT /api/profiles/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', req.params.id)
    if (error) return res.status(404).json({ error: 'Profile not found' })
    res.json({ success: true })
  } catch (error) {
    console.error('❌ DELETE /api/profiles/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== DISCOUNTS ====================
app.get('/api/discounts', async (req, res) => {
  try {
    const { data: discounts, error } = await supabase.from('discounts').select('*')
    if (error) throw error
    res.json(discounts || [])
  } catch (error) {
    console.error('❌ GET /api/discounts xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.post('/api/discounts', async (req, res) => {
  try {
    const discountData = { ...req.body, active: req.body.active !== undefined ? req.body.active : true }
    const { data: newDiscount, error } = await supabase.from('discounts').insert([discountData]).select().single()
    if (error) throw error
    res.json(newDiscount)
  } catch (error) {
    console.error('❌ POST /api/discounts xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.put('/api/discounts/:id', async (req, res) => {
  try {
    const { data: updatedDiscount, error } = await supabase.from('discounts').update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(404).json({ error: 'Discount not found' })
    res.json(updatedDiscount)
  } catch (error) {
    console.error('❌ PUT /api/discounts/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.delete('/api/discounts/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('discounts').delete().eq('id', req.params.id)
    if (error) return res.status(404).json({ error: 'Discount not found' })
    res.json({ success: true })
  } catch (error) {
    console.error('❌ DELETE /api/discounts/:id xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== FEEDBACK ====================
app.get('/api/feedback', async (req, res) => {
  try {
    const { data: feedback, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    if (error) throw error
    res.json(feedback || [])
  } catch (error) {
    console.error('❌ GET /api/feedback xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.post('/api/feedback', async (req, res) => {
  try {
    const feedbackData = { ...req.body, created_at: new Date().toISOString() }
    const { data: newFeedback, error } = await supabase.from('feedback').insert([feedbackData]).select().single()
    if (error) throw error
    res.json(newFeedback)
  } catch (error) {
    console.error('❌ POST /api/feedback xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== SURVEYS ====================
app.get('/api/surveys', async (req, res) => {
  try {
    const { data: surveys, error } = await supabase.from('surveys').select('*').order('created_at', { ascending: false })
    if (error) throw error
    
    // Frontend uchun camelCase ga o'zgartirish
    const formattedSurveys = (surveys || []).map(survey => ({
      ...survey,
      favoritePerfumes: survey.favorite_perfumes,
      dislikedScents: survey.disliked_scents
    }))
    
    res.json(formattedSurveys)
  } catch (error) {
    console.error('❌ GET /api/surveys xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.post('/api/surveys', async (req, res) => {
  try {
    // Frontend'dan kelgan camelCase ma'lumotlarni snake_case ga o'zgartirish
    const surveyData = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      season: req.body.season,
      character: req.body.character || [],
      favorite_perfumes: req.body.favoritePerfumes || req.body.favorite_perfumes,
      disliked_scents: req.body.dislikedScents || req.body.disliked_scents,
      intensity: req.body.intensity,
      occasion: req.body.occasion,
      phone: req.body.phone,
      created_at: new Date().toISOString()
    }
    
    const { data: newSurvey, error } = await supabase.from('surveys').insert([surveyData]).select().single()
    if (error) throw error
    
    // Frontend uchun camelCase ga o'zgartirish
    const responseSurvey = {
      ...newSurvey,
      favoritePerfumes: newSurvey.favorite_perfumes,
      dislikedScents: newSurvey.disliked_scents
    }
    
    res.json(responseSurvey)
  } catch (error) {
    console.error('❌ POST /api/surveys xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== SETTINGS ====================
app.get('/api/settings', async (req, res) => {
  try {
    const { data: settings, error } = await supabase.from('settings').select('*').single()
    if (error && error.code !== 'PGRST116') throw error
    res.json(settings || {})
  } catch (error) {
    console.error('❌ GET /api/settings xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.put('/api/settings', async (req, res) => {
  try {
    // Settings jadvalida faqat bitta qator bo'lishi kerak
    const { data: existing, error: checkError } = await supabase.from('settings').select('*').single()
    
    if (checkError && checkError.code === 'PGRST116') {
      // Settings yo'q, yangi yaratish
      const { data: newSettings, error } = await supabase.from('settings').insert([req.body]).select().single()
      if (error) throw error
      res.json(newSettings)
    } else {
      // Settings mavjud, yangilash
      const { data: updatedSettings, error } = await supabase.from('settings').update(req.body).eq('id', existing.id).select().single()
      if (error) throw error
      res.json(updatedSettings)
    }
  } catch (error) {
    console.error('❌ PUT /api/settings xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== DASHBOARD STATS ====================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Bugungi buyurtmalarni olish
    const { data: todayOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('date', today)
    
    if (error) throw error
    
    const todayProbniks = todayOrders.filter(o => o.product && o.product.includes('10 ml'))
    const todayFlakons = todayOrders.filter(o => o.product && (o.product.includes('50 ml') || o.product.includes('100 ml')))
    const totalRevenue = todayOrders.reduce((sum, o) => {
      const price = parseInt(o.price?.replace(/\s/g, '') || 0)
      return sum + price
    }, 0)

    res.json({
      todayOrders: todayOrders.length,
      todayProbniks: todayProbniks.length,
      todayFlakons: todayFlakons.length,
      totalRevenue: totalRevenue
    })
  } catch (error) {
    console.error('❌ GET /api/dashboard/stats xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

// ==================== EMAIL VERIFICATION ====================
// Email transporter sozlash (Gmail uchun)
// Environment variables: EMAIL_USER va EMAIL_PASS
let transporter = null
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  console.log('✅ Email transporter sozlandi')
  console.log(`📧 Email yuboruvchi: ${process.env.EMAIL_USER}`)
} else {
  console.warn('⚠️ EMAIL_USER va EMAIL_PASS environment variables topilmadi. Email yuborish ishlamaydi.')
  console.warn('📝 .env faylida EMAIL_USER va EMAIL_PASS ni sozlang.')
  console.warn('📝 EMAIL_USER=marufzonkodirov0@gmail.com')
  console.warn('📝 EMAIL_PASS=your-app-password-here (Gmail App Password)')
}

// Kodlarni saqlash uchun (memory da, production da Redis yoki DB ishlatish kerak)
const verificationCodes = {}

// 6 xonali kod yaratish
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email yuborish endpoint
app.post('/api/email/send-code', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(503).json({ 
        success: false, 
        message: 'Email servisi sozlanmagan. EMAIL_USER va EMAIL_PASS environment variables ni sozlang.' 
      })
    }

    const { email, name } = req.body

    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faqat Gmail manzil qabul qilinadi' 
      })
    }

    // Kod yaratish
    const code = generateCode()
    
    // Kodni console ga chiqarish (debug uchun)
    console.log(`📧 ${email} uchun tasdiqlash kodi: ${code}`)
    
    // Kodni saqlash (5 daqiqa muddat)
    verificationCodes[email] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 daqiqa
    }

    // Email yuborish
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'HIDIM - Tasdiqlash kodi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #F5EEE7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #C79A57; margin: 0 0 10px 0;">HIDIM - Shaxsiy Parfum Brendi</h2>
          </div>
          <p style="color: #111111; font-size: 16px;">Salom, ${name || 'Foydalanuvchi'}!</p>
          <p style="color: #111111; font-size: 16px;">Ro'yxatdan o'tish uchun quyidagi tasdiqlash kodidan foydalaning:</p>
          <div style="background-color: #F5EEE7; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px solid #C79A57;">
            <h1 style="color: #111111; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">Bu kod 5 daqiqa davomida amal qiladi.</p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">Agar siz bu kodni so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; margin: 0;">HIDIM - Shaxsiy parfum brendi</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Telegram: @hidim_parfum | Instagram: @hidim.official</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Tasdiqlash kodi yuborildi: ${email}`)

    res.json({ 
      success: true, 
      message: 'Kod email manziliga yuborildi' 
    })
  } catch (error) {
    console.error('❌ Email yuborish xatosi:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Email yuborishda xatolik yuz berdi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Kodni tekshirish endpoint
app.post('/api/email/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email va kod kerak' 
      })
    }

    const stored = verificationCodes[email]

    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kod topilmadi yoki muddati o\'tgan' 
      })
    }

    if (Date.now() > stored.expiresAt) {
      delete verificationCodes[email]
      return res.status(400).json({ 
        success: false, 
        message: 'Kod muddati o\'tgan' 
      })
    }

    // Kodni tekshirish (string sifatida)
    const enteredCode = String(code).trim()
    const storedCode = String(stored.code).trim()
    
    console.log(`🔍 Kod tekshirilmoqda: ${email}`)
    console.log(`📝 Kiritilgan kod: ${enteredCode}`)
    console.log(`📝 Saqlangan kod: ${storedCode}`)
    
    if (storedCode !== enteredCode) {
      console.log(`❌ Kod noto'g'ri: ${email}`)
      return res.status(400).json({ 
        success: false, 
        message: 'Noto\'g\'ri kod' 
      })
    }

    // Kod to'g'ri, kodni o'chirish
    delete verificationCodes[email]
    console.log(`✅ Kod tasdiqlandi: ${email}`)

    res.json({ 
      success: true, 
      message: 'Kod tasdiqlandi' 
    })
  } catch (error) {
    console.error('❌ Kod tekshirish xatosi:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Kodni tekshirishda xatolik yuz berdi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Eski kodlarni tozalash (har 10 daqiqada)
setInterval(() => {
  const now = Date.now()
  let cleaned = 0
  for (const email in verificationCodes) {
    if (verificationCodes[email].expiresAt < now) {
      delete verificationCodes[email]
      cleaned++
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} ta eski kod tozalandi`)
  }
}, 10 * 60 * 1000) // 10 daqiqa

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    emailConfigured: !!transporter
  })
})

app.listen(PORT, () => {
  console.log(`🚀 HIDIM Backend Server is running on http://localhost:${PORT}`)
  console.log(`📁 Data file: ${dataFile}`)
  if (!transporter) {
    console.log(`⚠️  Email yuborish uchun .env faylida EMAIL_USER va EMAIL_PASS ni sozlang`)
  }
})

