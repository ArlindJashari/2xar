// ── 2XAR CMS Admin Panel ─────────────────────────────────
const API = '/api';
let currentSection = 'dashboard';
let editingId = null;
let deleteCallback = null;

// ── API Helper ───────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 && !path.includes('/auth/')) {
    showLogin();
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/upload`, { method: 'POST', body: fd, credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// ── Toast ────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => el.className = 'toast', 3000);
}

// ── Auth ─────────────────────────────────────────────────
function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';
}

function showApp(user) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  document.getElementById('currentUser').textContent = user.display_name || user.username;
  navigateTo('dashboard');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: {
        username: document.getElementById('loginUsername').value,
        password: document.getElementById('loginPassword').value,
      }
    });
    showApp(data.user);
  } catch (err) {
    errEl.textContent = err.message || 'Invalid credentials';
    errEl.style.display = 'block';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' });
  showLogin();
});

// Check session on load
(async () => {
  try {
    const data = await api('/auth/me');
    showApp(data.user);
  } catch { showLogin(); }
})();

// ── Navigation ───────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.section);
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function navigateTo(section) {
  currentSection = section;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
  document.getElementById('pageTitle').textContent = sectionTitles[section] || section;
  editingId = null;
  renderSection(section);
}

const sectionTitles = {
  dashboard: 'Dashboard',
  news: 'News & Insights',
  projects: 'Projects',
  services: 'Services & Sectors',
  careers: 'Careers',
  partners: 'Partners',
  hero_slides: 'Hero Slides',
  timeline: 'Timeline',
  team: 'Leadership Team',
  company_values: 'Company Values',
  settings: 'Site Settings',
};

// ── Delete Modal ─────────────────────────────────────────
function openDeleteModal(cb) {
  deleteCallback = cb;
  document.getElementById('deleteModal').style.display = 'flex';
}
function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
  deleteCallback = null;
}
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (deleteCallback) await deleteCallback();
  closeDeleteModal();
});
window.closeDeleteModal = closeDeleteModal;

// ── Render Sections ──────────────────────────────────────
async function renderSection(section) {
  const area = document.getElementById('contentArea');
  if (section === 'dashboard') return renderDashboard(area);
  if (section === 'settings') return renderSettings(area);
  return renderCRUD(area, section);
}

// ── Dashboard ────────────────────────────────────────────
async function renderDashboard(area) {
  const stats = await api('/dashboard/stats');
  const icons = { news: 'newspaper', projects: 'buildings', careers: 'briefcase', partners: 'handshake', hero_slides: 'monitor-play' };
  const labels = { news: 'News Articles', projects: 'Projects', careers: 'Job Openings', partners: 'Partners', hero_slides: 'Hero Slides' };
  area.innerHTML = `
    <div class="stats-grid">
      ${Object.entries(stats).map(([key, val]) => `
        <div class="stat-card" style="cursor:pointer" onclick="navigateTo('${key}')">
          <div class="stat-card-icon gold"><i class="ph ph-${icons[key]}"></i></div>
          <h3>${val.total}</h3>
          <p>${labels[key]} <span style="color:var(--success);font-size:.8rem">(${val.published || 0} published)</span></p>
        </div>
      `).join('')}
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:32px;">
      <h3 style="margin-bottom:12px;font-size:1.1rem;">Quick Actions</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="navigateTo('news');setTimeout(()=>startCreate('news'),100)"><i class="ph ph-plus"></i> New Article</button>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('projects');setTimeout(()=>startCreate('projects'),100)"><i class="ph ph-plus"></i> New Project</button>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('careers');setTimeout(()=>startCreate('careers'),100)"><i class="ph ph-plus"></i> New Job</button>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('partners');setTimeout(()=>startCreate('partners'),100)"><i class="ph ph-plus"></i> New Partner</button>
      </div>
    </div>`;
}
window.navigateTo = navigateTo;

// ── CRUD Section Config ──────────────────────────────────
const crudConfig = {
  news: {
    columns: ['image', 'title', 'category', 'date', 'is_published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true, description: 'URL-friendly identifier. Automatically generated from Title.' },
      { key: 'category', label: 'Category', type: 'select', options: ['Announcement', 'Building', 'Infrastructure', 'Environmental', 'Water & Environment', 'Press Release'] },
      { key: 'date', label: 'Date', type: 'date', description: 'Publishing date displayed on the article page.' },
      { key: 'location', label: 'Location', type: 'text', description: 'Geographic location associated with the news (e.g., PRISHTINA, KOSOVO).' },
      { key: 'image', label: 'Main Image', type: 'image', description: 'The cover banner image of the article.' },
      { key: 'gallery', label: 'Gallery Images (Upload multiple)', type: 'gallery', description: 'Additional showcase images appearing in the gallery grid below the content.' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', description: 'A short engaging summary of the article shown on the news listing grid.' },
      { key: 'content', label: 'Full Content', type: 'textarea', description: 'Build and style your article visually. Arrange paragraphs, quotes, subheadings, and images in any layout order.' },
      { key: 'is_published', label: 'Published', type: 'checkbox', description: 'Controls visibility on the live site. Unchecked articles are saved as drafts.' },
      { key: 'is_featured', label: 'Featured', type: 'checkbox', description: 'Highlights this article prominently at the top of the news section.' },
      { key: 'sync_to_projects', label: 'Add/Sync this to Projects also', type: 'checkbox', description: 'Automatically cross-posts or updates this news article in your Projects page.' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', description: 'Numeric rank. Lower numbers appear first.' },
    ]
  },
  projects: {
    columns: ['image', 'title', 'category', 'location', 'is_published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true, description: 'URL-friendly name used in the address bar.' },
      { key: 'category', label: 'Category', type: 'select', options: ['Building', 'Infrastructure', 'Civil Engineering', 'Environment', 'Urban Planning', 'Water & Environment', 'Site Inspection', 'Public Relations', 'Energy'] },
      { key: 'location', label: 'Location', type: 'text', description: 'Exact city or region of the worksite.' },
      { key: 'country', label: 'Country', type: 'select', options: ['', 'kosovo', 'albania', 'macedonia', 'montenegro', 'bosnia', 'serbia'] },
      { key: 'project_type', label: 'Project Type', type: 'select', options: ['', 'design-build', 'epc', 'construction-management', 'turnkey'], description: 'Contract framework style.' },
      { key: 'status', label: 'Status (e.g. Completed 2023)', type: 'text', description: 'Current progress statement.' },
      { key: 'scale', label: 'Scale (e.g. 800m Span)', type: 'text', description: 'Scope parameters.' },
      { key: 'client', label: 'Client', type: 'text', description: 'The purchasing organization or entity.' },
      { key: 'spec_steel', label: 'Spec: Steel Tons', type: 'text', description: 'Total metric tons of steel used.' },
      { key: 'spec_concrete', label: 'Spec: Concrete m³', type: 'text', description: 'Total cubic meters of concrete poured.' },
      { key: 'spec_incidents', label: 'Spec: Safety Incidents', type: 'text', description: 'Count of active HSE recordable safety events.' },
      { key: 'card_size', label: 'Card Size', type: 'select', options: ['small', 'featured', 'landscape'], description: 'Grid footprint visual size on the projects page.' },
      { key: 'value', label: 'Project Value', type: 'text', description: 'Total contracted financial cost in Millions (e.g. €140M).' },
      { key: 'image', label: 'Main Image', type: 'image', description: 'Primary showcase banner image.' },
      { key: 'gallery', label: 'Gallery Images (Upload multiple)', type: 'gallery', description: 'Visual showcase gallery items.' },
      { key: 'description', label: 'Short Description', type: 'textarea', description: 'Short introductory abstract.' },
      { key: 'full_content', label: 'Full Content', type: 'textarea', description: 'Visually layout the project profile details.' },
      { key: 'is_published', label: 'Published', type: 'checkbox', description: 'Toggles global visibility in your public catalog.' },
      { key: 'is_featured', label: 'Featured', type: 'checkbox', description: 'Showcases this masterpiece on the landing page.' },
      { key: 'sync_to_news', label: 'Add/Sync this to News also', type: 'checkbox', description: 'Automatically cross-posts or updates this project in your News & Insights section.' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', description: 'Controls ordering position in catalog listings.' },
    ]
  },
  careers: {
    columns: ['title', 'department', 'location', 'is_published'],
    fields: [
      { key: 'title', label: 'Job Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'department', label: 'Department', type: 'select', options: ['Engineering', 'Management', 'Finance', 'Environmental', 'HSE', 'Site Management'] },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'employment_type', label: 'Type', type: 'select', options: ['Full Time', 'Part Time', 'Contract', 'Internship'] },
      { key: 'overview', label: 'Role Overview', type: 'textarea' },
      { key: 'responsibilities', label: 'Responsibilities (one per line)', type: 'textarea' },
      { key: 'experience', label: 'Experience (one per line)', type: 'textarea' },
      { key: 'qualifications', label: 'Qualifications (one per line)', type: 'textarea' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  partners: {
    columns: ['logo', 'name', 'is_published'],
    fields: [
      { key: 'name', label: 'Partner Name', type: 'text', required: true },
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'website', label: 'Website', type: 'text' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  hero_slides: {
    columns: ['title', 'subtitle', 'is_published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'video_url', label: 'Video URL', type: 'text' },
      { key: 'cta_text', label: 'CTA Button Text', type: 'text' },
      { key: 'cta_link', label: 'CTA Link', type: 'text' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  services: {
    columns: ['image', 'title', 'category', 'is_published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Service', 'Sector'] },
      { key: 'icon', label: 'Phosphor Icon Class (e.g. buildings)', type: 'text' },
      { key: 'image', label: 'Background Image', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'list_items', label: 'Bullet Points (One per line)', type: 'json_array' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  timeline: {
    columns: ['year', 'title', 'is_published'],
    fields: [
      { key: 'year', label: 'Year', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  team: {
    columns: ['image', 'name', 'role', 'is_published'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'bio', label: 'Biography', type: 'textarea' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  company_values: {
    columns: ['icon', 'title', 'is_published'],
    fields: [
      { key: 'title', label: 'Value Title', type: 'text', required: true },
      { key: 'icon', label: 'Phosphor Icon Class (e.g. star)', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
};

// ── Slug Generator ───────────────────────────────────────
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── CRUD List View ───────────────────────────────────────
async function renderCRUD(area, section) {
  const config = crudConfig[section];
  const data = await api(`/${section}`);
  const items = data.items || [];

  area.innerHTML = `
    <div class="table-header">
      <div class="table-search">
        <i class="ph ph-magnifying-glass"></i>
        <input type="text" id="searchInput" placeholder="Search..." value="">
      </div>
      <button class="btn btn-primary" id="createBtn"><i class="ph ph-plus"></i> Add New</button>
    </div>
    <div id="listView">
      ${renderTable(items, config, section)}
    </div>
    <div id="editorView" style="display:none;"></div>`;

  document.getElementById('createBtn').addEventListener('click', () => startCreate(section));
  document.getElementById('searchInput').addEventListener('input', async (e) => {
    const q = e.target.value;
    const result = await api(`/${section}?search=${encodeURIComponent(q)}`);
    document.getElementById('listView').innerHTML = renderTable(result.items || [], config, section);
    bindTableActions(section);
  });
  bindTableActions(section);
}

function renderTable(items, config, section) {
  if (items.length === 0) {
    return `<div class="empty-state"><i class="ph ph-folder-open"></i><p>No items found. Create your first one!</p></div>`;
  }
  const colLabels = { image: 'Image', logo: 'Logo', title: 'Title', name: 'Name', category: 'Category', date: 'Date', location: 'Location', department: 'Dept.', subtitle: 'Subtitle', role: 'Role', year: 'Year', icon: 'Icon', is_published: 'Status' };
  return `<div class="table-wrapper"><table class="data-table">
    <thead><tr>${config.columns.map(c => `<th>${colLabels[c] || c}</th>`).join('')}<th>Actions</th></tr></thead>
    <tbody>${items.map(item => `<tr data-id="${item.id}">
      ${config.columns.map(c => {
        if (c === 'image' || c === 'logo') return `<td>${item[c] ? `<img src="${item[c]}" class="table-img" onerror="this.style.display='none'">` : '—'}</td>`;
        if (c === 'is_published') return `<td><span class="badge ${item[c] ? 'badge-published' : 'badge-draft'}">${item[c] ? 'Published' : 'Draft'}</span></td>`;
        if (c === 'category' || c === 'department') return `<td><span class="badge badge-category">${item[c] || '—'}</span></td>`;
        return `<td>${item[c] || '—'}</td>`;
      }).join('')}
      <td><div class="table-actions">
        <button class="btn-icon edit-btn" data-id="${item.id}" title="Edit"><i class="ph ph-pencil-simple"></i></button>
        <button class="btn-icon toggle-btn" data-id="${item.id}" title="Toggle Publish"><i class="ph ph-${item.is_published ? 'eye' : 'eye-slash'}"></i></button>
        <button class="btn-icon delete-btn" data-id="${item.id}" title="Delete" style="color:var(--danger)"><i class="ph ph-trash"></i></button>
      </div></td>
    </tr>`).join('')}</tbody></table></div>`;
}

function bindTableActions(section) {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => startEdit(section, parseInt(btn.dataset.id));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      openDeleteModal(async () => {
        await api(`/${section}/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Item deleted');
        renderCRUD(document.getElementById('contentArea'), section);
      });
    };
  });
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.onclick = async () => {
      await api(`/${section}/${btn.dataset.id}/toggle-publish`, { method: 'PATCH' });
      toast('Status updated');
      renderCRUD(document.getElementById('contentArea'), section);
    };
  });
}

