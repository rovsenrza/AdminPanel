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

        // Generate API keys
        $apiKey = bin2hex(random_bytes(32));
        $apiSecret = bin2hex(random_bytes(32));

        // Ensure settings row with API keys
        $stmt = db()->prepare("INSERT INTO settings (id, site_title, domain, language, maintenance, news_per_page, api_key, api_secret) VALUES (1, 'Admin Panel', '', 'en', 0, 10, ?, ?) ON DUPLICATE KEY UPDATE api_key=VALUES(api_key), api_secret=VALUES(api_secret)");
        $stmt->execute([$apiKey, $apiSecret]);

        $_SESSION['api_key'] = $apiKey;
        $_SESSION['api_secret'] = $apiSecret;
        $_SESSION['install_complete'] = true;
    }
}

header('Content-Type: text/html; charset=utf-8');

$installComplete = $_SESSION['install_complete'] ?? false;
$displayApiKey = $_SESSION['api_key'] ?? '';
$displayApiSecret = $_SESSION['api_secret'] ?? '';
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
        <?php if ($installComplete): ?>
          <h4 class="mb-3 text-success">✓ Installation Complete!</h4>
          
          <div class="alert alert-success">
            <strong>Admin user created successfully!</strong>
          </div>

          <div class="alert alert-warning">
            <strong>⚠️ IMPORTANT: Save these API credentials!</strong><br>
            You will need these to access the public API from your website.
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">API Key (Public)</label>
            <div class="input-group">
              <input type="text" class="form-control font-monospace" value="<?php echo htmlspecialchars($displayApiKey, ENT_QUOTES, 'UTF-8'); ?>" readonly id="apiKeyInput">
              <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('apiKeyInput')">Copy</button>
            </div>
            <small class="text-muted">Use this in your website API requests</small>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">API Secret (Keep Private)</label>
            <div class="input-group">
              <input type="text" class="form-control font-monospace" value="<?php echo htmlspecialchars($displayApiSecret, ENT_QUOTES, 'UTF-8'); ?>" readonly id="apiSecretInput">
              <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('apiSecretInput')">Copy</button>
            </div>
            <small class="text-muted">Store this securely - it won't be shown again</small>
          </div>

          <hr class="my-4">

          <h6>Next Steps:</h6>
          <ol class="small">
            <li>Copy and save both API credentials above</li>
            <li>Delete <code>/backend/install.php</code> or remove <code>INSTALL_KEY</code> from environment</li>
            <li>Use the API Key in your website requests: <code>?api_key=YOUR_KEY</code></li>
            <li><a href="/login.html" class="btn btn-primary btn-sm">Go to Login Page</a></li>
          </ol>

          <script>
            function copyToClipboard(inputId) {
              const input = document.getElementById(inputId);
              input.select();
              document.execCommand('copy');
              alert('Copied to clipboard!');
            }
          </script>

        <?php else: ?>
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
        <?php endif; ?>
      </div>
    </div>
  </div>
</body>
</html>
