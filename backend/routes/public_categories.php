<?php

declare(strict_types=1);

require_method('GET');
require_api_key();

$rows = db()->query('
    SELECT id, parent_id, name, slug, description, icon_paths, meta_title, meta_description, meta_keywords,
           sort_order, created_at, updated_at
    FROM categories
    ORDER BY sort_order ASC, id ASC
')->fetchAll();

foreach ($rows as &$row) {
    if (!empty($row['icon_paths'])) {
        $decoded = json_decode((string)$row['icon_paths'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $row['icon_paths'] = $decoded;
        }
    }
}
unset($row);

json_response(['categories' => $rows]);
