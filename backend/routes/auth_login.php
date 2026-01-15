<?php

declare(strict_types=1);

require_method('POST');

csrf_verify_or_fail();

$email = post_str('email');
$password = post_str('password');

if ($email === '' || $password === '') {
    // For HTML form submit, redirect back with query param
    header('Location: /login.html?error=1');
    exit;
}

$user = login_with_email_password($email, $password);
if (!$user) {
    header('Location: /login.html?error=1');
    exit;
}

header('Location: /index.html');
exit;
