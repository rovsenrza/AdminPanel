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
    $iconPaths = isset($payload['icon_paths']) ? json_encode($payload['icon_paths'], JSON_UNESCAPED_UNICODE) : null;

    $stmt = db()->prepare('INSERT INTO categories (parent_id, name, slug, description, icon_paths, meta_title, meta_description, meta_keywords, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $parentId ?: null,
        $name,
        $slug,
        (string)($payload['description'] ?? ''),
        $iconPaths,
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

    // Build dynamic update - only update provided fields
    $fields = [];
    $values = [];
    
    if (array_key_exists('parent_id', $payload)) {
        $fields[] = 'parent_id=?';
        $values[] = $payload['parent_id'] ? (int)$payload['parent_id'] : null;
    }
    if (array_key_exists('name', $payload)) {
        $fields[] = 'name=?';
        $values[] = (string)$payload['name'];
    }
    if (array_key_exists('slug', $payload)) {
        $fields[] = 'slug=?';
        $values[] = (string)$payload['slug'];
    }
    if (array_key_exists('description', $payload)) {
        $fields[] = 'description=?';
        $values[] = (string)$payload['description'];
    }
    if (array_key_exists('icon_paths', $payload)) {
        $fields[] = 'icon_paths=?';
        $values[] = $payload['icon_paths'] ? json_encode($payload['icon_paths'], JSON_UNESCAPED_UNICODE) : null;
    }
    if (array_key_exists('meta_title', $payload)) {
        $fields[] = 'meta_title=?';
        $values[] = (string)$payload['meta_title'];
    }
    if (array_key_exists('meta_description', $payload)) {
        $fields[] = 'meta_description=?';
        $values[] = (string)$payload['meta_description'];
    }
    if (array_key_exists('meta_keywords', $payload)) {
        $fields[] = 'meta_keywords=?';
        $values[] = (string)$payload['meta_keywords'];
    }
    if (array_key_exists('sort_order', $payload)) {
        $fields[] = 'sort_order=?';
        $values[] = (int)$payload['sort_order'];
    }
    
    if (empty($fields)) {
        json_response(['error' => 'No fields to update'], 422);
    }
    
    $values[] = $id;
    $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id=?';
    $stmt = db()->prepare($sql);
    $stmt->execute($values);

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
