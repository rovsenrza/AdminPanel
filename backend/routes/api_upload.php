<?php

declare(strict_types=1);

require_auth();
require_method('POST');

// Support both 'image' and 'file' field names
$file = $_FILES['image'] ?? $_FILES['file'] ?? null;

if (!$file) {
    json_response(['error' => 'No file uploaded'], 422);
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'Upload failed'], 500);
}

if ($file['size'] > MAX_UPLOAD_BYTES) {
    $maxKB = MAX_UPLOAD_BYTES / 1024;
    json_response(['error' => "File must be less than {$maxKB}KB"], 422);
}

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes, true)) {
    json_response(['error' => 'Invalid image type'], 422);
}

// Determine upload directory based on type
$type = $_POST['type'] ?? 'news';
switch ($type) {
    case 'logo':
        $subdir = 'logo';
        $prefix = 'logo_';
        break;
    case 'category':
        $subdir = 'categories';
        $prefix = 'cat_';
        break;
    default:
        $subdir = 'news';
        $prefix = 'news_';
}

$uploadDir = __DIR__ . '/../../uploads/' . $subdir;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid($prefix, true) . '.' . $ext;
$destination = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_response(['error' => 'Failed to save file'], 500);
}

$publicPath = '/uploads/' . $subdir . '/' . $filename;

json_response([
    'path' => $publicPath,
    'filename' => $filename
], 201);
