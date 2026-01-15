# Admin Panel API Documentation

## Public API Endpoints (For Your Website)

These endpoints are **read-only** and require **API Key authentication**. Use them to fetch data from your admin panel for display on your website.

### Base URL
```
https://yourdomain.com/backend
```

### Authentication

All public API endpoints require an API key. You'll receive your API key during installation.

**Two ways to provide the API key:**

1. **Query parameter (recommended):**
```
GET /backend/public/news?api_key=YOUR_API_KEY_HERE
```

2. **HTTP Header:**
```
X-API-Key: YOUR_API_KEY_HERE
```

⚠️ **Security Note:** Keep your API key secure. Only use it in server-side code, never expose it in client-side JavaScript on public websites.

---

## 1. Get All Categories

**Endpoint:** `GET /public/categories`

**Description:** Fetch all categories with their hierarchy and SEO data.

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "parent_id": null,
      "name": "Technology",
      "slug": "technology",
      "description": "Tech news and updates",
      "meta_title": "Technology News",
      "meta_description": "Latest technology news",
      "meta_keywords": "tech, technology, news",
      "sort_order": 0
    }
  ]
}
```

**Example Usage:**
```javascript
const API_KEY = 'your_api_key_here';

fetch(`https://yourdomain.com/backend/public/categories?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    console.log(data.categories);
  });
```

---

## 2. Get News List (Paginated)

**Endpoint:** `GET /public/news`

**Query Parameters:**
- `category_id` (optional): Filter by category ID
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 10, max: 100): Items per page

**Response:**
```json
{
  "news": [
    {
      "id": 1,
      "category_id": 1,
      "title": "Breaking Tech News",
      "slug": "breaking-tech-news",
      "short_desc_html": "<p>Short description...</p>",
      "video_url": "https://youtube.com/...",
      "meta_title": "Breaking Tech News",
      "meta_description": "Latest tech updates",
      "created_at": "2024-01-15 10:30:00",
      "category_name": "Technology",
      "category_slug": "technology",
      "image": "/uploads/news/news_abc123.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 45,
    "total_pages": 5
  }
}
```

**Example Usage:**
```javascript
const API_KEY = 'your_api_key_here';

// Get all news (page 1)
fetch(`https://yourdomain.com/backend/public/news?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    console.log(data.news);
    console.log(data.pagination);
  });

// Get news from specific category
fetch(`https://yourdomain.com/backend/public/news?api_key=${API_KEY}&category_id=1&page=1&per_page=20`)
  .then(res => res.json())
  .then(data => {
    console.log(data.news);
  });
```

---

## 3. Get Single News by Slug

**Endpoint:** `GET /public/news?slug={slug}`

**Query Parameters:**
- `slug` (required): News slug

**Response:**
```json
{
  "news": {
    "id": 1,
    "category_id": 1,
    "title": "Breaking Tech News",
    "slug": "breaking-tech-news",
    "short_desc_html": "<p>Short description...</p>",
    "full_desc_html": "<p>Full article content...</p>",
    "video_url": "https://youtube.com/...",
    "published": 1,
    "meta_title": "Breaking Tech News",
    "meta_description": "Latest tech updates",
    "meta_keywords": "tech, news, breaking",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00",
    "category_name": "Technology",
    "category_slug": "technology",
    "images": [
      {
        "id": 1,
        "path": "/uploads/news/news_abc123.jpg",
        "sort_order": 0
      },
      {
        "id": 2,
        "path": "/uploads/news/news_def456.jpg",
        "sort_order": 1
      }
    ]
  }
}
```

**Example Usage:**
```javascript
const API_KEY = 'your_api_key_here';

fetch(`https://yourdomain.com/backend/public/news?api_key=${API_KEY}&slug=breaking-tech-news`)
  .then(res => res.json())
  .then(data => {
    console.log(data.news);
    console.log(data.news.images);
  });
