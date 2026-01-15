# Admin Panel Deployment Guide

Complete step-by-step guide to deploy your admin panel on WHM/cPanel hosting.

---

## Prerequisites

- WHM/cPanel hosting account
- MySQL database access
- Git repository connected to hosting
- PHP 7.4+ with PDO extension
- SSL certificate (recommended for production)

---

## Step 1: Database Setup

### 1.1 Create MySQL Database in cPanel

1. Login to **cPanel**
2. Go to **MySQL Databases**
3. Create a new database:
   - Database name: `adminpanel_db` (or your choice)
   - Click **Create Database**

### 1.2 Create Database User

1. In the same page, scroll to **MySQL Users**
2. Create new user:
   - Username: `adminpanel_user`
   - Password: Generate strong password
   - Click **Create User**

### 1.3 Add User to Database

1. Scroll to **Add User To Database**
2. Select the user and database you created
3. Grant **ALL PRIVILEGES**
4. Click **Make Changes**

### 1.4 Note Your Database Credentials

Save these for later:
```
DB_HOST: localhost
DB_NAME: your_cpanel_username_adminpanel_db
DB_USER: your_cpanel_username_adminpanel_user
DB_PASS: your_generated_password
```

---

## Step 2: Environment Variables Setup

### 2.1 Create .env File

In your hosting file manager or via SSH, create `/backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=your_cpanel_username_adminpanel_db
DB_USER=your_cpanel_username_adminpanel_user
DB_PASS=your_database_password

# Session Configuration
SESSION_NAME=admin_session

# Installation Key (temporary - remove after installation)
INSTALL_KEY=your_random_secure_key_here
```

**Generate a secure INSTALL_KEY:**
```bash
# Use this command or generate random string
openssl rand -hex 32
```

### 2.2 Secure the .env File

Add to `/backend/.htaccess` (already included):
```apache
<Files ".env">
    Require all denied
</Files>
```

---

## Step 3: Deploy Code

### 3.1 Push to Git Repository

```bash
git add .
git commit -m "Admin panel ready for deployment"
git push origin main
```

### 3.2 Pull on Hosting

Via SSH or cPanel Git Version Control:
```bash
cd /home/your_username/public_html
git pull origin main
```

Or use cPanel's **Git Version Control** interface to deploy.

---

## Step 4: Run Installer

### 4.1 Access Installer

Navigate to:
```
https://yourdomain.com/backend/install.php?key=YOUR_INSTALL_KEY
```

Replace `YOUR_INSTALL_KEY` with the value from your `.env` file.

### 4.2 Create Admin User

Fill in the form:
- **Username:** admin (or your choice)
- **Email:** your@email.com
- **Password:** Strong password (min 8 characters)

Click **Create Admin User**

### 4.3 Save API Credentials

**IMPORTANT:** After installation, you'll see:
- **API Key** - Use this in your website API requests
- **API Secret** - Keep this secure (for future features)

**Copy both and save them securely!** They won't be shown again.

Example:
```
API Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
API Secret: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8
```

---

## Step 5: Security Hardening

### 5.1 Remove Installer

After successful installation, **immediately**:

**Option 1:** Delete the installer file
```bash
rm /home/your_username/public_html/backend/install.php
```

**Option 2:** Remove INSTALL_KEY from `.env`
```env
# Comment out or delete this line:
# INSTALL_KEY=your_random_secure_key_here
```

### 5.2 Verify .htaccess Protection

Ensure `/backend/.htaccess` exists with:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

<Files ".env">
    Require all denied
</Files>
```

### 5.3 Set Proper Permissions

```bash
chmod 755 /home/your_username/public_html/backend
chmod 644 /home/your_username/public_html/backend/.env
chmod 755 /home/your_username/public_html/uploads
```

### 5.4 Create uploads Directory

```bash
mkdir -p /home/your_username/public_html/uploads/news
chmod 755 /home/your_username/public_html/uploads
chmod 755 /home/your_username/public_html/uploads/news
```

---

## Step 6: Test Admin Panel

### 6.1 Login

Navigate to:
```
https://yourdomain.com/login.html
```

Login with the credentials you created during installation.

### 6.2 Test Features

1. **Categories:** Create, edit, delete, reorder
2. **News:** Create news with images (max 400KB)
3. **Settings:** Update site settings
4. **Profile:** Update your profile and password

### 6.3 Test Remember Me

- Check "Remember Me" when logging in
- Close browser and reopen
- You should still be logged in

---

## Step 7: Configure for Your Website

### 7.1 Get Your API Key

Your API key was shown during installation. If you didn't save it, you can retrieve it from the database:

```sql
SELECT api_key FROM settings WHERE id = 1;
```

### 7.2 Use API in Your Website

Add to your website's JavaScript:

```javascript
const API_BASE = 'https://yourdomain.com/backend';
const API_KEY = 'your_api_key_here';

