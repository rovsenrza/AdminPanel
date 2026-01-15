<?php

declare(strict_types=1);

require_auth();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC')->fetchAll();
    json_response(['items' => $rows]);
}

$payload = input_json();

if ($method === 'POST') {
    $name = trim((string)($payload['name'] ?? ''));
    if ($name === '') json_response(['error' => 'name is required'], 422);

    $slug = trim((string)($payload['slug'] ?? ''));
    $parentId = isset($payload['parent_id']) ? (int)$payload['parent_id'] : null;

    $stmt = db()->prepare('INSERT INTO categories (parent_id, name, slug, description, meta_title, meta_description, meta_keywords, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $parentId ?: null,
        $name,
        $slug,
        (string)($payload['description'] ?? ''),
        (string)($payload['meta_title'] ?? ''),
        (string)($payload['meta_description'] ?? ''),
        (string)($payload['meta_keywords'] ?? ''),
        (int)($payload['sort_order'] ?? 0),
    ]);

    json_response(['id' => (int)db()->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'id is required'], 422);

    $stmt = db()->prepare('UPDATE categories SET parent_id=?, name=?, slug=?, description=?, meta_title=?, meta_description=?, meta_keywords=?, sort_order=? WHERE id=?');
    $stmt->execute([
        isset($payload['parent_id']) ? ((int)$payload['parent_id'] ?: null) : null,
        (string)($payload['name'] ?? ''),
        (string)($payload['slug'] ?? ''),
        (string)($payload['description'] ?? ''),
        (string)($payload['meta_title'] ?? ''),
        (string)($payload['meta_description'] ?? ''),
        (string)($payload['meta_keywords'] ?? ''),
        (int)($payload['sort_order'] ?? 0),
        $id,
    ]);

    json_response(['ok' => true]);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'id is required'], 422);

    $stmt = db()->prepare('DELETE FROM categories WHERE id=?');
    $stmt->execute([$id]);

    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
