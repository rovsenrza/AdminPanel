# Admin Panel - Content Management System

A modern, responsive admin panel built with HTML, CSS, Bootstrap, JavaScript, and various libraries. Designed based on the Sneat dashboard template with capsule-style isolated components.

## Features

### Categories Management
- Create, edit, and delete categories
- Hierarchical category structure (parent/child relationships)
- Drag-and-drop sorting functionality with SortableJS
- Visual organization with nested subcategories
- **Auto-generated slugs** from category names
- **Automatic slug uniqueness** with -1, -2 suffix for duplicates
- **SEO metatags**: Meta title, description, and keywords
- Category ID tracking for database relations

### News Management
- Complete CRUD operations for news articles
- Rich text editors for short and full descriptions (Quill.js)
- Multiple image upload with preview and **400KB size limit validation**
- Video support (URL and file upload)
- **Auto-generated slugs** from news titles
- **SEO optimization** with dedicated section:
  - Meta title (auto-uses news title if empty)
  - Meta description (auto-uses short description if empty)
  - Meta keywords (auto-extracted from content if empty)
  - Custom slug field
- Dynamic extra fields system:
  - Text inputs
  - Text areas
  - Switch toggles
  - Dropdown lists
  - Image uploads
  - File uploads (PDF, ZIP, RAR, etc.)
- Publish/unpublish functionality
- Category assignment with category ID relation

### Settings Page
- **General Settings**:
  - Site title (editable)
  - Site domain (editable)
  - Language selection (English, Azerbaijani, Russian, Turkish)
  - News per page for pagination (1-100)
  - Maintenance mode toggle
- **SEO Settings**:
  - Default meta title, description, keywords
  - Google Analytics ID
  - Google Search Console verification
- **Social Media**:
  - Facebook, Twitter, Instagram, YouTube URLs

### Profile Page
- Username management (required)
- Password change functionality with validation
- Email field (optional)
- Phone number field (optional)
- User avatar display

### UI/UX Features
- **Dark/Light Mode Toggle**: Persistent theme with localStorage
- **Collapsible Sidebar**: 
  - Purple close button for toggling
  - Shows only icons when collapsed
  - Smooth transitions
  - State persists across sessions
- **Isolated Capsule Design**:
  - Header and sidebar with 6px border radius
  - 15px spacing between components
  - Elevated, modern appearance
- **Active Menu Items**: Isolated with capsule style and shadow
- **Technical Support**: WhatsApp and Telegram icons in navbar
- **Responsive Design**: Mobile-friendly layout

### Design Elements (Based on Sneat Dashboard)

#### Colors
- Primary: `#696cff`
- Primary Hover: `#5f61e6`
- Success: `#71dd37`
- Danger: `#ff3e1d`
- Warning: `#ffab00`
- Info: `#03c3ec`
- Secondary: `#8592a3`
- Body Background: `#f5f5f9`
- **Dark Mode Colors**:
  - Body BG: `#2b2c40`
  - Card BG: `#312d4b`
  - Border: `#464564`
  - Text: `#b4b7bd`

#### Typography
- Font Family: 'Public Sans'
- Base Font Size: 0.9375rem (15px)
- Line Height: 1.53

#### Box Shadows
- Small: `0 2px 6px 0 rgba(67, 89, 113, 0.12)`
- Medium: `0 4px 8px -4px rgba(67, 89, 113, 0.2)`
- Large: `0 6px 20px 0 rgba(67, 89, 113, 0.15)`

#### Border Radius
- Default: `0.375rem`
- Small: `0.25rem`
- Large: `0.5rem`
- **Capsule: `6px`** (for isolated components)

## Project Structure

```
admin-panel/
├── index.html              # Dashboard homepage
├── categories.html         # Categories list with drag-drop
├── categories-add.html     # Add new category with SEO
├── news.html              # News list
├── news-add.html          # Add/edit news with all features
├── settings.html          # Site settings and configuration
├── profile.html           # User profile management
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet with dark mode
│   └── js/
│       ├── main.js        # Core functionality, dark mode, sidebar toggle
│       ├── categories.js  # Category management with slug generation
│       └── news.js        # News management with editors and SEO
└── README.md
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Bootstrap 5.3** - Responsive grid and components
- **Font Awesome 6.4** - Icons
- **Quill.js 2.0** - Rich text editor
- **SortableJS 1.15** - Drag-and-drop functionality
- **Google Fonts** - Public Sans font family

## Installation

1. Download or clone the project
2. Open `index.html` in a web browser
3. No build process required - pure HTML/CSS/JS

## Usage

### Categories
1. Navigate to **Categories > All Categories** to view and manage categories
2. Drag categories to reorder them using the grip handle
3. Click **Add Category** to create new categories
4. Enter category name - slug auto-generates (e.g., "Technology" → "technology")
5. If duplicate names exist, slug auto-adds suffix (e.g., "technology-1")
6. Fill in SEO fields: meta title, description, keywords
7. Assign parent categories to create hierarchical structure

### News
1. Navigate to **News > All News** to view all news articles
2. Click **Add News** to create a new article
3. Fill in the required fields:
   - **Title** (slug auto-generates)
   - **Category** (linked by category ID)
   - **Images**: Click + to add multiple (max 400KB each)
   - **Short description** (rich text editor)
   - **Full description** (rich text editor)
   - **Video**: URL or file upload
   - **Extra fields** (optional, dynamic)
4. Configure **SEO Settings**:
   - Meta title (auto-uses title if empty)
   - Meta description (auto-uses short desc if empty)
   - Meta keywords (auto-extracted if empty)
   - Custom slug
5. Toggle publish status
6. Click **Save News**

### Extra Fields
Extra fields allow you to add custom data to news articles:
- Click **Add Field** in the Extra Fields section
- Choose field type (text, textarea, switch, list, image, file)
- Enter field name and value
- Remove fields with the trash icon

### Settings
1. Navigate to **Settings** from the sidebar
2. Configure general settings (site title, domain, language, pagination)
3. Enable/disable maintenance mode
4. Set up SEO defaults and analytics
5. Add social media URLs
6. Click **Save Settings**

### Profile
1. Click user avatar or navigate to **Profile**
2. Update username, email, phone number
3. Change password with current password verification
4. Click **Update Profile** or **Change Password**

### Dark Mode
- Click the moon/sun icon in the navbar to toggle dark/light mode
- Theme preference is saved and persists across sessions

### Sidebar
- Click the purple close button (×) to collapse sidebar
- Collapsed sidebar shows only icons
- Click again (→) to expand
- State persists across page navigation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Backend Integration

This is a frontend template. To connect to your backend:

1. Update form submission handlers in `assets/js/news.js` and `assets/js/categories.js`
2. Replace `console.log()` calls with actual API requests
3. Implement authentication and authorization
4. Add data fetching for dynamic content

## Customization

### Colors
Edit CSS variables in `assets/css/style.css`:
```css
:root {
    --primary-color: #696cff;
    --success-color: #71dd37;
    /* ... other colors */
}
```

### Sidebar Menu
Edit the menu structure in each HTML file's sidebar section.

### Extra Field Types
Add new field types in the `updateExtraFieldInput()` function in `assets/js/news.js`.

## License

Free to use for personal and commercial projects.

## Credits

Design inspired by Sneat Bootstrap Admin Template by ThemeSelection.