// Fetch news
fetch(`${API_BASE}/public/news?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    console.log(data.news);
  });
```

### 7.3 Server-Side Usage (Recommended)

For better security, use API from server-side code (PHP, Node.js, Python):

**PHP Example:**
```php
<?php
$apiKey = 'your_api_key_here';
$url = "https://yourdomain.com/backend/public/news?api_key={$apiKey}";
$response = file_get_contents($url);
$data = json_decode($response, true);

foreach ($data['news'] as $news) {
    echo "<h2>{$news['title']}</h2>";
}
?>
```

---

## Step 8: SSL Configuration (Recommended)

### 8.1 Install SSL Certificate

In cPanel:
1. Go to **SSL/TLS Status**
2. Enable **AutoSSL** or install Let's Encrypt certificate
3. Verify SSL is active for your domain

### 8.2 Force HTTPS

Add to main `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Troubleshooting

### Issue: Can't access installer

**Solution:**
- Verify INSTALL_KEY matches in URL and `.env`
- Check file permissions on `install.php` (should be 644)
- Check Apache error logs in cPanel

### Issue: Database connection failed

**Solution:**
- Verify database credentials in `.env`
- Ensure database user has ALL PRIVILEGES
- Check DB_HOST (usually `localhost`)
- Verify database name includes cPanel username prefix

### Issue: Login not working

**Solution:**
- Clear browser cookies
- Verify admin user was created in database
- Check session configuration in `.env`
- Ensure cookies are enabled in browser

### Issue: Images not uploading

**Solution:**
- Create `/uploads/news` directory
- Set permissions: `chmod 755 /uploads/news`
- Check PHP upload limits in cPanel (PHP Settings)
- Verify max upload size is at least 512KB

### Issue: API returns 401 Unauthorized

**Solution:**
- Verify API key is correct
- Check API key is passed in URL: `?api_key=YOUR_KEY`
- Ensure API key exists in settings table
- Check for typos in API key

### Issue: Remember Me not working

**Solution:**
- Ensure cookies are enabled
- Check cookie domain settings
- Verify database has `remember_token` column
- Clear browser cookies and try again

---

## Maintenance

### Backup Database

Regular backups via cPanel:
1. Go to **phpMyAdmin**
2. Select your database
3. Click **Export**
4. Choose **Quick** export method
5. Download SQL file

### Update Admin Panel

```bash
cd /home/your_username/public_html
git pull origin main
```

### Monitor Logs

Check Apache error logs in cPanel for issues.

---

## Security Checklist

- ✅ Installer removed or INSTALL_KEY deleted
- ✅ `.env` file protected by .htaccess
- ✅ Strong admin password set
- ✅ SSL certificate installed
- ✅ API key kept secure (server-side only)
- ✅ File permissions set correctly
- ✅ Regular database backups scheduled
- ✅ PHP error display disabled in production

---

## Support

For issues or questions:
1. Check this deployment guide
2. Review API_DOCUMENTATION.md
3. Check Apache error logs
4. Verify database connection

---

## Quick Reference

### Important URLs
- Admin Login: `https://yourdomain.com/login.html`
- Admin Panel: `https://yourdomain.com/index.html`
- Public API: `https://yourdomain.com/backend/public/*`

### Important Files
- Database config: `/backend/.env`
- Schema: `/backend/database/schema.sql`
- Main router: `/backend/index.php`

### Database Tables
- `users` - Admin users
- `categories` - News categories
- `news` - News articles
- `news_images` - News images
- `settings` - Site settings (includes API keys)

---

**Deployment Complete!** 🎉

Your admin panel is now live and ready to manage content for your website.
