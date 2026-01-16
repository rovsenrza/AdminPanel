<?php

declare(strict_types=1);

require_method('GET');
require_api_key();

$slug = $_GET['slug'] ?? '';
$categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$perPage = isset($_GET['per_page']) ? max(1, min(100, (int)$_GET['per_page'])) : 10;

// Single news by slug
if ($slug !== '') {
    $stmt = db()->prepare('
        SELECT n.*, c.name as category_name, c.slug as category_slug
        FROM news n
        LEFT JOIN categories c ON n.category_id = c.id
        WHERE n.slug = ? AND n.published = 1
        LIMIT 1
    ');
    $stmt->execute([$slug]);
    $news = $stmt->fetch();
    
    if (!$news) {
        json_response(['error' => 'News not found'], 404);
    }
    
    // Fetch images
    $stmt = db()->prepare('SELECT id, path, sort_order FROM news_images WHERE news_id = ? ORDER BY sort_order ASC');
    $stmt->execute([(int)$news['id']]);
    $news['images'] = $stmt->fetchAll();
    
    json_response(['news' => $news]);
}

// List news with pagination
$where = ['n.published = 1'];
$params = [];

if ($categoryId) {
    $where[] = 'n.category_id = ?';
    $params[] = $categoryId;
}

$whereClause = implode(' AND ', $where);
$offset = ($page - 1) * $perPage;

$stmt = db()->prepare("
    SELECT n.id, n.category_id, n.title, n.slug, n.short_desc_html, n.video_url, n.meta_title, n.meta_description, n.created_at,
           c.name as category_name, c.slug as category_slug
    FROM news n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE {$whereClause}
    ORDER BY n.created_at DESC
    LIMIT {$perPage} OFFSET {$offset}
");
$stmt->execute($params);
$items = $stmt->fetchAll();

// Get total count
$stmt = db()->prepare("SELECT COUNT(*) as total FROM news n WHERE {$whereClause}");
$stmt->execute($params);
$total = (int)$stmt->fetch()['total'];

// Fetch first image for each news
foreach ($items as &$item) {
    $stmt = db()->prepare('SELECT path FROM news_images WHERE news_id = ? ORDER BY sort_order ASC LIMIT 1');
    $stmt->execute([(int)$item['id']]);
    $img = $stmt->fetch();
    $item['image'] = $img ? $img['path'] : null;
}

json_response([
    'news' => $items,
    'pagination' => [
        'page' => $page,
        'per_page' => $perPage,
        'total' => $total,
        'total_pages' => ceil($total / $perPage)
    ]
]);
