<?php

declare(strict_types=1);

function auth_user_id(): ?int {
    $id = $_SESSION['user_id'] ?? null;
    return is_int($id) ? $id : (is_string($id) ? (int)$id : null);
}

function require_auth(): int {
    $uid = auth_user_id();
    if (!$uid) {
        json_response(['error' => 'Unauthorized'], 401);
    }
    return $uid;
}

function login_with_email_password(string $email, string $password): ?array {
    $stmt = db()->prepare('SELECT id, username, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) return null;

    if (!password_verify($password, (string)$user['password_hash'])) {
        return null;
    }

    $_SESSION['user_id'] = (int)$user['id'];
    return [
        'id' => (int)$user['id'],
        'username' => (string)($user['username'] ?? ''),
        'email' => (string)($user['email'] ?? ''),
    ];
}

function logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function csrf_token(): string {
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(16));
    }
    return (string)$_SESSION['_csrf'];
}

function csrf_verify_or_fail(): void {
    $token = $_POST['_csrf'] ?? '';
    if (!is_string($token) || $token === '' || empty($_SESSION['_csrf']) || !hash_equals((string)$_SESSION['_csrf'], $token)) {
        json_response(['error' => 'Invalid CSRF token'], 419);
    }
}
