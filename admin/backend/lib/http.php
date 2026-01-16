<?php

declare(strict_types=1);

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function require_method(string $method): void {
    $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if ($m !== strtoupper($method)) {
        json_response(['error' => 'Method not allowed'], 405);
    }
}

function input_json(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function post_str(string $key, string $default = ''): string {
    $val = $_POST[$key] ?? $default;
    return is_string($val) ? trim($val) : $default;
}
