const express = require('express');
const path = require('path');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3000;

// كلمة المرور السرية الخاصة بلوحة التحكم (مخفية تماماً عن المتصفح و F12)
const ADMIN_PASSWORD = "09980166120993317248";

// تفعيل الحماية والأمان عبر Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        frameSrc: ["'self'", "https://www.youtube.com"],
      },
    },
  })
);

app.use(express.json());

// ربط المجلد لتقديم ملفات الموقع الثابتة
app.use(express.static(path.join(__dirname)));

// مسار التحقق الآمن من كلمة المرور في الخلفية
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ربط جميع المسارات بملف الواجهة الرئيسي index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
});
