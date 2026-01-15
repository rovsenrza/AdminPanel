<?php

declare(strict_types=1);

require_auth();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $row = db()->query('SELECT * FROM settings WHERE id = 1')->fetch();
    json_response(['settings' => $row ?: null]);
}

if ($method === 'PUT') {
    $payload = input_json();

    $stmt = db()->prepare('UPDATE settings SET site_title=?, domain=?, language=?, maintenance=?, news_per_page=?, seo_default_title=?, seo_default_description=?, seo_default_keywords=?, ga_id=?, gsc_verification=?, social_links_json=? WHERE id=1');
    $stmt->execute([
        (string)($payload['site_title'] ?? ''),
        (string)($payload['domain'] ?? ''),
        (string)($payload['language'] ?? 'en'),
        !empty($payload['maintenance']) ? 1 : 0,
        (int)($payload['news_per_page'] ?? 10),
        (string)($payload['seo_default_title'] ?? ''),
        (string)($payload['seo_default_description'] ?? ''),
        (string)($payload['seo_default_keywords'] ?? ''),
        (string)($payload['ga_id'] ?? ''),
        (string)($payload['gsc_verification'] ?? ''),
        json_encode($payload['social_links'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
    ]);

    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
