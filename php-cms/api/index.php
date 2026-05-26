<?php
// Start session for authentication
session_set_cookie_params([
    'lifetime' => 24 * 60 * 60,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

require_once __DIR__ . '/database.php';

// CORS (if needed for cross-origin, though proxy usually handles it)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize database and setup tables
initDatabase();
$db = getDb();

// Parse Request
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Remove '/api' prefix if present
if (strpos($requestUri, '/api') === 0) {
    $requestUri = substr($requestUri, 4);
}
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get JSON body
function getJsonBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Helper to respond as JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function requireAuth() {
    if (!isset($_SESSION['userId'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}

// Routes
if ($requestUri === '/auth/login' && $method === 'POST') {
    $body = getJsonBody();
    $username = $body['username'] ?? '';
    $password = $body['password'] ?? '';

    $stmt = $db->prepare('SELECT * FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    $_SESSION['userId'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    jsonResponse(['success' => true, 'user' => ['id' => $user['id'], 'username' => $user['username'], 'display_name' => $user['display_name']]]);
}

if ($requestUri === '/auth/logout' && $method === 'POST') {
    session_destroy();
    jsonResponse(['success' => true]);
}

if ($requestUri === '/auth/me' && $method === 'GET') {
    requireAuth();
    $stmt = $db->prepare('SELECT id, username, display_name, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['userId']]);
    $user = $stmt->fetch();
    jsonResponse(['user' => $user]);
}

if ($requestUri === '/auth/password' && $method === 'PUT') {
    requireAuth();
    $body = getJsonBody();
    $current_password = $body['current_password'] ?? '';
    $new_password = $body['new_password'] ?? '';

    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['userId']]);
    $user = $stmt->fetch();

    if (!password_verify($current_password, $user['password'])) {
        jsonResponse(['error' => 'Current password is incorrect'], 400);
    }

    $hashed = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt = $db->prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    $stmt->execute([$hashed, $user['id']]);
    jsonResponse(['success' => true]);
}

if ($requestUri === '/upload' && $method === 'POST') {
    requireAuth();
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['error' => 'No file uploaded or upload error'], 400);
    }
    
    $file = $_FILES['file'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];
    if (!in_array($file['type'], $allowedTypes)) {
        jsonResponse(['error' => 'Only images and videos allowed'], 400);
    }

    $uploadsDir = __DIR__ . '/../cms/uploads';
    if (!is_dir($uploadsDir) && is_dir(__DIR__ . '/../../cms')) {
        $uploadsDir = __DIR__ . '/../../cms/uploads';
    }
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '-' . mt_rand(100000, 999999) . '.' . $ext;
    $targetPath = $uploadsDir . '/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        jsonResponse(['url' => '/cms/uploads/' . $filename, 'filename' => $filename]);
    } else {
        jsonResponse(['error' => 'Failed to save file'], 500);
    }
}

// Dynamic CRUD matches
// e.g. /news, /projects, /news/1, /news/reorder, /news/1/toggle-publish
if (preg_match('#^/([a-zA-Z0-9_]+)(?:/([0-9]+|reorder))?(?:/(toggle-publish))?$#', $requestUri, $matches) && strpos($requestUri, '/public/') !== 0 && strpos($requestUri, '/dashboard/') !== 0 && $requestUri !== '/settings') {
    $tableName = $matches[1];
    $idOrAction = $matches[2] ?? null;
    $subAction = $matches[3] ?? null;

    $validTables = ['news', 'projects', 'careers', 'partners', 'hero_slides', 'services', 'timeline', 'team', 'company_values'];
    
    if (!in_array($tableName, $validTables)) {
        // Fallthrough if not a valid table
        goto CONTINUE_ROUTES;
    }
    
    requireAuth();

    // GET all
    if ($method === 'GET' && !$idOrAction) {
        $search = $_GET['search'] ?? null;
        $is_published = $_GET['is_published'] ?? null;
        $limit = $_GET['limit'] ?? null;
        $offset = $_GET['offset'] ?? null;

        // Determine search fields based on table (mirroring Node version)
        $searchFields = [];
        if ($tableName === 'news') $searchFields = ['title', 'excerpt', 'category'];
        if ($tableName === 'projects') $searchFields = ['title', 'description', 'category'];
        if ($tableName === 'careers') $searchFields = ['title', 'department', 'location'];
        if ($tableName === 'partners') $searchFields = ['name'];
        if ($tableName === 'hero_slides') $searchFields = ['title', 'subtitle'];
        if ($tableName === 'services') $searchFields = ['title', 'description', 'category'];
        if ($tableName === 'timeline') $searchFields = ['year', 'title', 'description'];
        if ($tableName === 'team') $searchFields = ['name', 'role', 'bio'];
        if ($tableName === 'company_values') $searchFields = ['title', 'description'];

        $query = "SELECT * FROM {$tableName}";
        $params = [];
        $conditions = [];

        if ($search && !empty($searchFields)) {
            $searchConds = array_map(function($f) { return "$f LIKE ?"; }, $searchFields);
            $conditions[] = "(" . implode(' OR ', $searchConds) . ")";
            foreach($searchFields as $f) {
                $params[] = "%$search%";
            }
        }

        if ($is_published !== null) {
            $conditions[] = "is_published = ?";
            $params[] = (int)$is_published;
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        $query .= " ORDER BY sort_order ASC, id DESC";

        if ($limit !== null) {
            $query .= " LIMIT ?";
            $params[] = (int)$limit;
            if ($offset !== null) {
                $query .= " OFFSET ?";
                $params[] = (int)$offset;
            }
        }

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        $totalStmt = $db->query("SELECT COUNT(*) FROM {$tableName}");
        $total = $totalStmt->fetchColumn();

        jsonResponse(['items' => $items, 'total' => $total]);
    }

    // CREATE
    if ($method === 'POST' && !$idOrAction) {
        $data = getJsonBody();
        $keys = array_keys($data);
        if (empty($keys)) jsonResponse(['error' => 'No data provided'], 400);
        
        $placeholders = implode(', ', array_fill(0, count($keys), '?'));
        $columns = implode(', ', $keys);
        
        $query = "INSERT INTO {$tableName} ({$columns}) VALUES ({$placeholders})";
        try {
            $stmt = $db->prepare($query);
            $stmt->execute(array_values($data));
            $newId = $db->lastInsertId();
            
            $stmt = $db->prepare("SELECT * FROM {$tableName} WHERE id = ?");
            $stmt->execute([$newId]);
            jsonResponse($stmt->fetch(), 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // REORDER
    if ($method === 'PUT' && $idOrAction === 'reorder') {
        $body = getJsonBody();
        $items = $body['items'] ?? [];
        $db->beginTransaction();
        $stmt = $db->prepare("UPDATE {$tableName} SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        foreach ($items as $item) {
            $stmt->execute([$item['sort_order'], $item['id']]);
        }
        $db->commit();
        jsonResponse(['success' => true]);
    }

    // TOGGLE PUBLISH
    if ($method === 'PATCH' && is_numeric($idOrAction) && $subAction === 'toggle-publish') {
        $stmt = $db->prepare("SELECT is_published FROM {$tableName} WHERE id = ?");
        $stmt->execute([$idOrAction]);
        $item = $stmt->fetch();
        if (!$item) jsonResponse(['error' => 'Not found'], 404);
        
        $newVal = $item['is_published'] ? 0 : 1;
        $stmt = $db->prepare("UPDATE {$tableName} SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newVal, $idOrAction]);
        jsonResponse(['success' => true, 'is_published' => $newVal]);
    }

    // GET one
    if ($method === 'GET' && is_numeric($idOrAction)) {
        $stmt = $db->prepare("SELECT * FROM {$tableName} WHERE id = ?");
        $stmt->execute([$idOrAction]);
        $item = $stmt->fetch();
        if (!$item) jsonResponse(['error' => 'Not found'], 404);
        jsonResponse($item);
    }

    // UPDATE
    if ($method === 'PUT' && is_numeric($idOrAction)) {
        $data = getJsonBody();
        $keys = array_keys($data);
        if (empty($keys)) jsonResponse(['error' => 'No data provided'], 400);

        $setClause = implode(', ', array_map(function($k) { return "$k = ?"; }, $keys));
        $values = array_values($data);
        $values[] = $idOrAction;

        try {
            $stmt = $db->prepare("UPDATE {$tableName} SET {$setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute($values);
            
            $stmt = $db->prepare("SELECT * FROM {$tableName} WHERE id = ?");
            $stmt->execute([$idOrAction]);
            jsonResponse($stmt->fetch());
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // DELETE
    if ($method === 'DELETE' && is_numeric($idOrAction)) {
        $stmt = $db->prepare("DELETE FROM {$tableName} WHERE id = ?");
        $stmt->execute([$idOrAction]);
        jsonResponse(['success' => true]);
    }
}
CONTINUE_ROUTES:

// Settings
if ($requestUri === '/settings') {
    requireAuth();
    if ($method === 'GET') {
        $category = $_GET['category'] ?? null;
        $query = 'SELECT * FROM settings';
        $params = [];
        if ($category) {
            $query .= ' WHERE category = ?';
            $params[] = $category;
        }
        $query .= ' ORDER BY category, key';
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        jsonResponse(['items' => $stmt->fetchAll()]);
    }
    if ($method === 'PUT') {
        $body = getJsonBody();
        $settings = $body['settings'] ?? [];
        $db->beginTransaction();
        $stmt = $db->prepare("UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?");
        foreach ($settings as $s) {
            $stmt->execute([$s['value'], $s['key']]);
        }
        $db->commit();
        jsonResponse(['success' => true]);
    }
}

// Dashboard stats
if ($requestUri === '/dashboard/stats' && $method === 'GET') {
    requireAuth();
    $stats = [];
    $tables = ['news', 'projects', 'careers', 'partners', 'hero_slides'];
    foreach ($tables as $t) {
        $stmt = $db->query("SELECT COUNT(*) as total, SUM(is_published) as published FROM {$t}");
        $res = $stmt->fetch();
        $stats[$t] = ['total' => (int)$res['total'], 'published' => (int)$res['published']];
    }
    jsonResponse($stats);
}

// Public API
if (strpos($requestUri, '/public/') === 0 && $method === 'GET') {
    $endpoint = substr($requestUri, 8);
    
    function getPublicItems($table, $extraCondition = '', $params = [], $order = 'sort_order ASC', $parseJsonFields = []) {
        global $db;
        $limit = $_GET['limit'] ?? null;
        $query = "SELECT * FROM {$table} WHERE is_published = 1 " . $extraCondition . " ORDER BY {$order}";
        if ($limit) {
            $query .= " LIMIT ?";
            $params[] = (int)$limit;
        }
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
        foreach ($items as &$i) {
            foreach ($parseJsonFields as $field) {
                if (!empty($i[$field])) $i[$field] = json_decode($i[$field], true);
            }
        }
        jsonResponse($items);
    }

    if ($endpoint === 'news') {
        $slug = $_GET['slug'] ?? null;
        if ($slug) {
            $stmt = $db->prepare("SELECT * FROM news WHERE slug = ? AND is_published = 1");
            $stmt->execute([$slug]);
            $item = $stmt->fetch();
            if ($item && !empty($item['gallery'])) $item['gallery'] = json_decode($item['gallery'], true);
            jsonResponse($item ?: null);
        } else {
            getPublicItems('news', '', [], 'sort_order ASC, date DESC', ['gallery']);
        }
    }

    if ($endpoint === 'projects') {
        $slug = $_GET['slug'] ?? null;
        $category = $_GET['category'] ?? null;
        $country = $_GET['country'] ?? null;
        
        if ($slug) {
            $stmt = $db->prepare("SELECT * FROM projects WHERE slug = ? AND is_published = 1");
            $stmt->execute([$slug]);
            $item = $stmt->fetch();
            if ($item && !empty($item['gallery'])) $item['gallery'] = json_decode($item['gallery'], true);
            jsonResponse($item ?: null);
        } else {
            $cond = ''; $params = [];
            if ($category) { $cond .= ' AND category = ?'; $params[] = $category; }
            if ($country) { $cond .= ' AND country = ?'; $params[] = $country; }
            getPublicItems('projects', $cond, $params, 'sort_order ASC', ['gallery']);
        }
    }

    if ($endpoint === 'careers') getPublicItems('careers');
    if ($endpoint === 'partners') getPublicItems('partners');
    if ($endpoint === 'hero') getPublicItems('hero_slides');
    if ($endpoint === 'services') {
        $category = $_GET['category'] ?? null;
        $cond = ''; $params = [];
        if ($category) { $cond .= ' AND category = ?'; $params[] = $category; }
        getPublicItems('services', $cond, $params, 'sort_order ASC', ['list_items']);
    }
    if ($endpoint === 'timeline') getPublicItems('timeline');
    if ($endpoint === 'team') getPublicItems('team');
    if ($endpoint === 'values') getPublicItems('company_values');
    
    if ($endpoint === 'settings') {
        $stmt = $db->query('SELECT key, value FROM settings');
        $items = $stmt->fetchAll();
        $obj = [];
        foreach ($items as $s) {
            $obj[$s['key']] = $s['value'];
        }
        jsonResponse($obj);
    }
}

// If no route matches
jsonResponse(['error' => 'API route not found'], 404);
