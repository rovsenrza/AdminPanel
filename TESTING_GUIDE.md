# Testing Guide - Admin Panel

## Important: Testing Locally vs Production

### The Issue You're Experiencing

If you're using a **live server extension** (like VS Code Live Server) to test the admin panel, it **won't work properly** because:

1. Live Server only serves static HTML files
2. The PHP backend at `/backend/` won't execute
3. Login will fail with 405 errors
4. Auth guard won't work

### How to Test Properly

You have **two options**:

---

## Option 1: Test on Your Hosting (Recommended)

This is the proper way to test since you'll deploy there anyway.

### Steps:

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Admin panel ready"
   git push origin main
   ```

2. **Pull on hosting** (via cPanel Git or SSH)

3. **Set up database and .env** (see DEPLOYMENT_GUIDE.md)

4. **Run installer:**
   ```
   https://yourdomain.com/backend/install.php?key=YOUR_INSTALL_KEY
   ```

5. **Test login:**
   ```
   https://yourdomain.com/login.html
   ```

---

## Option 2: Test Locally with PHP Server

If you want to test locally, you need a **PHP server**, not a static file server.

### Requirements:
- PHP 7.4+ installed
- MySQL/MariaDB running locally

### Setup Local Database:

1. **Install XAMPP, MAMP, or Laragon** (includes PHP + MySQL)

2. **Create database:**
   ```sql
   CREATE DATABASE adminpanel_local;
   ```

3. **Create `/backend/.env`:**
   ```env
   DB_HOST=localhost
   DB_NAME=adminpanel_local
   DB_USER=root
   DB_PASS=
   SESSION_NAME=admin_session
   INSTALL_KEY=test123
   ```

### Run PHP Server:

```bash
cd "/Users/User/Desktop/admin panel jeywa"
php -S localhost:8000
```

### Access Admin Panel:

1. **Run installer:**
   ```
   http://localhost:8000/backend/install.php?key=test123
   ```

2. **Login:**
   ```
   http://localhost:8000/login.html
   ```

3. **Admin panel:**
   ```
   http://localhost:8000/index.html
   ```

---

## Troubleshooting

### Error: "Cannot access pages without login"

**Good!** This means the auth guard is working. Go to `/login.html` first.

### Error: "405 Method Not Allowed" on login

**Cause:** You're using a static file server (Live Server) instead of PHP.

**Solution:** Use Option 1 (hosting) or Option 2 (PHP server).

### Error: "Cannot connect to database"

**Cause:** Database not configured or credentials wrong.

**Solution:** 
- Check `/backend/.env` file exists
- Verify database credentials
- Ensure MySQL is running

### Pages load but login doesn't work

**Cause:** Backend routing not working.

**Solution:**
- Verify `.htaccess` files exist in root and `/backend/`
- Check Apache `mod_rewrite` is enabled
- View error logs for details

---

## Testing Checklist

Once you have the server running properly:

### 1. Test Login
- [ ] Can access `/login.html`
- [ ] Login with correct credentials redirects to `/index.html`
- [ ] Login with wrong credentials shows error
- [ ] Remember Me checkbox works (stays logged in after browser restart)

### 2. Test Auth Guard
- [ ] Cannot access `/index.html` without login (redirects to `/login.html`)
- [ ] Cannot access `/categories.html` without login
- [ ] Cannot access `/news.html` without login
- [ ] Can access `/login.html` without being logged in

### 3. Test Categories
- [ ] Can view categories list
- [ ] Can create new category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Can reorder categories by drag-and-drop

### 4. Test News
- [ ] Can create news article
- [ ] Can upload images (max 400KB enforced)
- [ ] Can edit news article
- [ ] Can delete news article
- [ ] Slug auto-generates from title

### 5. Test Settings
- [ ] Can load settings
- [ ] Can update site title, domain, etc.
- [ ] Changes save successfully

### 6. Test Profile
- [ ] Can update username, email, phone
- [ ] Can change password
- [ ] Old password required for password change

### 7. Test Logout
- [ ] Logout button works
- [ ] Redirects to login page
- [ ] Cannot access admin pages after logout

### 8. Test Public API
- [ ] `/backend/public/categories?api_key=YOUR_KEY` returns categories
- [ ] `/backend/public/news?api_key=YOUR_KEY` returns news
- [ ] `/backend/public/settings?api_key=YOUR_KEY` returns settings
- [ ] Requests without API key return 401 error

---

## Current Status

✅ **Auth guard is now working** - Pages redirect to login when not authenticated
✅ **Remember Me implemented** - 30-day persistent login
✅ **API key authentication** - Public endpoints require API key
✅ **All CRUD operations wired** - Categories, news, settings, profile

⚠️ **To test properly:** Use hosting or local PHP server, NOT Live Server

---

## Quick Start for Testing

**Fastest way to test:**

1. Deploy to your hosting (you already have it connected)
2. Set up database in cPanel
3. Run installer
4. Login and test all features

This is the recommended approach since you'll be using hosting in production anyway.

---

## Need Help?

If you're still getting errors:

1. Check which server you're using (Live Server won't work)
2. Check error logs (cPanel or local PHP error log)
3. Verify database connection
4. Ensure `.htaccess` files are present
5. Check that PHP version is 7.4+

---

**Bottom line:** The admin panel is fully functional, but it requires a PHP server to run. Static file servers like Live Server cannot execute PHP code.
