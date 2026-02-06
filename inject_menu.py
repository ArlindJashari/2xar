
import os
import re

files = ["index.html", "about.html", "contact.html", "project-detail.html", "projects.html"]
base_dir = "/Users/arlindjashari/Desktop/web-kusha"

mobile_menu_html = """
      <button class="menu-toggle" aria-label="Toggle Menu">
        <i class="ph ph-list"></i>
      </button>
      
      <div class="mobile-menu-overlay">
        <div class="mobile-menu-header">
             <div class="brand-logo item-nav">
                <a href="index.html">
                  <img src="/images/brand.svg" alt="2XAR Logo" class="brand-svg">
                </a>
             </div>
            <button class="close-menu" aria-label="Close Menu"><i class="ph ph-x"></i></button>
        </div>
        <nav class="mobile-nav-links">
            <a href="index.html">Home</a>
            <a href="about.html">Company</a>
            <a href="#">Sectors</a>
            <a href="projects.html">Projects</a>
            <a href="contact.html">Contact</a>
        </nav>
      </div>
"""

for fname in files:
    path = os.path.join(base_dir, fname)
    if not os.path.exists(path):
        print(f"Skipping {fname} (not found)")
        continue
        
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if already injected
    if "mobile-menu-overlay" in content:
        print(f"Skipping {fname} (already injected)")
        continue
        
    # Inject after the hero-nav closing tag
    # We look for </nav> inside top-bar-inner
    # simpler: find </nav> and append after it, assuming it's the hero-nav
    
    new_content = re.sub(r'(</nav>)', r'\1' + mobile_menu_html, content, count=1)
    
    if content != new_content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {fname}")
    else:
        print(f"Could not update {fname}")
