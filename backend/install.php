<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

// Safety: require an install key.
// Set INSTALL_KEY in hosting environment (or local) and open /backend/install.php?key=YOURKEY
$expected = env_str('INSTALL_KEY');
$key = $_GET['key'] ?? '';
if (!is_string($key)) $key = '';

if (!$expected || !hash_equals($expected, $key)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Forbidden. Set INSTALL_KEY env var and open /backend/install.php?key=...";
    exit;
}

$schemaFile = __DIR__ . '/database/schema.sql';
$schema = file_get_contents($schemaFile);
if ($schema === false) {
    http_response_code(500);
    echo "Could not read schema.sql";
    exit;
}

// Apply schema
try {
    db()->exec($schema);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Schema apply failed: " . $e->getMessage();
    exit;
}

// Create/update admin user
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string)($_POST['email'] ?? ''));
    $username = trim((string)($_POST['username'] ?? 'admin'));
    $password = (string)($_POST['password'] ?? '');

    if ($email === '' || $password === '') {
        $err = 'Email and password are required';
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = db()->prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE username=VALUES(username), password_hash=VALUES(password_hash)');
        $stmt->execute([$username, $email, $hash]);

        // Ensure settings row
        db()->exec("INSERT INTO settings (id, site_title, domain, language, maintenance, news_per_page) VALUES (1, 'Admin Panel', '', 'en', 0, 10) ON DUPLICATE KEY UPDATE id=id");

        header('Location: /login.html?installed=1');
        exit;
    }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AdminPanel Installer</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-5" style="max-width: 640px;">
    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="mb-3">AdminPanel Installer</h4>
        <p class="text-muted">Schema applied. Create/update the first admin user.</p>

        <?php if (!empty($err)): ?>
          <div class="alert alert-danger"><?php echo htmlspecialchars($err, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>

        <form method="POST">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input class="form-control" name="username" value="admin" />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input class="form-control" name="email" type="email" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input class="form-control" name="password" type="password" required />
          </div>
          <button class="btn btn-primary" type="submit">Create Admin User</button>
        </form>

        <hr class="my-4" />
        <div class="small text-muted">
          After finishing, delete <code>/backend/install.php</code> or remove <code>INSTALL_KEY</code>.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
