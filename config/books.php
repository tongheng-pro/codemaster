<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Maximum PDF Upload Size
    |--------------------------------------------------------------------------
    |
    | The largest PDF (in megabytes) an admin can upload as a book. The web
    | server must allow it too: PHP's upload_max_filesize / post_max_size and
    | nginx's client_max_body_size have to be at least this large.
    |
    */

    'max_upload_mb' => (int) env('BOOK_MAX_UPLOAD_MB', 2048),

];
