<?php

declare(strict_types=1);

require_method('POST');

csrf_verify_or_fail();

$email = trim((string)($_POST['email'] ?? ''));
$password = (string)($_POST['password'] ?? '');
$remember = !empty($_POST['remember']);

if ($email === '' || $password === '') {
    // For HTML form submit, redirect back with query param
    header('Location: /login.html?error=1');
    exit;
}

$user = login_with_email_password($email, $password, $remember);
if (!$user) {
    header('Location: /login.html?error=1');
    exit;
}

header('Location: /index.html');
exit;
