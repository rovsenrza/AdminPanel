# Admin Panel - Complete Setup Guide

A modern admin panel with PHP + MySQL backend for managing categories, news, settings, and user profiles.

---

## 🚀 QUICK START (Step-by-Step)

Follow these steps **in order** to set up the admin panel on your hosting.

---

## Step 1: Upload Files to Hosting

### Option A: Git (Recommended)
```bash
git add .
git commit -m "Admin panel"
git push origin main
```
Then pull on hosting via cPanel Git or SSH.

### Option B: FTP/File Manager
Upload all files to your domain's document root folder.

---

## Step 2: Create MySQL Database

In **cPanel → MySQL Databases**:

1. **Create Database**: `whm81_adminpanel`
2. **Create User**: `whm81_adminpanel` with password `adminpanel_2390%`
3. **Add User to Database** with **ALL PRIVILEGES**

---

## Step 3: Create .env File

Create file: `/backend/.env`

```env
DB_HOST=localhost
DB_NAME=whm81_adminpanel
DB_USER=whm81_adminpanel
DB_PASS=adminpanel_2390%
SESSION_NAME=admin_session
INSTALL_KEY=92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

**Important:** Replace credentials with your actual database info.

---

## Step 4: Set File Permissions

In **cPanel → File Manager**, set these permissions:

| File/Folder | Permission |
|-------------|------------|
| `/.htaccess` | 644 |
| `/backend/.htaccess` | 644 |
| `/backend/.env` | 644 |
| `/backend/` folder | 755 |
| `/backend/lib/` folder | 755 |
| `/backend/routes/` folder | 755 |
| `/backend/database/` folder | 755 |
| `/uploads/` folder | 755 |

**To set permissions:** Right-click file → Change Permissions → Enter number → Save

---

## Step 5: Create Uploads Folder

In **cPanel → File Manager**:

1. Navigate to your domain root
2. Create folder: `uploads`
3. Inside `uploads`, create folder: `news`
4. Set both folders to permission `755`

---

## Step 6: Run Installer

Open this URL in your browser:

```
https://adminpanel.81.whm.az/backend/install.php?key=92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

