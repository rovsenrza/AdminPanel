# Admin Panel - Tam Quraşdırma Təlimatı

Kateqoriyaları, xəbərləri, parametrləri və istifadəçi profillərini idarə etmək üçün PHP + MySQL backend ilə müasir admin panel.

---

## 🚀 SÜRƏTLİ BAŞLANĞIC (Addım-addım)

Admin paneli hostinginizdə quraşdırmaq üçün **sıra ilə** bu addımları izləyin.

---

## Addım 1: Faylları Hostinqə Yükləyin

### Seçim A: Git (Tövsiyə olunur)
```bash
git add .
git commit -m "Admin panel"
git push origin main
```
Sonra cPanel Git və ya SSH vasitəsilə hostingdə pull edin.

### Seçim B: FTP/Fayl Meneceri
Bütün faylları domeninizin dokument kök qovluğuna yükləyin.

---

## Addım 2: MySQL Verilənlər Bazası Yaradın

**cPanel → MySQL Databases** bölməsində:

1. **Verilənlər Bazası Yaradın**: `whm81_adminpanel`
2. **İstifadəçi Yaradın**: `whm81_adminpanel` şifrə ilə `adminpanel_2390%`
3. **İstifadəçini Bazaya Əlavə Edin** **BÜTÜN İCazələrlə**

---

## Addım 3: .env Faylı Yaradın

Fayl yaradın: `/backend/.env`

```env
DB_HOST=localhost
DB_NAME=whm81_adminpanel
DB_USER=whm81_adminpanel
DB_PASS=adminpanel_2390%
SESSION_NAME=admin_session
INSTALL_KEY=92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

**Vacib:** Kimlik məlumatlarını öz faktiki verilənlər bazası məlumatlarınızla əvəz edin.

---

## Addım 4: Fayl İcazələrini Təyin Edin

**cPanel → File Manager** bölməsində bu icazələri təyin edin:

| Fayl/Qovluq | İcazə |
|-------------|-------|
| `/.htaccess` | 644 |
| `/backend/.htaccess` | 644 |
| `/backend/.env` | 644 |
| `/backend/` qovluq | 755 |
| `/backend/lib/` qovluq | 755 |
| `/backend/routes/` qovluq | 755 |
| `/backend/database/` qovluq | 755 |
| `/uploads/` qovluq | 755 |

**İcazə təyin etmək üçün:** Fayla sağ klik → Change Permissions → Nömrə daxil edin → Saxla

---

## Addım 5: Uploads Qovluğunu Yaradın

**cPanel → File Manager** bölməsində:

1. Domen kökünüzə keçin
2. Qovluq yaradın: `uploads`
3. `uploads` daxilində qovluq yaradın: `news`
4. Hər iki qovluğa `755` icazəsini təyin edin

---

## Addım 6: Quraşdırıcını Çalışdırın

Brauzerinizdə bu URL-i açın:

```
https://adminpanel.81.whm.az/backend/install.php?key=92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

**Nə baş verir:**
1. Verilənlər bazası cədvəlləri avtomatik yaradılır
2. Admin istifadəçi yaratmaq üçün forma görünəcək
3. Doldurun: İstifadəçi adı, Email, Şifrə
4. **Admin İstifadəçi Yaradın** düyməsinə klik edin
5. Uğur göstəriləndən sonra **API KEY-İ KÖÇÜRÜN** (vebsaytınız üçün lazım olacaq)

---

## Addım 7: Admin Panelə Daxil Olun

Açın:
```
https://adminpanel.81.whm.az/login.html
```

Addım 6-da yaratdığınız email və şifrə ilə daxil olun.

---

## Addım 8: Təhlükəsizlik (Quraşdırmadan Sonra)

**Vacib:** Uğurlu quraşdırmadan sonra bunlardan BİRİNİ edin:

### Seçim A: Quraşdırıcı faylını silin
cPanel File Manager-də silin: `/backend/install.php`

### Seçim B: INSTALL_KEY-İ silin
`/backend/.env` faylını redaktə edin və INSTALL_KEY sətirini silin və ya şərhə alın:
```env
# INSTALL_KEY=...
```

---

## ✅ TAMAM!

Admin paneliniz artıq hazırdır:
- **Admin Panel:** `https://adminpanel.81.whm.az/index.html`
- **Giriş Səhifəsi:** `https://adminpanel.81.whm.az/login.html`

---

## 🌐 İCTİMAİ API (Vebsaytınız Üçün)

Vebsaytınız üçün məlumat əldə etmək üçün bu endpoint-lərdən istifadə edin.

**Bütün sorğular API açarı tələb edir** (Addım 6-dan).

### Kateqoriyaları Əldə Et
```
GET https://adminpanel.81.whm.az/backend/public/categories?api_key=YOUR_API_KEY
```

### Xəbər Siyahısını Əldə Et
```
GET https://adminpanel.81.whm.az/backend/public/news?api_key=YOUR_API_KEY&page=1&per_page=10
```

### Tək Xəbər Əldə Et
```
GET https://adminpanel.81.whm.az/backend/public/news?api_key=YOUR_API_KEY&slug=news-slug-here
```

### Parametrləri Əldə Et
```
GET https://adminpanel.81.whm.az/backend/public/settings?api_key=YOUR_API_KEY
```

### JavaScript Nümunəsi
```javascript
const API_KEY = 'your_api_key_here';
const API_BASE = 'https://adminpanel.81.whm.az/backend';

// Xəbərləri əldə et
fetch(`${API_BASE}/public/news?api_key=${API_KEY}&page=1`)
  .then(res => res.json())
  .then(data => {
    data.news.forEach(article => {
      console.log(article.title, article.image);
    });
  });
```

---