// ── CRUD Editor ──────────────────────────────────────────
async function startCreate(section) {
  editingId = null;
  renderEditor(section, {});
}
window.startCreate = startCreate;

async function startEdit(section, id) {
  const item = await api(`/${section}/${id}`);
  editingId = id;
  renderEditor(section, item);
}

function renderEditor(section, data) {
  const config = crudConfig[section];
  const isNew = !editingId;
  const listView = document.getElementById('listView');
  const editorView = document.getElementById('editorView');
  const createBtn = document.getElementById('createBtn');
  const searchEl = document.querySelector('.table-search');

  listView.style.display = 'none';
  editorView.style.display = 'block';
  if (createBtn) createBtn.style.display = 'none';
  if (searchEl) searchEl.style.display = 'none';

  editorView.innerHTML = `
    <div class="editor-panel">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button class="btn-icon" id="backBtn"><i class="ph ph-arrow-left"></i></button>
        <h3 style="margin:0;border:none;padding:0">${isNew ? 'Create New' : 'Edit'} Item</h3>
      </div>
      <form id="editorForm">
        ${config.fields.map(f => renderField(f, data)).join('')}
        <div class="editor-actions">
          <button type="submit" class="btn btn-primary"><i class="ph ph-check"></i> ${isNew ? 'Create' : 'Save Changes'}</button>
          <button type="button" class="btn btn-ghost" id="cancelBtn">Cancel</button>
        </div>
      </form>
    </div>`;

  // Initialize visual block builders
  initBlockBuilders(section, data);

  // Auto-slug from title/name
  const titleInput = editorView.querySelector('[name="title"]') || editorView.querySelector('[name="name"]');
  const slugInput = editorView.querySelector('[name="slug"]');
  if (titleInput && slugInput && isNew) {
    titleInput.addEventListener('input', () => { slugInput.value = toSlug(titleInput.value); });
  }

  // Image upload handlers
  editorView.querySelectorAll('.image-upload-zone input[type=file][data-field]').forEach(input => {
    const setupListener = (inp) => {
      inp.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const zone = inp.closest('.image-upload-zone');
        zone.innerHTML = '<p>Uploading...</p>';
        try {
          const result = await uploadFile(file);
          // Set value to all matching inputs
          document.querySelectorAll(`[name="${inp.dataset.field}"]`).forEach(el => {
            el.value = result.url;
          });
          // Update external preview image
          const img = document.getElementById(`preview-${inp.dataset.field}`);
          if (img) {
            img.src = result.url;
            img.style.display = 'block';
          }
          // Restore upload zone to pristine state
          zone.innerHTML = `<i class="ph ph-upload-simple"></i><p>Click or drag to upload</p><input type="file" accept="image/*,video/*" data-field="${inp.dataset.field}">`;
          setupListener(zone.querySelector('input[type=file]'));
          toast('Image uploaded successfully');
        } catch(err) {
          toast(err.message || 'Upload failed', 'error');
          zone.innerHTML = `<i class="ph ph-upload-simple"></i><p style="color:var(--danger)">Upload failed: ${err.message || 'Unknown error'}</p><input type="file" accept="image/*,video/*" data-field="${inp.dataset.field}">`;
          setupListener(zone.querySelector('input[type=file]'));
        }
      });
    };
    setupListener(input);
  });

  // Multi-image gallery upload handlers
  editorView.querySelectorAll('input[type=file][data-gallery-field]').forEach(input => {
    const fieldKey = input.dataset.galleryField;
    const hiddenInput = editorView.querySelector(`[name="${fieldKey}"]`);
    const grid = document.getElementById(`gallery-grid-${fieldKey}`);
    
    const renderGrid = () => {
      let urls = [];
      try { urls = JSON.parse(hiddenInput.value || '[]'); } catch(e){}
      grid.innerHTML = urls.map((url, i) => `
        <div style="position:relative;width:100px;height:100px;border-radius:4px;overflow:hidden;border:1px solid var(--border);">
          <img src="${url}" style="width:100%;height:100%;object-fit:cover;">
          <button type="button" class="btn-icon" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.5);color:white;padding:0;width:20px;height:20px;min-width:auto;display:flex;align-items:center;justify-content:center;" onclick="window.removeGalleryImage('${fieldKey}', ${i})"><i class="ph ph-x" style="font-size:12px;"></i></button>
        </div>
      `).join('');
    };
    
    window.removeGalleryImage = (key, index) => {
      const hi = document.querySelector(`[name="${key}"]`);
      if (!hi) return;
      let urls = JSON.parse(hi.value || '[]');
      urls.splice(index, 1);
      hi.value = JSON.stringify(urls);
      document.getElementById(`gallery-grid-${key}`).innerHTML = urls.map((url, i) => `
        <div style="position:relative;width:100px;height:100px;border-radius:4px;overflow:hidden;border:1px solid var(--border);">
          <img src="${url}" style="width:100%;height:100%;object-fit:cover;">
          <button type="button" class="btn-icon" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.5);color:white;padding:0;width:20px;height:20px;min-width:auto;display:flex;align-items:center;justify-content:center;" onclick="window.removeGalleryImage('${key}', ${i})"><i class="ph ph-x" style="font-size:12px;"></i></button>
        </div>
      `).join('');
    };

    renderGrid();

    const handleUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      const zone = e.target.closest('.image-upload-zone');
      const originalHtml = zone.innerHTML;
      zone.innerHTML = '<p>Uploading ' + files.length + ' file(s)...</p>';
      
      try {
        let urls = JSON.parse(hiddenInput.value || '[]');
        for (const file of files) {
          const result = await uploadFile(file);
          urls.push(result.url);
        }
        hiddenInput.value = JSON.stringify(urls);
        renderGrid();
      } catch(err) {
        toast('Upload failed', 'error');
      } finally {
        zone.innerHTML = originalHtml;
        zone.querySelector('input[type=file]').addEventListener('change', handleUpload);
      }
    };

    input.addEventListener('change', handleUpload);
  });

  const goBack = () => {
    editorView.style.display = 'none';
    listView.style.display = 'block';
    if (createBtn) createBtn.style.display = '';
    if (searchEl) searchEl.style.display = '';
    editingId = null;
  };

  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('cancelBtn').addEventListener('click', goBack);

  document.getElementById('editorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {};
    config.fields.forEach(f => {
      const el = editorView.querySelector(`[name="${f.key}"]`);
      if (!el) return;
      if (f.type === 'checkbox') formData[f.key] = el.checked ? 1 : 0;
      else if (f.type === 'number') formData[f.key] = parseInt(el.value) || 0;
      else if (f.type === 'json_array') formData[f.key] = JSON.stringify(el.value.split('\\n').map(s=>s.trim()).filter(Boolean));
      else if (f.type === 'gallery') formData[f.key] = el.value || '[]';
      else formData[f.key] = el.value;
    });

    try {
      if (isNew) {
        await api(`/${section}`, { method: 'POST', body: formData });
        toast('Item created!');
      } else {
        await api(`/${section}/${editingId}`, { method: 'PUT', body: formData });
        toast('Item updated!');
      }
      goBack();
      renderCRUD(document.getElementById('contentArea'), section);
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

function renderField(field, data) {
  const val = data[field.key] ?? '';
  
  // Intercept rich layout builder fields
  if (field.key === 'content' || field.key === 'full_content') {
    return `<div class="form-group builder-container" data-field-key="${field.key}">
      <label>${field.label} — <span style="color:var(--accent); text-transform:none; font-weight:normal;">Visual Content Builder</span></label>
      <input type="hidden" name="${field.key}" id="builder-hidden-${field.key}" value="${val.replace(/"/g, '&quot;')}">
      <div class="blocks-list" id="blocks-list-${field.key}">
        <!-- Blocks will be loaded dynamically -->
      </div>
      <div class="builder-actions-row" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:20px; padding:16px; background:var(--bg-input); border:1px solid var(--border); border-radius:8px;">
        <button type="button" class="btn btn-outline btn-sm add-block-btn" data-type="text" data-field-key="${field.key}"><i class="ph ph-text-t"></i> + Paragraph</button>
        <button type="button" class="btn btn-outline btn-sm add-block-btn" data-type="subheading" data-field-key="${field.key}"><i class="ph ph-text-h-two"></i> + Subheading</button>
        <button type="button" class="btn btn-outline btn-sm add-block-btn" data-type="quote" data-field-key="${field.key}"><i class="ph ph-quotes"></i> + Quote</button>
        <button type="button" class="btn btn-outline btn-sm add-block-btn" data-type="image-full" data-field-key="${field.key}"><i class="ph ph-image"></i> + Full-Width Image</button>
        <button type="button" class="btn btn-outline btn-sm add-block-btn" data-type="image-two" data-field-key="${field.key}"><i class="ph ph-columns"></i> + Two-Column Images</button>
      </div>
    </div>`;
  }

  const descHtml = field.description 
    ? `<div class="field-help-text" style="font-size:0.8rem; color:var(--text-muted); margin-top:4px; line-height:1.4;"><i class="ph ph-info" style="vertical-align:middle; margin-right:4px;"></i>${field.description}</div>` 
    : '';

  if (field.type === 'checkbox') {
    return `<div class="form-group" style="margin-bottom:24px;">
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;text-transform:none;font-size:.9rem; margin-bottom:4px;">
        <input type="checkbox" name="${field.key}" ${val ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent)"> ${field.label}
      </label>
      ${descHtml}
    </div>`;
  }
  if (field.type === 'image') {
    return `<div class="form-group"><label>${field.label}</label>
      ${val ? `<img src="${val}" class="image-preview" id="preview-${field.key}" onerror="this.style.display='none'">` : `<img src="" class="image-preview" id="preview-${field.key}" style="display:none;" onerror="this.style.display='none'">`}
      <div class="image-upload-zone" style="margin-top:8px"><i class="ph ph-upload-simple"></i><p>Click or drag to upload</p><input type="file" accept="image/*,video/*" data-field="${field.key}"></div>
      <input type="text" name="${field.key}" value="${val}" placeholder="Or enter URL directly" oninput="const img=document.getElementById('preview-${field.key}'); if(img) { img.src=this.value; img.style.display=this.value?'block':'none'; }" style="margin-top:8px">
      ${descHtml}
    </div>`;
  }
  if (field.type === 'select') {
    return `<div class="form-group"><label>${field.label}</label><select name="${field.key}">
      ${(field.options || []).map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o || '— Select —'}</option>`).join('')}
    </select>${descHtml}</div>`;
  }
  if (field.type === 'gallery') {
    return `<div class="form-group"><label>${field.label}</label>
      <input type="hidden" name="${field.key}" value="${val ? val.replace(/"/g, '&quot;') : '[]'}">
      <div class="gallery-preview-grid" id="gallery-grid-${field.key}" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;"></div>
      <div class="image-upload-zone"><i class="ph ph-upload-simple"></i><p>Click or drag to upload multiple images</p><input type="file" multiple accept="image/*,video/*" data-gallery-field="${field.key}"></div>
      ${descHtml}
    </div>`;
  }
  if (field.type === 'json_array') {
    let textVal = '';
    try { textVal = JSON.parse(val || '[]').join('\\n'); } catch { textVal = val; }
    return `<div class="form-group"><label>${field.label}</label><textarea name="${field.key}" rows="5">${textVal}</textarea>${descHtml}</div>`;
  }
  if (field.type === 'textarea') {
    return `<div class="form-group"><label>${field.label}</label><textarea name="${field.key}" rows="5">${val}</textarea>${descHtml}</div>`;
  }
  return `<div class="form-group"><label>${field.label}</label><input type="${field.type || 'text'}" name="${field.key}" value="${val}" ${field.required ? 'required' : ''}>${descHtml}</div>`;
}

// ── Settings ─────────────────────────────────────────────
async function renderSettings(area) {
  const data = await api('/settings');
  const items = data.items || [];
  const groups = {};
  items.forEach(s => {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
  });

  const categoryLabels = { general: 'General', contact: 'Contact Information', social: 'Social Media', homepage: 'Homepage Content', stats: 'Statistics' };

  area.innerHTML = `
    <div class="editor-panel" style="max-width:700px;">
      <h3>Site Settings</h3>
      <form id="settingsForm">
        ${Object.entries(groups).map(([cat, settings]) => `
          <div class="settings-group">
            <h4>${categoryLabels[cat] || cat}</h4>
            ${settings.map(s => `
              <div class="form-group">
                <label>${s.label || s.key}</label>
                ${s.type === 'textarea'
                  ? `<textarea name="${s.key}" rows="3">${s.value || ''}</textarea>`
                  : `<input type="text" name="${s.key}" value="${s.value || ''}">`}
              </div>
            `).join('')}
          </div>
        `).join('')}
        <div class="editor-actions">
          <button type="submit" class="btn btn-primary"><i class="ph ph-check"></i> Save All Settings</button>
        </div>
      </form>
    </div>
    
    <div class="editor-panel" style="max-width:700px; margin-top:32px;">
      <h3 style="color:var(--danger)">Admin Security</h3>
      <form id="passwordForm">
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" id="current_password" required>
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="new_password" required>
        </div>
        <div class="editor-actions">
          <button type="submit" class="btn btn-primary"><i class="ph ph-lock"></i> Change Password</button>
        </div>
      </form>
    </div>`;

  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const settings = items.map(s => ({
      key: s.key,
      value: document.querySelector(`[name="${s.key}"]`).value,
    }));
    await api('/settings', { method: 'PUT', body: { settings } });
    toast('Settings saved!');
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/auth/password', {
        method: 'PUT',
        body: {
          current_password: document.getElementById('current_password').value,
          new_password: document.getElementById('new_password').value
        }
      });
      toast('Password changed successfully!');
      e.target.reset();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ── Visual Content Builder Engine ────────────────────────
function parseHTMLToBlocks(html) {
  const blocks = [];
  if (!html) return blocks;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const children = Array.from(doc.body.children);
  
  if (children.length === 0 && html.trim()) {
    blocks.push({ type: 'text', content: html.trim() });
    return blocks;
  }
  
  children.forEach(el => {
    const tagName = el.tagName.toUpperCase();
    
    if (tagName === 'H2' || tagName === 'H3') {
      blocks.push({ type: 'subheading', content: el.textContent.trim() });
    } else if (tagName === 'BLOCKQUOTE') {
      blocks.push({ type: 'quote', content: el.textContent.trim() });
    } else if (tagName === 'FIGURE' && el.classList.contains('full-width')) {
      const img = el.querySelector('img');
      blocks.push({ type: 'image-full', content: img ? img.getAttribute('src') : '' });
    } else if (el.classList.contains('two-column-images') || el.classList.contains('article-image-grid') || el.classList.contains('two-columns') || el.classList.contains('article-content-grid')) {
      const imgs = Array.from(el.querySelectorAll('img')).map(img => img.getAttribute('src'));
      blocks.push({ type: 'image-two', content: [imgs[0] || '', imgs[1] || ''] });
    } else if (tagName === 'IMG') {
      blocks.push({ type: 'image-full', content: el.getAttribute('src') || '' });
    } else if (tagName === 'P') {
      const img = el.querySelector('img');
      if (img) {
        blocks.push({ type: 'image-full', content: img.getAttribute('src') || '' });
      } else {
        blocks.push({ type: 'text', content: el.innerHTML.trim() });
      }
    } else {
      blocks.push({ type: 'text', content: el.outerHTML });
    }
  });
  
  return blocks;
}

function compileBlocksToHTML(blocks) {
  return blocks.map(block => {
    if (block.type === 'text') {
      if (!block.content.trim()) return '';
      if (!block.content.trim().startsWith('<')) {
        return `<p>${block.content.trim()}</p>`;
      }
      return block.content.trim();
    }
    if (block.type === 'subheading') {
      if (!block.content.trim()) return '';
      return `<h2>${block.content.trim()}</h2>`;
    }
    if (block.type === 'quote') {
      if (!block.content.trim()) return '';
      return `<blockquote class="article-quote">${block.content.trim()}</blockquote>`;
    }
    if (block.type === 'image-full') {
      if (!block.content) return '';
      return `<figure class="article-figure full-width"><img src="${block.content}" alt="Article image" class="article-content-img full-width-img"></figure>`;
    }
    if (block.type === 'image-two') {
      const img1 = block.content[0] || '';
      const img2 = block.content[1] || '';
      if (!img1 && !img2) return '';
      return `<div class="article-content-grid two-column-images">
        ${img1 ? `<img src="${img1}" alt="Article grid image" class="grid-img">` : ''}
        ${img2 ? `<img src="${img2}" alt="Article grid image" class="grid-img">` : ''}
      </div>`;
    }
    return '';
  }).filter(Boolean).join('\n');
}

function initBlockBuilders(section, data) {
  document.querySelectorAll('.builder-container').forEach(container => {
    const fieldKey = container.dataset.fieldKey;
    const hiddenInput = document.getElementById(`builder-hidden-${fieldKey}`);
    const listContainer = document.getElementById(`blocks-list-${fieldKey}`);
    
    let blocks = parseHTMLToBlocks(hiddenInput.value);
    
    const updateHiddenInput = () => {
      hiddenInput.value = compileBlocksToHTML(blocks);
    };
    
    const renderBlocks = () => {
      if (blocks.length === 0) {
        listContainer.innerHTML = `<div class="empty-state" style="padding:40px; border:1px dashed var(--border); border-radius:8px;"><i class="ph ph-cards"></i><p>This layout is empty. Click a button below to add your first content block!</p></div>`;
        return;
      }
      
      listContainer.innerHTML = blocks.map((block, index) => {
        let blockContentHtml = '';
        
        if (block.type === 'text') {
          blockContentHtml = `<textarea class="block-input text-block-input" rows="4" placeholder="Enter paragraph text..." style="width:100%; min-height:80px;">${block.content}</textarea>`;
        } else if (block.type === 'subheading') {
          blockContentHtml = `<input type="text" class="block-input subheading-block-input" placeholder="Enter subheading (H2)..." value="${block.content}" style="width:100%;">`;
        } else if (block.type === 'quote') {
          blockContentHtml = `<textarea class="block-input quote-block-input" rows="3" placeholder="Enter quote text..." style="width:100%; font-style:italic;">${block.content}</textarea>`;
        } else if (block.type === 'image-full') {
          blockContentHtml = `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <input type="text" class="block-input image-url-input" placeholder="Enter image URL..." value="${block.content}" style="width:100%;">
              ${block.content ? `<img src="${block.content}" class="image-preview" style="max-height:120px; width:auto; align-self:flex-start; object-fit:cover;">` : ''}
              <div class="image-upload-zone" style="padding:16px;">
                <i class="ph ph-upload-simple" style="font-size:1.5rem;"></i>
                <p style="font-size:.8rem; margin:0;">Click to upload full-width image</p>
                <input type="file" accept="image/*" class="block-file-input">
              </div>
            </div>`;
        } else if (block.type === 'image-two') {
          const img1 = block.content[0] || '';
          const img2 = block.content[1] || '';
          blockContentHtml = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:.75rem; color:var(--text-muted);">Left Image</label>
                <input type="text" class="block-input image-url-input-1" placeholder="Left image URL..." value="${img1}" style="width:100%;">
                ${img1 ? `<img src="${img1}" class="image-preview" style="max-height:100px; width:auto; align-self:flex-start; object-fit:cover;">` : ''}
                <div class="image-upload-zone" style="padding:12px;">
                  <i class="ph ph-upload-simple" style="font-size:1.2rem;"></i>
                  <input type="file" accept="image/*" class="block-file-input-1">
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:.75rem; color:var(--text-muted);">Right Image</label>
                <input type="text" class="block-input image-url-input-2" placeholder="Right image URL..." value="${img2}" style="width:100%;">
                ${img2 ? `<img src="${img2}" class="image-preview" style="max-height:100px; width:auto; align-self:flex-start; object-fit:cover;">` : ''}
                <div class="image-upload-zone" style="padding:12px;">
                  <i class="ph ph-upload-simple" style="font-size:1.2rem;"></i>
                  <input type="file" accept="image/*" class="block-file-input-2">
                </div>
              </div>
            </div>`;
        }
        
        const labels = { text: 'Paragraph', subheading: 'Subheading (H2)', quote: 'Pull Quote', 'image-full': 'Full-Width Image', 'image-two': 'Two-Column Images' };
        const icons = { text: 'text-t', subheading: 'text-h-two', quote: 'quotes', 'image-full': 'image', 'image-two': 'columns' };
        
        return `
          <div class="builder-block" data-index="${index}" style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:20px; margin-bottom:16px; position:relative; transition:all .2s;">
            <div class="block-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
              <div style="display:flex; align-items:center; gap:8px; color:var(--accent); font-weight:600; font-size:.85rem;">
                <i class="ph ph-${icons[block.type]}"></i> ${labels[block.type]}
              </div>
              <div class="block-controls" style="display:flex; gap:4px;">
                <button type="button" class="btn-icon move-up-btn" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}><i class="ph ph-arrow-up" style="font-size:1rem;"></i></button>
                <button type="button" class="btn-icon move-down-btn" data-index="${index}" title="Move Down" ${index === blocks.length - 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}><i class="ph ph-arrow-down" style="font-size:1rem;"></i></button>
                <button type="button" class="btn-icon delete-block-btn" data-index="${index}" title="Delete Block" style="color:var(--danger);"><i class="ph ph-trash" style="font-size:1rem;"></i></button>
              </div>
            </div>
            <div class="block-body">
              ${blockContentHtml}
            </div>
          </div>`;
      }).join('');
      
      bindBlockEvents();
    };
    
    const bindBlockEvents = () => {
      listContainer.querySelectorAll('.builder-block').forEach(blockEl => {
        const index = parseInt(blockEl.dataset.index);
        const block = blocks[index];
        
        if (block.type === 'text') {
          const textarea = blockEl.querySelector('.text-block-input');
          textarea.addEventListener('input', () => {
            block.content = textarea.value;
            updateHiddenInput();
          });
        } else if (block.type === 'subheading') {
          const input = blockEl.querySelector('.subheading-block-input');
          input.addEventListener('input', () => {
            block.content = input.value;
            updateHiddenInput();
          });
        } else if (block.type === 'quote') {
          const textarea = blockEl.querySelector('.quote-block-input');
          textarea.addEventListener('input', () => {
            block.content = textarea.value;
            updateHiddenInput();
          });
        } else if (block.type === 'image-full') {
          const input = blockEl.querySelector('.image-url-input');
          input.addEventListener('input', () => {
            block.content = input.value;
            updateHiddenInput();
          });
          
          const fileInput = blockEl.querySelector('.block-file-input');
          fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;
            const zone = fileInput.closest('.image-upload-zone');
            const originalText = zone.querySelector('p').textContent;
            zone.querySelector('p').textContent = 'Uploading...';
            try {
              const res = await uploadFile(file);
              block.content = res.url;
              updateHiddenInput();
              renderBlocks();
            } catch {
              zone.querySelector('p').textContent = 'Upload failed';
              setTimeout(() => zone.querySelector('p').textContent = originalText, 2000);
            }
          });
        } else if (block.type === 'image-two') {
          const input1 = blockEl.querySelector('.image-url-input-1');
          input1.addEventListener('input', () => {
            block.content[0] = input1.value;
            updateHiddenInput();
          });
          const input2 = blockEl.querySelector('.image-url-input-2');
          input2.addEventListener('input', () => {
            block.content[1] = input2.value;
            updateHiddenInput();
          });
          
          const fileInput1 = blockEl.querySelector('.block-file-input-1');
          fileInput1.addEventListener('change', async () => {
            const file = fileInput1.files[0];
            if (!file) return;
            const zone = fileInput1.closest('.image-upload-zone');
            zone.style.opacity = '0.5';
            try {
              const res = await uploadFile(file);
              block.content[0] = res.url;
              updateHiddenInput();
              renderBlocks();
            } catch {
              zone.style.opacity = '1';
            }
          });
          
          const fileInput2 = blockEl.querySelector('.block-file-input-2');
          fileInput2.addEventListener('change', async () => {
            const file = fileInput2.files[0];
            if (!file) return;
            const zone = fileInput2.closest('.image-upload-zone');
            zone.style.opacity = '0.5';
            try {
              const res = await uploadFile(file);
              block.content[1] = res.url;
              updateHiddenInput();
              renderBlocks();
            } catch {
              zone.style.opacity = '1';
            }
          });
        }
      });
      
      listContainer.querySelectorAll('.move-up-btn').forEach(btn => {
        btn.onclick = () => {
          const index = parseInt(btn.dataset.index);
          if (index > 0) {
            const temp = blocks[index];
            blocks[index] = blocks[index - 1];
            blocks[index - 1] = temp;
            updateHiddenInput();
            renderBlocks();
          }
        };
      });
      
      listContainer.querySelectorAll('.move-down-btn').forEach(btn => {
        btn.onclick = () => {
          const index = parseInt(btn.dataset.index);
          if (index < blocks.length - 1) {
            const temp = blocks[index];
            blocks[index] = blocks[index + 1];
            blocks[index + 1] = temp;
            updateHiddenInput();
            renderBlocks();
          }
        };
      });
      
      listContainer.querySelectorAll('.delete-block-btn').forEach(btn => {
        btn.onclick = () => {
          const index = parseInt(btn.dataset.index);
          blocks.splice(index, 1);
          updateHiddenInput();
          renderBlocks();
        };
      });
    };
    
    container.querySelectorAll('.add-block-btn').forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.type;
        const newBlock = { type, content: type === 'image-two' ? ['', ''] : '' };
        blocks.push(newBlock);
        updateHiddenInput();
        renderBlocks();
      };
    });
    
    renderBlocks();
  });
}
