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

function login_with_email_password(string $email, string $password, bool $remember = false): ?array {
    $stmt = db()->prepare('SELECT id, username, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) return null;

    if (!password_verify($password, (string)$user['password_hash'])) {
        return null;
    }

    $_SESSION['user_id'] = (int)$user['id'];
    
    if ($remember) {
        $token = bin2hex(random_bytes(32));
        $expiry = time() + (30 * 24 * 60 * 60); // 30 days
        
        $stmt = db()->prepare('UPDATE users SET remember_token = ?, remember_expiry = ? WHERE id = ?');
        $stmt->execute([$token, date('Y-m-d H:i:s', $expiry), (int)$user['id']]);
        
        setcookie('remember_token', $token, $expiry, '/', '', true, true);
    }
    
    return [
        'id' => (int)$user['id'],
        'username' => (string)($user['username'] ?? ''),
        'email' => (string)($user['email'] ?? ''),
    ];
}

function check_remember_token(): ?int {
    $token = $_COOKIE['remember_token'] ?? '';
    if ($token === '') return null;
    
    $stmt = db()->prepare('SELECT id FROM users WHERE remember_token = ? AND remember_expiry > NOW() LIMIT 1');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    
    if ($user) {
        $_SESSION['user_id'] = (int)$user['id'];
        return (int)$user['id'];
    }
    
    return null;
}

function logout(): void {
    $uid = auth_user_id();
    if ($uid) {
        $stmt = db()->prepare('UPDATE users SET remember_token = NULL, remember_expiry = NULL WHERE id = ?');
        $stmt->execute([$uid]);
    }
    
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    
    setcookie('remember_token', '', time() - 42000, '/', '', true, true);
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

function verify_api_key(): bool {
    $key = $_GET['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
    if ($key === '') return false;
    
    $stmt = db()->prepare('SELECT id FROM settings WHERE api_key = ? LIMIT 1');
    $stmt->execute([$key]);
    return (bool)$stmt->fetch();
}

function require_api_key(): void {
    if (!verify_api_key()) {
        json_response(['error' => 'Invalid or missing API key'], 401);
    }
}
