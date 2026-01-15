<?php

declare(strict_types=1);

require_auth();
require_method('POST');

if (empty($_FILES['image'])) {
    json_response(['error' => 'No image uploaded'], 422);
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'Upload failed'], 500);
}

if ($file['size'] > MAX_UPLOAD_BYTES) {
    $maxKB = MAX_UPLOAD_BYTES / 1024;
    json_response(['error' => "Image must be less than {$maxKB}KB"], 422);
}

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes, true)) {
    json_response(['error' => 'Invalid image type'], 422);
}

$uploadDir = __DIR__ . '/../../uploads/news';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('news_', true) . '.' . $ext;
$destination = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_response(['error' => 'Failed to save image'], 500);
}

$publicPath = '/uploads/news/' . $filename;

json_response([
    'path' => $publicPath,
    'filename' => $filename
], 201);
