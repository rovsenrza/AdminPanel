<?php

declare(strict_types=1);

$uid = require_auth();

$stmt = db()->prepare('SELECT id, username, email, phone FROM users WHERE id = ?');
$stmt->execute([$uid]);
$user = $stmt->fetch();

json_response(['user' => $user ?: null]);
