<?php

declare(strict_types=1);

require_method('GET');

$row = db()->query('
    SELECT site_title, domain, language, seo_default_title, seo_default_description, seo_default_keywords, social_links_json
    FROM settings
    WHERE id = 1
')->fetch();

if ($row && $row['social_links_json']) {
    $row['social_links'] = json_decode($row['social_links_json'], true);
    unset($row['social_links_json']);
}

json_response(['settings' => $row ?: null]);
