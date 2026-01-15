<?php

declare(strict_types=1);

require_method('GET');

json_response(['csrf' => csrf_token()]);
