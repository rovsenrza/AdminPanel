<?php

declare(strict_types=1);

require_method('GET');
require_api_key();

$row = db()->query('
    SELECT site_title, domain, logo_path, language, news_per_page, maintenance,
           seo_default_title, seo_default_description, seo_default_keywords,
           ga_id, gsc_verification, social_links_json, telegram_link, whatsapp_number, api_key,
           created_at, updated_at
    FROM settings
    WHERE id = 1
')->fetch();

if ($row && $row['social_links_json']) {
    $row['social_links'] = json_decode($row['social_links_json'], true);
    unset($row['social_links_json']);
}

json_response(['settings' => $row ?: null]);
