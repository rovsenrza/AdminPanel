<?php

declare(strict_types=1);

require_method('GET');
require_api_key();

$rows = db()->query('
    SELECT id, parent_id, name, slug, description, meta_title, meta_description, meta_keywords, sort_order
    FROM categories
    ORDER BY sort_order ASC, id ASC
')->fetchAll();

json_response(['categories' => $rows]);
