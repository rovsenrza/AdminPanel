<?php

declare(strict_types=1);

require_auth();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM news ORDER BY id DESC')->fetchAll();
    json_response(['items' => $rows]);
}

$payload = input_json();

if ($method === 'POST') {
    $title = trim((string)($payload['title'] ?? ''));
    $categoryId = (int)($payload['category_id'] ?? 0);
    if ($title === '') json_response(['error' => 'title is required'], 422);
    if ($categoryId <= 0) json_response(['error' => 'category_id is required'], 422);

    $stmt = db()->prepare('INSERT INTO news (category_id, title, slug, short_desc_html, full_desc_html, video_url, published, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $categoryId,
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

    $stmt = db()->prepare('UPDATE news SET category_id=?, title=?, slug=?, short_desc_html=?, full_desc_html=?, video_url=?, published=?, meta_title=?, meta_description=?, meta_keywords=? WHERE id=?');
    $stmt->execute([
        (int)($payload['category_id'] ?? 0),
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