```

---

## 4. Get Site Settings

**Endpoint:** `GET /public/settings`

**Description:** Fetch site-wide settings including SEO defaults and social media links.

**Response:**
```json
{
  "settings": {
    "site_title": "My News Site",
    "domain": "https://mynewssite.com",
    "language": "en",
    "seo_default_title": "My News Site - Latest News",
    "seo_default_description": "Your source for latest news",
    "seo_default_keywords": "news, updates, articles",
    "social_links": {
      "facebook": "https://facebook.com/mypage",
      "twitter": "https://twitter.com/mypage",
      "instagram": "https://instagram.com/mypage",
      "youtube": "https://youtube.com/mychannel"
    }
  }
}
```

**Example Usage:**
```javascript
const API_KEY = 'your_api_key_here';

fetch(`https://yourdomain.com/backend/public/settings?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    document.title = data.settings.site_title;
    console.log(data.settings.social_links);
  });
```

---

## Complete Website Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Website</title>
</head>
<body>
    <div id="categories"></div>
    <div id="news-list"></div>

    <script>
        const API_BASE = 'https://yourdomain.com/backend';
        const API_KEY = 'your_api_key_here'; // Replace with your actual API key

        // Load categories
        async function loadCategories() {
            const res = await fetch(`${API_BASE}/public/categories?api_key=${API_KEY}`);
            const data = await res.json();
            
            const html = data.categories.map(cat => `
                <a href="/category/${cat.slug}">${cat.name}</a>
            `).join(' | ');
            
            document.getElementById('categories').innerHTML = html;
        }

        // Load news list
        async function loadNews(page = 1) {
            const res = await fetch(`${API_BASE}/public/news?api_key=${API_KEY}&page=${page}&per_page=10`);
            const data = await res.json();
            
            const html = data.news.map(news => `
                <article>
                    <h2><a href="/news/${news.slug}">${news.title}</a></h2>
                    ${news.image ? `<img src="${news.image}" alt="${news.title}">` : ''}
                    <div>${news.short_desc_html}</div>
                    <small>${news.category_name} - ${news.created_at}</small>
                </article>
            `).join('');
            
            document.getElementById('news-list').innerHTML = html;
        }

        // Load single news
        async function loadSingleNews(slug) {
            const res = await fetch(`${API_BASE}/public/news?api_key=${API_KEY}&slug=${slug}`);
            const data = await res.json();
            const news = data.news;
            
            document.title = news.meta_title || news.title;
            
            const html = `
                <article>
                    <h1>${news.title}</h1>
                    <div class="images">
                        ${news.images.map(img => `<img src="${img.path}" alt="${news.title}">`).join('')}
                    </div>
                    <div>${news.full_desc_html}</div>
                    ${news.video_url ? `<iframe src="${news.video_url}"></iframe>` : ''}
                </article>
            `;
            
            document.body.innerHTML = html;
        }

        // Initialize
        loadCategories();
        loadNews();
    </script>
</body>
</html>
```

---

## CORS Configuration (Important)

If your website is on a different domain than your admin panel, you need to enable CORS in your backend.

Add this to `/backend/lib/bootstrap.php` after `session_start()`:

```php
// Allow CORS for your website domain
$allowedOrigins = ['https://yourwebsite.com', 'https://www.yourwebsite.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
```

---

## Error Responses

All endpoints return JSON error responses with appropriate HTTP status codes:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `200` - Success
- `401` - Unauthorized (missing or invalid API key)
- `404` - Not found
- `422` - Validation error
- `500` - Server error

**Example - Missing API Key:**
```json
{
  "error": "Invalid or missing API key"
}
```

---

## Notes

1. **All public endpoints return only published news** (`published = 1`)
2. **Images are served from** `/uploads/news/` directory
3. **Slugs must be unique** - enforced by database
4. **Pagination is recommended** for news lists to improve performance
5. **SEO fields are optional** - if empty, use title/description as fallback

---

## Admin Panel Endpoints (Require Authentication)

These are for internal admin panel use only and require session authentication:

- `POST /backend/auth/login` - Login
- `POST /backend/auth/logout` - Logout
- `GET /backend/api/me` - Get current user
- `GET|POST|PUT|DELETE /backend/api/categories` - Manage categories
- `GET|POST|PUT|DELETE /backend/api/news` - Manage news
- `POST /backend/api/upload` - Upload images (400KB limit)
- `GET|PUT /backend/api/settings` - Manage settings
- `PUT /backend/api/profile` - Update profile
- `PUT /backend/api/profile/password` - Change password

---

## Support

For issues or questions, contact your administrator.
