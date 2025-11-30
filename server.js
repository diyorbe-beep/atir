require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

const app = express()
const PORT = process.env.PORT || 3001

// Data file path
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
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    }
    return { orders: [], customers: [], profiles: [], discounts: [], feedback: [], surveys: [], settings: {} }
  } catch (error) {
    console.error('Error reading data:', error)
    return { orders: [], customers: [], profiles: [], discounts: [], feedback: [], surveys: [], settings: {} }
  }
}

// Helper function to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing data:', error)
    return false
  }
}

// ==================== ORDERS ====================
app.get('/api/orders', (req, res) => {
  try {
    const data = readData()
    console.log(`📥 GET /api/orders - Buyurtmalar soni: ${(data.orders || []).length}`)
    res.json(data.orders || [])
  } catch (error) {
    console.error('❌ GET /api/orders xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.get('/api/orders/:id', (req, res) => {
  const data = readData()
  const order = data.orders.find(o => o.id === req.params.id)
  if (order) {
    res.json(order)
  } else {
    res.status(404).json({ error: 'Order not found' })
  }
})

app.post('/api/orders', (req, res) => {
  try {
    console.log('📤 POST /api/orders - Yangi buyurtma:', req.body)
    const data = readData()
    const newOrder = {
      id: `#${String(data.orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...req.body,
      status: req.body.status || 'Yangi',
      createdAt: new Date().toISOString()
    }
    data.orders.push(newOrder)
    const saved = writeData(data)
    if (saved) {
      console.log(`✅ Buyurtma saqlandi: ${newOrder.id}`)
      console.log(`📊 Jami buyurtmalar: ${data.orders.length}`)
      res.json(newOrder)
    } else {
      console.error('❌ Buyurtma saqlanmadi - writeData xatosi')
      res.status(500).json({ error: 'Buyurtma saqlanmadi' })
    }
  } catch (error) {
    console.error('❌ POST /api/orders xatosi:', error)
    res.status(500).json({ error: 'Server xatosi', message: error.message })
  }
})

app.put('/api/orders/:id', (req, res) => {
  const data = readData()
  const index = data.orders.findIndex(o => o.id === req.params.id)
  if (index !== -1) {
    data.orders[index] = { ...data.orders[index], ...req.body }
    writeData(data)
    res.json(data.orders[index])
  } else {
    res.status(404).json({ error: 'Order not found' })
  }
})

app.delete('/api/orders/:id', (req, res) => {
  const data = readData()
  data.orders = data.orders.filter(o => o.id !== req.params.id)
  writeData(data)
  res.json({ success: true })
})

// ==================== CUSTOMERS ====================
app.get('/api/customers', (req, res) => {
  const data = readData()
  res.json(data.customers || [])
})

app.post('/api/customers', (req, res) => {
  const data = readData()
  const newCustomer = {
    id: Date.now(),
    ...req.body,
    orders: req.body.orders || 0,
    createdAt: new Date().toISOString()
  }
  data.customers.push(newCustomer)
  writeData(data)
  res.json(newCustomer)
})

app.put('/api/customers/:id', (req, res) => {
  const data = readData()
  const index = data.customers.findIndex(c => c.id == req.params.id)
  if (index !== -1) {
    data.customers[index] = { ...data.customers[index], ...req.body }
    writeData(data)
    res.json(data.customers[index])
  } else {
    res.status(404).json({ error: 'Customer not found' })
  }
})

// ==================== PROFILES ====================
app.get('/api/profiles', (req, res) => {
  const data = readData()
  res.json(data.profiles || [])
})

app.post('/api/profiles', (req, res) => {
  const data = readData()
  const newProfile = {
    id: Date.now(),
    ...req.body,
    customers: 0
  }
  data.profiles.push(newProfile)
  writeData(data)
  res.json(newProfile)
})

app.put('/api/profiles/:id', (req, res) => {
  const data = readData()
  const index = data.profiles.findIndex(p => p.id == req.params.id)
  if (index !== -1) {
    data.profiles[index] = { ...data.profiles[index], ...req.body }
    writeData(data)
    res.json(data.profiles[index])
  } else {
    res.status(404).json({ error: 'Profile not found' })
  }
})

app.delete('/api/profiles/:id', (req, res) => {
  const data = readData()
  data.profiles = data.profiles.filter(p => p.id != req.params.id)
  writeData(data)
  res.json({ success: true })
})

// ==================== DISCOUNTS ====================
app.get('/api/discounts', (req, res) => {
  const data = readData()
  res.json(data.discounts || [])
})

app.post('/api/discounts', (req, res) => {
  const data = readData()
  const newDiscount = {
    id: Date.now(),
    ...req.body,
    active: req.body.active !== undefined ? req.body.active : true
  }
  data.discounts.push(newDiscount)
  writeData(data)
  res.json(newDiscount)
})

app.put('/api/discounts/:id', (req, res) => {
  const data = readData()
  const index = data.discounts.findIndex(d => d.id == req.params.id)
  if (index !== -1) {
    data.discounts[index] = { ...data.discounts[index], ...req.body }
    writeData(data)
    res.json(data.discounts[index])
  } else {
    res.status(404).json({ error: 'Discount not found' })
  }
})

app.delete('/api/discounts/:id', (req, res) => {
  const data = readData()
  data.discounts = data.discounts.filter(d => d.id != req.params.id)
  writeData(data)
  res.json({ success: true })
})

// ==================== FEEDBACK ====================
app.get('/api/feedback', (req, res) => {
  const data = readData()
  res.json(data.feedback || [])
})

app.post('/api/feedback', (req, res) => {
  const data = readData()
  const newFeedback = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  data.feedback.push(newFeedback)
  writeData(data)
  res.json(newFeedback)
})

// ==================== SURVEYS ====================
app.get('/api/surveys', (req, res) => {
  const data = readData()
  res.json(data.surveys || [])
})

app.post('/api/surveys', (req, res) => {
  const data = readData()
  const newSurvey = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  data.surveys.push(newSurvey)
  writeData(data)
  res.json(newSurvey)
})

// ==================== SETTINGS ====================
app.get('/api/settings', (req, res) => {
  const data = readData()
  res.json(data.settings || {})
})

app.put('/api/settings', (req, res) => {
  const data = readData()
  data.settings = { ...data.settings, ...req.body }
  writeData(data)
  res.json(data.settings)
})

// ==================== DASHBOARD STATS ====================
app.get('/api/dashboard/stats', (req, res) => {
  const data = readData()
  const today = new Date().toISOString().split('T')[0]
  
  const todayOrders = data.orders.filter(o => o.date === today)
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

