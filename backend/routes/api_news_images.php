<?php

declare(strict_types=1);

require_auth();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'POST') {
    $payload = input_json();

    $newsId = (int)($payload['news_id'] ?? 0);
    $path = trim((string)($payload['path'] ?? ''));

    if ($newsId <= 0 || $path === '') {
        json_response(['error' => 'news_id and path are required'], 422);
    }

    $stmt = db()->prepare('INSERT INTO news_images (news_id, path, sort_order) VALUES (?, ?, ?)');
    $stmt->execute([$newsId, $path, (int)($payload['sort_order'] ?? 0)]);

    json_response(['id' => (int)db()->lastInsertId()], 201);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'id is required'], 422);

    $stmt = db()->prepare('DELETE FROM news_images WHERE id=?');
    $stmt->execute([$id]);

    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
