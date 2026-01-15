<?php

declare(strict_types=1);

require __DIR__ . '/config.php';

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
