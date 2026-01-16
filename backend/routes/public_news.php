<?php

declare(strict_types=1);

require_method('GET');
require_api_key();

$fetch_images = function (int $newsId): array {
    $stmt = db()->prepare('SELECT id, path, sort_order, created_at FROM news_images WHERE news_id = ? ORDER BY sort_order ASC, id ASC');
    $stmt->execute([$newsId]);
    return $stmt->fetchAll();
};

$fetch_extra_fields = function (int $newsId): array {
    $stmt = db()->prepare('
        SELECT id, type, label, value_text, value_json, file_path, sort_order, created_at
        FROM news_extra_fields
        WHERE news_id = ?
        ORDER BY sort_order ASC, id ASC
    ');
    $stmt->execute([$newsId]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if (!empty($row['value_json'])) {
            $decoded = json_decode((string)$row['value_json'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $row['value_json'] = $decoded;
            }
        }
    }
    unset($row);
    return $rows;
};

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
    
    $newsId = (int)$news['id'];
    $news['images'] = $fetch_images($newsId);
    $news['extra_fields'] = $fetch_extra_fields($newsId);
    
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
    SELECT n.*, c.name as category_name, c.slug as category_slug
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
    $newsId = (int)$item['id'];
    $images = $fetch_images($newsId);
    $item['images'] = $images;
    $item['image'] = $images[0]['path'] ?? null;
    $item['extra_fields'] = $fetch_extra_fields($newsId);
}
unset($item);

json_response([
    'news' => $items,
    'pagination' => [
        'page' => $page,
        'per_page' => $perPage,
        'total' => $total,
        'total_pages' => ceil($total / $perPage)
    ]
]);