## 🔧 PROBLEM HƏLLİ

### Xəta: "Forbidden" və ya 403
**Səbəb:** .htaccess fayl icazələri səhvdir
**Həll:** `/.htaccess` və `/backend/.htaccess` fayllarına `644` icazəsini təyin edin

### Xəta: "Database is not configured"
**Səbəb:** .env faylı tapılmadı və ya kimlik məlumatları səhvdir
**Həll:** 
1. `/backend/.env` faylının mövcud olduğunu yoxlayın
2. DB kimlik məlumatlarının cPanel verilənlər bazası ilə uyğun olduğunu yoxlayın
3. `/backend/.env` faylına `644` icazəsini təyin edin

### Xəta: "Set INSTALL_KEY env var"
**Səbəb:** .env faylı oxunmur
**Həll:**
1. `/backend/.env` faylının mövcud olduğunu və `INSTALL_KEY=...` ehtiva etdiyini yoxlayın
2. İcazəni `644` olaraq təyin edin
3. .env faylında əlavə boşluqlar olmadığından əmin olun

### Giriş 405 Method Not Allowed qaytarır
**Səbəb:** .htaccess yönləndirməsi işləmir
**Həll:** 
1. `/.htaccess` faylının mövcud olduğunu və düzgün məzmunla yoxlayın
2. İcazəni `644` olaraq təyin edin
3. Apache mod_rewrite modulunun aktiv olduğunu yoxlayın (adətən cPanel-də aktivdir)

### Səhifələr giriş olmadan açılır
**Səbəb:** JavaScript auth guard işləmir
**Həll:** Bu normaldır, əgər backend cavab vermirsə. Əvvəlcə backend-i düzəldin.

---

## 📁 FAYL QURULUŞU

```
adminpanel/
├── index.html              # Dashboard
├── login.html              # Giriş səhifəsi
├── categories.html         # Kateqoriya siyahısı
├── categories-add.html     # Kateqoriya əlavə et
├── news.html               # Xəbər siyahısı
├── news-add.html           # Xəbər əlavə et
├── settings.html           # Sayt parametrləri
├── profile.html            # İstifadəçi profili
├── .htaccess               # Kök yönləndirmə qaydaları
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── main.js         # Auth guard, tema, yan panel
│       ├── categories.js   # Kateqoriya CRUD
│       └── news.js         # Xəbər CRUD
├── uploads/
│   └── news/               # Yüklənən şəkillər
└── backend/
    ├── .htaccess           # Backend yönləndirməsi
    ├── .env                # Verilənlər bazası konfiqurasiyası (bunu yaradın)
    ├── index.php           # API router
    ├── install.php         # Quraşdırıcı (quraşdırmadan sonra silin)
    ├── lib/
    │   ├── bootstrap.php
    │   ├── config.php      # .env yükləyir
    │   ├── db.php          # Verilənlər bazası əlaqəsi
    │   ├── http.php        # HTTP köməkçiləri
    │   └── auth.php        # Autentifikasiya
    ├── routes/
    │   ├── auth_login.php
    │   ├── auth_logout.php
    │   ├── auth_csrf.php
    │   ├── api_me.php
    │   ├── api_categories.php
    │   ├── api_news.php
    │   ├── api_settings.php
    │   ├── api_profile.php
    │   ├── api_upload.php
    │   ├── public_categories.php
    │   ├── public_news.php
    │   └── public_settings.php
    └── database/
        └── schema.sql      # Verilənlər bazası sxemi
```

---

## 🔐 TƏHLÜKƏSİZLİK QEYDLƏRİ

1. **install.php faylını silin** quraşdırmadan sonra
2. **API açarını gizli saxlayın** - yalnız server tərəfi kodunda istifadə edin
3. **.env .htaccess ilə qorunur** (brauzer vasitəsilə daxil olmaq olmaz)
4. **İstehsalda HTTPS istifadə edin**
5. **Admin istifadəçilər üçün güclü şifrələr**

---

## 📞 XÜSUSİYYƏTLƏR

### Admin Panel
- ✅ Sürtmə-buraxma sıralama ilə Kateqoriya CRUD
- ✅ Varlı mətn redaktoru ilə Xəbər CRUD
- ✅ Şəkil yükləmə (400KB limit)
- ✅ SEO sahələri (meta başlıq, təsvir, açar sözlər)
- ✅ Avtomatik yaradılan slug-lar
- ✅ Parametr idarəetməsi
- ✅ Profil və şifrə dəyişikliyi
- ✅ Qaranlıq/Aydın rejim keçid
- ✅ Qatlanan yan panel
- ✅ Məni yadda saxla (30 gün)

### İctimai API
- ✅ Kateqoriyaları əldə et
- ✅ Xəbər siyahısı (səhifə-səhifə)
- ✅ Slug ilə tək xəbər əldə et
- ✅ Sayt parametrlərini əldə et
- ✅ API açarı autentifikasiyası

---

## 🎨 DİZAYN

Sneat Bootstrap Admin Şablonuna əsaslanır:
- Əsas rəng: `#696cff`
- Qaranlıq rejim: `#212121` fon
- Kapsul dizaynı 6px border radius ilə
- Bootstrap 5.3 + Font Awesome 6.4

---

## 📝 HOSTİNGİNİZİN MƏLUMATI

```
Domain: adminpanel.81.whm.az
DB Adı: whm81_adminpanel
DB İstifadəçi: whm81_adminpanel
DB Şifrə: adminpanel_2390%
Quraşdırma Açarı: 92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

**Quraşdırıcı URL:**
```
https://adminpanel.81.whm.az/backend/install.php?key=92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

---

## Lisenziya

Şəxsi və kommersiya layihələri üçün pulsuz istifadə.