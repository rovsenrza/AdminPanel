<?php

declare(strict_types=1);

require __DIR__ . '/config.php';

// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-API-Key");

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (SESSION_NAME) {
    session_name(SESSION_NAME);
}
session_start();

require __DIR__ . '/db.php';
require __DIR__ . '/http.php';
require __DIR__ . '/auth.php';

// Auto-login via remember token if not authenticated
if (empty($_SESSION['user_id'])) {
    check_remember_token();
}
