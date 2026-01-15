<?php

declare(strict_types=1);

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $host = env_str('DB_HOST', DB_HOST);
    $name = env_str('DB_NAME', DB_NAME);
    $user = env_str('DB_USER', DB_USER);
    $pass = env_str('DB_PASS', DB_PASS);
    $port = env_int('DB_PORT', DB_PORT);

    if (!$host || !$name || !$user) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'Database is not configured',
            'hint' => 'Set DB_HOST, DB_NAME, DB_USER, DB_PASS env vars'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, (string)$pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}
