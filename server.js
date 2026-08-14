const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10kb' }));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'تجاوزت حد المحاولات المسموح به!' }
});

app.use(express.static(__dirname));

const ADMIN_PASSWORD = process.env.ADMIN_PASS || "09980166120993317248";
const ADMIN_TOKEN = "SECRET_STARLINK_TOKEN_2026";

// 1. قاعدة بيانات منشورات الرئيسية (صور، فيديوهات، إعلانات، ألعاب قيد التطوير)
let mainPosts = [
    {
        id: 101,
        title: "مشروع لعبة zombie 3D الجديدة",
        category: "قيد التطوير", // فيديو / صورة / إعلان / قيد التطوير
        desc: "نحن نشتغل حالياً على تطوير لعبة زومبي 3D موجهة للهواتف، انتظروا الإطلاق قريباً!",
        mediaUrl: "https://picsum.photos/800/400?game",
        videoUrl: ""
    }
];

// 2. قاعدة بيانات ملفات المتجر (APK, IPA, EXE, Apps)
let shopItems = [
    {
        id: 1,
        name: "تطبيق استار لينك بريميم",
        type: "تطبيق",
        platform: "APK (Android)", // APK / IPA / EXE / ZIP
        desc: "تطبيق متكامل لخدمات الشبكات والبرمجيات.",
        image: "https://picsum.photos/400/250?app",
        link: "#",
        price: "مجاني"
    }
];

// تسجيل الدخول
app.post('/api/admin/login', loginLimiter, (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) res.json({ success: true, token: ADMIN_TOKEN });
    else res.status(401).json({ success: false, message: "كلمة المرور غير صحيحة!" });
});

// APIs الرئيسية
app.get('/api/posts', (req, res) => res.json(mainPosts));

app.post('/api/posts/add', (req, res) => {
    const { token, title, category, desc, mediaUrl, videoUrl } = req.body;
    if (token !== ADMIN_TOKEN) return res.status(403).json({ success: false, message: "غير مصرح لك!" });

    const newPost = { id: Date.now(), title, category, desc, mediaUrl, videoUrl };
    mainPosts.unshift(newPost);
    res.json({ success: true, message: "تم نشر الخبر/المحتوى في الرئيسية بنجاح!" });
});

// APIs المتجر
app.get('/api/games', (req, res) => res.json(shopItems));

app.post('/api/games/add', (req, res) => {
    const { token, name, desc, image, link, platform, type, price } = req.body;
    if (token !== ADMIN_TOKEN) return res.status(403).json({ success: false, message: "غير مصرح لك!" });

    const newItem = { id: Date.now(), name, desc, image, link, platform, type, price };
    shopItems.unshift(newItem);
    res.json({ success: true, message: "تم رفع الملف إلى المتجر بنجاح!" });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));

app.listen(PORT, () => console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`));
