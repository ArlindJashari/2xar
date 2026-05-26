<?php
// Local development router for PHP built-in server (php -S localhost:8000 router.php)

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/api/#', $uri)) {
    require __DIR__ . '/php-cms/api/index.php';
    return true;
}

if (preg_match('#^/cms/uploads/#', $uri)) {
    return false; // let the built-in server serve the image
}

if (preg_match('#^/project-detail\.html#', $uri)) {
    require __DIR__ . '/php-cms/project-detail.php';
    return true;
}

if (preg_match('#^/news-detail\.html#', $uri)) {
    require __DIR__ . '/php-cms/news-detail.php';
    return true;
}

if (preg_match('#^/admin#', $uri)) {
    $filePath = __DIR__ . '/cms' . $uri;
    if (is_file($filePath)) {
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'css' => 'text/css',
            'js'  => 'application/javascript',
            'png' => 'image/png',
            'svg' => 'image/svg+xml'
        ];
        if (isset($mimeTypes[$ext])) {
            header('Content-Type: ' . $mimeTypes[$ext]);
        }
        readfile($filePath);
        return true;
    }
    // serve the index.html for SPA fallback
    echo file_get_contents(__DIR__ . '/cms/admin/index.html');
    return true;
}

// Fallback for anything else (though Vite usually serves the rest)
return false;
