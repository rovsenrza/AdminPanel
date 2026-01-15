<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Debug logging (remove in production)
error_log("Backend Router - Path: {$path}, Method: {$method}");

$base = '/backend';
if (str_starts_with($path, $base)) {
    $path = substr($path, strlen($base));
}
if ($path === '') {
    $path = '/';
}

error_log("Backend Router - After base strip: {$path}");

// Simple router
switch (true) {
    case $path === '/' && $method === 'GET':
        header('Content-Type: text/plain; charset=utf-8');
        echo "AdminPanel backend is running";
        break;

    case $path === '/auth/login' && $method === 'POST':
        require __DIR__ . '/routes/auth_login.php';
        break;

    case $path === '/auth/csrf' && $method === 'GET':
        require __DIR__ . '/routes/auth_csrf.php';
        break;

    case $path === '/auth/logout' && $method === 'POST':
        require __DIR__ . '/routes/auth_logout.php';
        break;

    case $path === '/api/me':
        require __DIR__ . '/routes/api_me.php';
        break;

    case $path === '/api/categories':
        require __DIR__ . '/routes/api_categories.php';
        break;

    case $path === '/api/news':
        require __DIR__ . '/routes/api_news.php';
        break;

    case $path === '/api/news/images':
        require __DIR__ . '/routes/api_news_images.php';
        break;

    case $path === '/api/settings':
        require __DIR__ . '/routes/api_settings.php';
        break;

    case $path === '/api/profile':
        require __DIR__ . '/routes/api_profile.php';
        break;

    case $path === '/api/profile/password':
        require __DIR__ . '/routes/api_profile_password.php';
        break;

    case $path === '/api/upload':
        require __DIR__ . '/routes/api_upload.php';
        break;

    // Public API endpoints (no auth required)
    case $path === '/public/categories':
        require __DIR__ . '/routes/public_categories.php';
        break;

    case $path === '/public/news':
        require __DIR__ . '/routes/public_news.php';
        break;

    case $path === '/public/settings':
        require __DIR__ . '/routes/public_settings.php';
        break;

    default:
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Not found', 'path' => $path], JSON_UNESCAPED_UNICODE);
        break;
}