**What happens:**
1. Database tables are created automatically
2. You'll see a form to create admin user
3. Fill in: Username, Email, Password
4. Click **Create Admin User**
5. **COPY THE API KEY** shown after success (you'll need it for your website)

---

## Step 7: Login to Admin Panel

Open:
```
https://adminpanel.81.whm.az/login.html
```

Login with the email and password you created in Step 6.

---

## Step 8: Security (After Installation)

**Important:** After successful installation, do ONE of these:

### Option A: Delete installer file
In cPanel File Manager, delete: `/backend/install.php`

### Option B: Remove INSTALL_KEY
Edit `/backend/.env` and remove or comment out the INSTALL_KEY line:
```env
# INSTALL_KEY=...
```

---

## ✅ DONE!

Your admin panel is now ready at:
- **Admin Panel:** `https://adminpanel.81.whm.az/index.html`
- **Login Page:** `https://adminpanel.81.whm.az/login.html`

---

## 🌐 PUBLIC API (For Your Website)

Use these endpoints to fetch data for your website.

**All requests require API key** (from Step 6).

### Get Categories
```
GET https://adminpanel.81.whm.az/backend/public/categories?api_key=YOUR_API_KEY
```

### Get News List
```
GET https://adminpanel.81.whm.az/backend/public/news?api_key=YOUR_API_KEY&page=1&per_page=10
```

### Get Single News
```
GET https://adminpanel.81.whm.az/backend/public/news?api_key=YOUR_API_KEY&slug=news-slug-here
```

### Get Settings
```
GET https://adminpanel.81.whm.az/backend/public/settings?api_key=YOUR_API_KEY
```

### JavaScript Example
```javascript
const API_KEY = 'your_api_key_here';
const API_BASE = 'https://adminpanel.81.whm.az/backend';

// Fetch news
fetch(`${API_BASE}/public/news?api_key=${API_KEY}&page=1`)
  .then(res => res.json())
  .then(data => {
    data.news.forEach(article => {
      console.log(article.title, article.image);
    });
  });
```

---

## 🔧 TROUBLESHOOTING

### Error: "Forbidden" or 403
**Cause:** .htaccess file permissions wrong
**Fix:** Set `/.htaccess` and `/backend/.htaccess` to permission `644`

### Error: "Database is not configured"
**Cause:** .env file not found or wrong credentials
**Fix:** 
1. Verify `/backend/.env` exists
2. Check DB credentials match cPanel database
3. Set `/backend/.env` permission to `644`

### Error: "Set INSTALL_KEY env var"
**Cause:** .env file not being read
**Fix:**
1. Verify `/backend/.env` exists and contains `INSTALL_KEY=...`
2. Set permission to `644`
3. Make sure there are no extra spaces in .env file

### Login returns 405 Method Not Allowed
**Cause:** .htaccess routing not working
**Fix:** 
1. Check `/.htaccess` exists with correct content
2. Set permission to `644`
3. Verify Apache mod_rewrite is enabled (usually is on cPanel)

### Pages accessible without login
**Cause:** JavaScript auth guard not running
**Fix:** This is normal if backend is not responding. Fix backend first.

---

## 📁 FILE STRUCTURE

```
adminpanel/
├── index.html              # Dashboard
├── login.html              # Login page
├── categories.html         # Categories list
├── categories-add.html     # Add category
├── news.html               # News list
├── news-add.html           # Add news
├── settings.html           # Site settings
├── profile.html            # User profile
├── .htaccess               # Root routing rules
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── main.js         # Auth guard, theme, sidebar
│       ├── categories.js   # Categories CRUD
│       └── news.js         # News CRUD
├── uploads/
│   └── news/               # Uploaded images
└── backend/
    ├── .htaccess           # Backend routing
    ├── .env                # Database config (create this)
    ├── index.php           # API router
    ├── install.php         # Installer (delete after setup)
    ├── lib/
    │   ├── bootstrap.php
    │   ├── config.php      # Loads .env
    │   ├── db.php          # Database connection
    │   ├── http.php        # HTTP helpers
    │   └── auth.php        # Authentication
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
        └── schema.sql      # Database schema
```

---

## 🔐 SECURITY NOTES

1. **Delete install.php** after installation
2. **Keep API key secret** - only use in server-side code
3. **.env is protected** by .htaccess (cannot be accessed via browser)
4. **Use HTTPS** in production
5. **Strong passwords** for admin users

---

## 📞 FEATURES

### Admin Panel
- ✅ Categories CRUD with drag-drop reordering
- ✅ News CRUD with rich text editor
- ✅ Image upload (400KB limit)
- ✅ SEO fields (meta title, description, keywords)
- ✅ Auto-generated slugs
- ✅ Settings management
- ✅ Profile and password change
- ✅ Dark/Light mode toggle
- ✅ Collapsible sidebar
- ✅ Remember me (30 days)

### Public API
- ✅ Get categories
- ✅ Get news list (paginated)
- ✅ Get single news by slug
- ✅ Get site settings
- ✅ API key authentication

---

## 🎨 DESIGN

Based on Sneat Bootstrap Admin Template:
- Primary color: `#696cff`
- Dark mode: `#212121` background
- Capsule design with 6px border radius
- Bootstrap 5.3 + Font Awesome 6.4

---

## 📝 YOUR HOSTING INFO

```
Domain: adminpanel.81.whm.az
DB Name: whm81_adminpanel
DB User: whm81_adminpanel
DB Pass: adminpanel_2390%
Install Key: 92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

**Installer URL:**
```
https://adminpanel.81.whm.az/backend/install.php?key=92f0a49da5f8a73bf0cf52fd5b997229d30f735f355973d33c97dae96029ce1e
```

---

## License

Free to use for personal and commercial projects.
