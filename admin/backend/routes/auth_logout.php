<?php

declare(strict_types=1);

require_method('POST');

logout();

header('Location: /login.html');
exit;
