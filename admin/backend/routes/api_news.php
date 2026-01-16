<?php

declare(strict_types=1);

require_auth();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    // If ID is provided, fetch single news item
    if ($id > 0) {
        $stmt = db()->prepare('SELECT n.*, c.name as category_name FROM news n LEFT JOIN categories c ON n.category_id = c.id WHERE n.id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        
        if (!$row) {
            json_response(['error' => 'News not found'], 404);
        }
        
        // Attach images
        $imgStmt = db()->prepare('SELECT id, path, sort_order FROM news_images WHERE news_id = ? ORDER BY sort_order ASC');
        $imgStmt->execute([$id]);
        $row['images'] = $imgStmt->fetchAll();
        
        json_response(['item' => $row]);
    }
    
    // Otherwise, fetch all news items
    $rows = db()->query('SELECT n.*, c.name as category_name FROM news n LEFT JOIN categories c ON n.category_id = c.id ORDER BY n.id DESC')->fetchAll();
    
    // Attach images to each news item
    foreach ($rows as &$row) {
        $imgStmt = db()->prepare('SELECT id, path, sort_order FROM news_images WHERE news_id = ? ORDER BY sort_order ASC');
        $imgStmt->execute([$row['id']]);
        $row['images'] = $imgStmt->fetchAll();
    }
    
    json_response(['items' => $rows]);
}

$payload = input_json();

if ($method === 'POST') {
    $title = trim((string)($payload['title'] ?? ''));
    $categoryId = (int)($payload['category_id'] ?? 0);
    if ($title === '') json_response(['error' => 'title is required'], 422);
    if ($categoryId <= 0) json_response(['error' => 'category_id is required'], 422);

    $categoryIds = trim((string)($payload['category_ids'] ?? (string)$categoryId));
    
    $stmt = db()->prepare('INSERT INTO news (category_id, category_ids, title, slug, short_desc_html, full_desc_html, video_url, published, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $categoryId,
        $categoryIds,
        $title,
        (string)($payload['slug'] ?? ''),
        (string)($payload['short_desc_html'] ?? ''),
        (string)($payload['full_desc_html'] ?? ''),
        (string)($payload['video_url'] ?? ''),
        !empty($payload['published']) ? 1 : 0,
        (string)($payload['meta_title'] ?? ''),
        (string)($payload['meta_description'] ?? ''),
        (string)($payload['meta_keywords'] ?? ''),
    ]);

    json_response(['id' => (int)db()->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'id is required'], 422);

    $categoryId = (int)($payload['category_id'] ?? 0);
    $categoryIds = trim((string)($payload['category_ids'] ?? (string)$categoryId));
    
    $stmt = db()->prepare('UPDATE news SET category_id=?, category_ids=?, title=?, slug=?, short_desc_html=?, full_desc_html=?, video_url=?, published=?, meta_title=?, meta_description=?, meta_keywords=? WHERE id=?');
    $stmt->execute([
        $categoryId,
        $categoryIds,
        (string)($payload['title'] ?? ''),
        (string)($payload['slug'] ?? ''),
        (string)($payload['short_desc_html'] ?? ''),
        (string)($payload['full_desc_html'] ?? ''),
        (string)($payload['video_url'] ?? ''),
        !empty($payload['published']) ? 1 : 0,
        (string)($payload['meta_title'] ?? ''),
        (string)($payload['meta_description'] ?? ''),
        (string)($payload['meta_keywords'] ?? ''),
        $id,
    ]);

    json_response(['ok' => true]);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'id is required'], 422);

    $stmt = db()->prepare('DELETE FROM news WHERE id=?');
    $stmt->execute([$id]);

    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
