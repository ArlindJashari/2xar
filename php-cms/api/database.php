<?php

function getDb() {
    static $pdo = null;
    if ($pdo === null) {
        $dbPath = __DIR__ . '/../cms/cms.db';
        if (!file_exists($dbPath) && file_exists(__DIR__ . '/../../cms/cms.db')) {
            $dbPath = __DIR__ . '/../../cms/cms.db';
        }
        $pdo = new PDO('sqlite:' . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode = WAL;');
        $pdo->exec('PRAGMA foreign_keys = ON;');
    }
    return $pdo;
}

function initDatabase() {
    $db = getDb();

    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT NOT NULL DEFAULT 'Admin',
            role TEXT NOT NULL DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            excerpt TEXT,
            content TEXT,
            image TEXT,
            gallery TEXT DEFAULT '[]',
            category TEXT DEFAULT 'Announcement',
            location TEXT,
            date TEXT,
            is_published INTEGER DEFAULT 1,
            is_featured INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            full_content TEXT,
            image TEXT,
            gallery TEXT DEFAULT '[]',
            category TEXT DEFAULT 'Infrastructure',
            location TEXT,
            country TEXT,
            project_type TEXT,
            value TEXT,
            card_size TEXT DEFAULT 'small',
            status TEXT,
            scale TEXT,
            client TEXT,
            spec_steel TEXT,
            spec_concrete TEXT,
            spec_incidents TEXT,
            is_published INTEGER DEFAULT 1,
            is_featured INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS careers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            location TEXT DEFAULT 'Western Balkans',
            department TEXT DEFAULT 'Engineering',
            employment_type TEXT DEFAULT 'Full Time',
            overview TEXT,
            responsibilities TEXT,
            experience TEXT,
            qualifications TEXT,
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS partners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            logo TEXT,
            website TEXT,
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            type TEXT DEFAULT 'text',
            label TEXT,
            category TEXT DEFAULT 'general',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS hero_slides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            video_url TEXT,
            cta_text TEXT,
            cta_link TEXT,
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT DEFAULT 'Service',
            icon TEXT,
            image TEXT,
            description TEXT,
            list_items TEXT DEFAULT '[]',
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS timeline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            image TEXT,
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS team (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT,
            image TEXT,
            bio TEXT,
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS company_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            icon TEXT,
            description TEXT,
            is_published INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $countUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($countUsers == 0) {
        $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)");
        $stmt->execute(['admin', $hashedPassword, '2XAR Admin', 'admin']);
    }

    $countSettings = $db->query("SELECT COUNT(*) FROM settings")->fetchColumn();
    if ($countSettings == 0) {
        $defaultSettings = [
            ['site_name', '2XAR', 'text', 'Site Name', 'general'],
            ['stat_projects', '150+', 'text', 'Projects Stat', 'stats'],
            ['stat_experience', '25+', 'text', 'Experience Stat', 'stats'],
            ['stat_countries', '8+', 'text', 'Countries Stat', 'stats'],
            ['stat_partners', '50+', 'text', 'Partners Stat', 'stats'],
        ];
        $stmt = $db->prepare("INSERT INTO settings (key, value, type, label, category) VALUES (?, ?, ?, ?, ?)");
        foreach ($defaultSettings as $s) {
            $stmt->execute($s);
        }
    }

    $countPartners = $db->query("SELECT COUNT(*) FROM partners")->fetchColumn();
    if ($countPartners == 0) {
        $partners = [
            ['Guangxi Road Construction', '/images/partners/guangxi_road.jpg', 1],
            ['China Railway', '/images/partners/cr.png', 4]
        ];
        $stmt = $db->prepare("INSERT INTO partners (name, logo, sort_order) VALUES (?, ?, ?)");
        foreach ($partners as $p) {
            $stmt->execute($p);
        }
    }

    $countProjects = $db->query("SELECT COUNT(*) FROM projects")->fetchColumn();
    if ($countProjects == 0) {
        $projectItems = [
            [
                'title' => '2xAR Selected for Execution of Sunset Residential Project in Prishtina',
                'slug' => '2xar-selected-for-execution-of-sunset-residential-project-in-prishtina',
                'description' => '2xAR LLC has been selected for the execution of Sunset Residential, a premium residential development positioned at one of the most strategic urban gateways to Prishtina city centre, with construction scheduled to commence in August 2026.',
                'full_content' => '<h2>Residential & Urban Development</h2>
<p>PRISHTINA, KOSOVO — 2xAR LLC has been selected for the execution of Sunset Residential, a premium residential development positioned at one of the most strategic urban gateways to Prishtina city centre, with construction scheduled to commence in August 2026.</p>
<p>Designed by the internationally recognized studio Maden Architects, the project represents a modern architectural statement that combines contemporary design, functionality, and elevated urban living standards within the capital’s rapidly evolving skyline.</p>

<h2>A Landmark Residential Development</h2>
<p>Sunset Residential has been envisioned as more than a residential complex — it is designed as a high-end urban living concept focused on architectural quality, long-term value, and modern lifestyle integration.</p>
<p>The project will feature:</p>
<ul>
  <li>Contemporary residential units with panoramic city views</li>
  <li>Expansive terraces and open-air living spaces</li>
  <li>Premium façade systems and refined architectural detailing</li>
  <li>Integrated green areas and landscaped surroundings</li>
  <li>Modern underground parking and supporting infrastructure</li>
</ul>
<p>Located at the entrance to Prishtina city centre, the development offers direct access to key commercial and urban destinations while maintaining a strong residential character.</p>

<h2>Execution by 2xAR</h2>
<p>2xAR will lead the execution phase of the project, overseeing construction delivery, coordination, and implementation in alignment with the architectural vision developed by Maden Architects.</p>
<p>The company will apply advanced construction management practices and engineering standards to ensure quality, efficiency, and long-term structural performance throughout all phases of development.</p>
<blockquote class="article-quote">“This project reflects the type of modern urban developments that are shaping the future of Prishtina. Our focus will be on delivering a project defined by precision, quality, and execution excellence.”</blockquote>

<h2>Architectural Vision by Maden Architects</h2>
<p>The design concept emphasizes clean geometry, cascading upper levels, natural light, and a carefully balanced relationship between architecture and surrounding urban space.</p>
<p>The project’s structured façade composition and contemporary design language are intended to create a distinctive visual identity while maximizing comfort and functionality for residents.</p>

<h2>Building the Next Generation of Urban Living</h2>
<p>Construction is expected to begin in August 2026, with Sunset Residential positioned to become one of the most recognizable new residential developments at the entrance of Kosovo’s capital city.</p>
<p>The project further reinforces 2xAR’s growing presence in high-end residential and mixed-use developments across the region.</p>

<figure class="article-figure full-width">
  <img src="/cms/uploads/sunset-2.jpg" alt="Sunset Residential execution by 2xAR" class="article-content-img full-width-img">
</figure>',
                'image' => '/cms/uploads/sunset-1.jpg',
                'category' => 'Civil Engineering',
                'location' => 'Entrance to Prishtina city centre, Prishtina, Kosovo',
                'country' => 'kosovo',
                'project_type' => 'construction-management',
                'card_size' => 'small',
                'status' => 'Scheduled to commence in August 2026',
                'scale' => 'Premium Residential Development',
                'client' => 'Maden Architects',
                'spec_steel' => '', 'spec_concrete' => '', 'spec_incidents' => '',
                'sort_order' => 0
            ],
            [
                'title' => 'North Macedonia Highway', 
                'slug' => 'north-macedonia-highway', 
                'description' => 'Major transport hub connecting regions through visionary civil engineering.', 
                'full_content' => '<p>2XAR is leading the construction of a key expressway section in North Macedonia.</p>',
                'image' => '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841235472.png', 
                'category' => 'Infrastructure', 
                'location' => 'NORTH MACEDONIA', 
                'country' => 'macedonia', 
                'project_type' => 'design-build',
                'card_size' => 'featured', 
                'status' => 'Completed 2023',
                'scale' => '42km Expressway',
                'client' => 'National Roads Authority',
                'spec_steel' => '12k',
                'spec_concrete' => '45k',
                'spec_incidents' => '0',
                'sort_order' => 1 
            ],
            [
                'title' => 'Prishtina Business Hub', 
                'slug' => 'prishtina-business-hub', 
                'description' => 'Modern commercial complex in the heart of the capital.', 
                'full_content' => '<p>Prishtina Business Hub is a flagship commercial development designed to provide state-of-the-art office spaces.</p>',
                'image' => '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841227120.png', 
                'category' => 'Civil Engineering', 
                'location' => 'PRISHTINA, KOSOVO', 
                'country' => 'kosovo', 
                'project_type' => 'commercial',
                'card_size' => 'small', 
                'status' => 'In Progress', 
                'scale' => '15,000 m²', 
                'client' => 'Private Investor',
                'spec_steel' => '', 'spec_concrete' => '', 'spec_incidents' => '',
                'sort_order' => 2 
            ],
            [
                'title' => 'Regional Water Plant', 
                'slug' => 'regional-water-plant', 
                'description' => 'Advanced water treatment facility.', 
                'full_content' => '',
                'image' => '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841230737.png', 
                'category' => 'Environment', 
                'location' => 'KOSOVO', 
                'country' => 'kosovo', 
                'project_type' => 'infrastructure', 
                'card_size' => 'small', 
                'status' => '', 'scale' => '', 'client' => '', 'spec_steel' => '', 'spec_concrete' => '', 'spec_incidents' => '', 
                'sort_order' => 3
            ],
        ];

        $stmt = $db->prepare("
            INSERT INTO projects (title, slug, description, full_content, image, category, location, country, project_type, card_size, status, scale, client, spec_steel, spec_concrete, spec_incidents, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($projectItems as $item) {
            $stmt->execute([
                $item['title'], $item['slug'], $item['description'], $item['full_content'], $item['image'], $item['category'], $item['location'], $item['country'], $item['project_type'], $item['card_size'], $item['status'], $item['scale'], $item['client'], $item['spec_steel'], $item['spec_concrete'], $item['spec_incidents'], $item['sort_order']
            ]);
        }
    }
}
