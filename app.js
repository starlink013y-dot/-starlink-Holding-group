let gamesData = [];

// جلب الألعاب من السيرفر
async function loadGames() {
    try {
        let response = await fetch('/api/games');
        gamesData = await response.json();
        show(gamesData);
    } catch (err) {
        console.error("خطأ في الاتصال بالسيرفر:", err);
    }
}

// عرض الكروت في المتجر
function show(list) {
    const gamesContainer = document.getElementById("games");
    if (!gamesContainer) return;

    let html = "";
    list.forEach((g, index) => {
        let actionBtn = (g.type === "ويب" || (g.platform && g.platform.includes("Web")))
            ? `<button class="download web-play-btn" onclick="playWebGame('${g.name}', '${g.link}')">▶️ العب الآن بالمتصفح</button>`
            : `<button class="download" onclick="openGame(${index})">عرض التفاصيل والتحميل</button>`;

        html += `
        <div class="card">
            <div>
                <img src="${g.image}">
                <h2>${g.name}</h2>
                <p>${g.desc}</p>
            </div>
            <div>
                <div class="badges-container">
                    <span class="badge ${g.price === 'مجاني' ? 'free' : 'paid'}">${g.price}</span>
                    <span class="badge platform">${g.platform || 'APK/EXE'}</span>
                </div>
                ${actionBtn}
            </div>
        </div>`;
    });
    gamesContainer.innerHTML = html;
}

// إرسال كلمة السر للتحقق في السيرفر دون تخزينها
async function loginAdmin() {
    let passInput = document.getElementById("adminPassword");
    if (!passInput || !passInput.value) {
        showNotify("⚠️ يرجى كتابة كلمة المرور!");
        return;
    }

    try {
        let response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passInput.value })
        });
        let result = await response.json();

        if (result.success) {
            sessionStorage.setItem('token', result.token);
            closeLogin();
            passInput.value = ""; // مسح الحقل فوراً
            let adminPanel = document.getElementById("adminPanel");
            if (adminPanel) adminPanel.classList.add("show");
            showNotify("✅ تم تسجيل الدخول بنجاح");
        } else {
            showNotify("❌ " + result.message);
        }
    } catch (err) {
        showNotify("❌ تعذر الاتصال بالسيرفر");
    }
}

// إضافة لعبة جديدة
async function addGame() {
    let token = sessionStorage.getItem('token');
    if (!token) {
        alert("يرجى تسجيل الدخول أولاً!");
        return;
    }

    let gameData = {
        token: token,
        name: document.getElementById("newName").value,
        desc: document.getElementById("newDesc").value,
        image: document.getElementById("newImage").value,
        link: document.getElementById("newLink").value,
        platform: document.getElementById("newPlatform").value,
        type: document.getElementById("newType").value,
        price: document.getElementById("newPrice").value
    };

    try {
        let response = await fetch('/api/games/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        let result = await response.json();
        
        if (result.success) {
            closeAdmin();
            loadGames();
            showNotify("✅ " + result.message);
        } else {
            showNotify("❌ " + result.message);
        }
    } catch (err) {
        showNotify("❌ حدث خطأ أثناء الإضافة");
    }
}

// ألعاب الويب والبحث والفلترة
function playWebGame(title, url) {
    document.getElementById("webGameTitle").innerText = title;
    document.getElementById("webGameFrame").src = url;
    document.getElementById("webGameModal").style.display = "flex";
}

function closeWebGame() {
    document.getElementById("webGameFrame").src = "";
    document.getElementById("webGameModal").style.display = "none";
}

function searchGames() {
    let text = document.getElementById("search").value.toLowerCase();
    let result = gamesData.filter(g => g.name.toLowerCase().includes(text));
    show(result);
}

function filterGames(type) {
    if (type === "الكل") { show(gamesData); return; }
    let result = gamesData.filter(g => g.type === type);
    show(result);
}

function openGame(i) {
    let g = gamesData[i];
    document.getElementById("details").style.display = "flex";
    document.getElementById("cover").src = g.image;
    document.getElementById("title").innerText = g.name;
    document.getElementById("description").innerText = g.desc;
    document.getElementById("platformTag").innerText = "المنصة: " + (g.platform || 'غير محدد');
    document.getElementById("downloads").innerText = "⬇️ " + (g.downloads || 0) + " تحميل";
    
    let dlBtn = document.getElementById("downloadButton");
    dlBtn.href = g.link;
    dlBtn.innerText = "تحميل ملف (" + (g.platform || 'تحميل') + ")";
}

function closeGame() { document.getElementById("details").style.display = "none"; }

function showNotify(text) {
    let n = document.getElementById("notify");
    if(!n) { alert(text); return; }
    n.innerText = text; n.style.display = "block";
    setTimeout(() => { n.style.display = "none"; }, 2500);
}

function openLogin() { 
    let box = document.getElementById("loginBox");
    if(box) box.style.display = "flex"; 
}

function closeLogin() { 
    let box = document.getElementById("loginBox");
    if(box) box.style.display = "none"; 
}

function closeAdmin() { 
    let admin = document.getElementById("adminPanel");
    if(admin) admin.classList.remove("show");
}

window.onload = loadGames;
