<?php

declare(strict_types=1);

// Configure via environment variables on hosting
// Example (cPanel): set in PHP environment or use .user.ini

const APP_ENV = 'production';

$dotenvPath = dirname(__DIR__) . '/.env';
if (is_file($dotenvPath) && is_readable($dotenvPath)) {
    $lines = file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (is_array($lines)) {
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) continue;
            $k = trim($parts[0]);
            $v = trim($parts[1]);
            if ($k === '') continue;
            if ((str_starts_with($v, '"') && str_ends_with($v, '"')) || (str_starts_with($v, "'") && str_ends_with($v, "'"))) {
                $v = substr($v, 1, -1);
            }
            if (getenv($k) === false) {
                putenv($k . '=' . $v);
                $_ENV[$k] = $v;
            }
        }
    }
}

function env_str(string $key, ?string $default = null): ?string {
    $val = getenv($key);
    if ($val === false) return $default;
    $val = trim((string)$val);
    return $val === '' ? $default : $val;
}

function env_int(string $key, int $default): int {
    $val = env_str($key);
    if ($val === null) return $default;
    return (int)$val;
}

// DB
const DB_HOST = null;
const DB_NAME = null;
const DB_USER = null;
const DB_PASS = null;
const DB_PORT = 3306;

// Security
const SESSION_NAME = 'adminpanel_session';
const MAX_UPLOAD_BYTES = 409600; // 400KB

// Optional: set these in environment
// DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT
