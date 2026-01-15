<?php

declare(strict_types=1);

$uid = require_auth();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'PUT') {
    $payload = input_json();

    $stmt = db()->prepare('UPDATE users SET username=?, email=?, phone=? WHERE id=?');
    $stmt->execute([
        (string)($payload['username'] ?? ''),
        (string)($payload['email'] ?? ''),
        (string)($payload['phone'] ?? ''),
        $uid,
    ]);

    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
