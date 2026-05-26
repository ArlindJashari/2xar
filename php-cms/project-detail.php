<?php
$title = "Project Detail - 2XAR";
$description = "2XAR public website and custom CMS";
$image = "/images/brand.svg";

if (isset($_GET['slug'])) {
    $slug = $_GET['slug'];
    try {
        $dbPath = __DIR__ . '/cms/cms.db';
        if (file_exists($dbPath)) {
            $pdo = new PDO('sqlite:' . $dbPath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE slug = ? LIMIT 1");
            $stmt->execute([$slug]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($project) {
                $title = $project['title'] . " - 2XAR";
                $description = strip_tags($project['description'] ?? '');
                if (strlen($description) > 160) {
                    $description = substr($description, 0, 157) . '...';
                }
                $image = $project['image'] ?? "/images/brand.svg";
                
                $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
                if ($image && strpos($image, 'http') !== 0) {
                    $image = $host . $image;
                }
            }
        }
    } catch (Exception $e) {
        // ignore
    }
}

// Load the compiled static HTML
$htmlPath = __DIR__ . '/project-detail.html';
if (!file_exists($htmlPath) && file_exists(__DIR__ . '/../project-detail.html')) {
    $htmlPath = __DIR__ . '/../project-detail.html';
}
if (file_exists($htmlPath)) {
    $html = file_get_contents($htmlPath);
    
    // Construct dynamic Open Graph tags
    $ogTags = "\n" . '    <!-- Dynamic SEO & Open Graph Tags -->
    <title>' . htmlspecialchars($title) . '</title>
    <meta name="description" content="' . htmlspecialchars($description) . '" />
    <meta property="og:title" content="' . htmlspecialchars($title) . '" />
    <meta property="og:description" content="' . htmlspecialchars($description) . '" />
    <meta property="og:image" content="' . htmlspecialchars($image) . '" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="' . htmlspecialchars((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']) . '" />
    <meta name="twitter:card" content="summary_large_image" />';
    
    // Replace the static title tag
    $html = preg_replace('/<title>.*?<\/title>/is', $ogTags, $html);
    
    echo $html;
} else {
    echo "Project page not found.";
}
?>
