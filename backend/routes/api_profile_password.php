<?php

declare(strict_types=1);

$uid = require_auth();
require_method('PUT');

$payload = input_json();

$currentPassword = (string)($payload['current_password'] ?? '');
$newPassword = (string)($payload['new_password'] ?? '');

if ($currentPassword === '' || $newPassword === '') {
    json_response(['error' => 'Current and new password are required'], 422);
}

$stmt = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$uid]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPassword, (string)$user['password_hash'])) {
    json_response(['error' => 'Current password is incorrect'], 401);
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$stmt->execute([$newHash, $uid]);

json_response(['ok' => true]);
