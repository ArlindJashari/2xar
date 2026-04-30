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
  return res.json();
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
  careers: 'Careers',
  partners: 'Partners',
  hero_slides: 'Hero Slides',
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
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Announcement', 'Infrastructure', 'Environmental', 'Water & Environment', 'Press Release'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'content', label: 'Full Content (HTML)', type: 'textarea' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'is_featured', label: 'Featured', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ]
  },
  projects: {
    columns: ['image', 'title', 'category', 'location', 'is_published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Infrastructure', 'Civil Engineering', 'Environment', 'Urban Planning', 'Water & Environment', 'Site Inspection', 'Public Relations', 'Energy'] },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'country', label: 'Country', type: 'select', options: ['', 'kosovo', 'albania', 'macedonia', 'montenegro', 'bosnia', 'serbia'] },
      { key: 'project_type', label: 'Project Type', type: 'select', options: ['', 'design-build', 'epc', 'construction-management', 'turnkey'] },
      { key: 'card_size', label: 'Card Size', type: 'select', options: ['small', 'featured', 'landscape'] },
      { key: 'value', label: 'Project Value', type: 'text' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'description', label: 'Short Description', type: 'textarea' },
      { key: 'full_content', label: 'Full Content (HTML)', type: 'textarea' },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'is_featured', label: 'Featured', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
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
  const colLabels = { image: 'Image', logo: 'Logo', title: 'Title', name: 'Name', category: 'Category', date: 'Date', location: 'Location', department: 'Dept.', subtitle: 'Subtitle', is_published: 'Status' };
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

  // Auto-slug from title/name
  const titleInput = editorView.querySelector('[name="title"]') || editorView.querySelector('[name="name"]');
  const slugInput = editorView.querySelector('[name="slug"]');
  if (titleInput && slugInput && isNew) {
    titleInput.addEventListener('input', () => { slugInput.value = toSlug(titleInput.value); });
  }

  // Image upload handlers
  editorView.querySelectorAll('.image-upload-zone input[type=file]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const zone = input.closest('.image-upload-zone');
      zone.innerHTML = '<p>Uploading...</p>';
      try {
        const result = await uploadFile(file);
        const hiddenInput = document.querySelector(`[name="${input.dataset.field}"]`);
        hiddenInput.value = result.url;
        zone.innerHTML = `<img src="${result.url}" class="image-preview"><p style="margin-top:8px;font-size:.8rem">Click to change</p><input type="file" accept="image/*,video/*" data-field="${input.dataset.field}">`;
        // Re-bind
        zone.querySelector('input[type=file]').addEventListener('change', arguments.callee);
      } catch { zone.innerHTML = '<p style="color:var(--danger)">Upload failed</p>'; }
    });
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
  if (field.type === 'checkbox') {
    return `<div class="form-group"><label style="display:flex;align-items:center;gap:10px;cursor:pointer;text-transform:none;font-size:.9rem">
      <input type="checkbox" name="${field.key}" ${val ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent)"> ${field.label}
    </label></div>`;
  }
  if (field.type === 'image') {
    return `<div class="form-group"><label>${field.label}</label>
      <input type="hidden" name="${field.key}" value="${val}">
      ${val ? `<img src="${val}" class="image-preview" onerror="this.style.display='none'">` : ''}
      <div class="image-upload-zone" style="margin-top:8px"><i class="ph ph-upload-simple"></i><p>Click or drag to upload</p><input type="file" accept="image/*,video/*" data-field="${field.key}"></div>
      <input type="text" name="${field.key}" value="${val}" placeholder="Or enter URL directly" style="margin-top:8px">
    </div>`;
  }
  if (field.type === 'select') {
    return `<div class="form-group"><label>${field.label}</label><select name="${field.key}">
      ${(field.options || []).map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o || '— Select —'}</option>`).join('')}
    </select></div>`;
  }
  if (field.type === 'textarea') {
    return `<div class="form-group"><label>${field.label}</label><textarea name="${field.key}" rows="5">${val}</textarea></div>`;
  }
  return `<div class="form-group"><label>${field.label}</label><input type="${field.type || 'text'}" name="${field.key}" value="${val}" ${field.required ? 'required' : ''}></div>`;
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
}
