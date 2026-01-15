-- AdminPanel schema (MySQL/MariaDB)

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  description TEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(255) NULL,
  meta_keywords VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  short_desc_html MEDIUMTEXT NULL,
  full_desc_html MEDIUMTEXT NULL,
  video_url VARCHAR(500) NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(255) NULL,
  meta_keywords VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_news_slug (slug),
  KEY idx_news_category (category_id),
  CONSTRAINT fk_news_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_images (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  news_id INT UNSIGNED NOT NULL,
  path VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_news_images_news (news_id),
  CONSTRAINT fk_news_images_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_extra_fields (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  news_id INT UNSIGNED NOT NULL,
  type VARCHAR(40) NOT NULL,
  label VARCHAR(190) NOT NULL,
  value_text MEDIUMTEXT NULL,
  value_json JSON NULL,
  file_path VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_news_extra_fields_news (news_id),
  CONSTRAINT fk_news_extra_fields_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  id TINYINT UNSIGNED NOT NULL,
  site_title VARCHAR(255) NULL,
  domain VARCHAR(255) NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  maintenance TINYINT(1) NOT NULL DEFAULT 0,
  news_per_page INT NOT NULL DEFAULT 10,
  seo_default_title VARCHAR(255) NULL,
  seo_default_description VARCHAR(255) NULL,
  seo_default_keywords VARCHAR(255) NULL,
  ga_id VARCHAR(100) NULL,
  gsc_verification VARCHAR(255) NULL,
  social_links_json JSON NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO settings (id, site_title, domain, language, maintenance, news_per_page)
VALUES (1, 'Admin Panel', '', 'en', 0, 10)
ON DUPLICATE KEY UPDATE id=id;

