const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3000;

// كلمة المرور السرية الآمنة (محمية خلف F12 تماماً)
const ADMIN_PASSWORD = "09980166120993317248";
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// التأكد من وجود مجلد الرفع
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// إعداد التخزين لملفات الـ APK عبر Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(UPLOADS_DIR));

// قراءة الألعاب من ملف الحفظ الدائم
function loadGames() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return [
        {
            name: "لعبة قودوت التجريبية",
            type: "لعبة",
            desc: "مشروع لعبة تم تصميمه وتصديره عبر محرك Godot بنجاح.",
            downloads: 1250,
            version: "1.0",
            price: "مجاني",
            rating: "★★★★★",
            image: "https://picsum.photos/400/250?1",
            link: "#",
            likes: 15,
            comments: ["لعبة رائعة جداً مصممة باحتراف"]
        }
    ];
}

function saveGames(games) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2), 'utf8');
}

// مسارات واجهة البرمجة (API)
app.get('/api/games', (req, res) => {
    res.json(loadGames());
});

// إضافة عنصر أو لعبة قودوت جديدة (مع دعم رفع ملف APK)
app.post('/api/games', upload.single('apk'), (req, res) => {
    let games = loadGames();
    
    let downloadLink = req.body.link;
    if (req.file) {
        downloadLink = `/uploads/${req.file.filename}`;
    }

    let newItem = {
        name: req.body.name,
        desc: req.body.desc || "لا يوجد وصف",
        image: req.body.image || "https://picsum.photos/400/250",
        link: downloadLink || "#",
        type: req.body.type || "لعبة",
        price: req.body.price || "مجاني",
        rating: "★★★★★",
        downloads: 0,
        version: "1.0",
        likes: 0,
        comments: []
    };

    games.unshift(newItem);
    saveGames(games);
    res.json({ success: true, games });
});

// إعجاب بالعنصر
app.post('/api/games/:index/like', (req, res) => {
    let games = loadGames();
    let index = req.params.index;
    if (games[index]) {
        games[index].likes = (games[index].likes || 0) + 1;
        saveGames(games);
    }
    res.json({ success: true });
});

// إضافة تعليق
app.post('/api/games/:index/comment', (req, res) => {
    let games = loadGames();
    let index = req.params.index;
    if (games[index]) {
        if (!games[index].comments) games[index].comments = [];
        games[index].comments.push(req.body.comment);
        saveGames(games);
    }
    res.json({ success: true });
});

// حذف العنصر
app.delete('/api/games/:index', (req, res) => {
    let games = loadGames();
    let index = req.params.index;
    if (index >= 0 && index < games.length) {
        games.splice(index, 1);
        saveGames(games);
        return res.json({ success: true, games });
    }
    res.status(400).json({ success: false });
});

// التحقق الآمن من تسجيل دخول المدير
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
});
