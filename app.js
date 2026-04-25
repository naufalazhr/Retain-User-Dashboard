// ═══════════════════════════════════════════════════════
// RETAIN - ROASLAB : USER DASHBOARD APP
// ═══════════════════════════════════════════════════════

// --- KONFIGURASI ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwJn_plhpxDUyBt02YluccB57PJx8aQV0yI8Em7iz2qJ8zMErd2V3P_ZWyK5dcIcEQtcw/exec';

// --- UI Elements ---
const UI = {
  loginScreen: document.getElementById('login-screen'),
  dashboardScreen: document.getElementById('dashboard-screen'),
  
  // Login
  userEmail: document.getElementById('user-email'),
  userPassword: document.getElementById('user-password'),
  loginBtn: document.getElementById('login-btn'),
  loginError: document.getElementById('login-error'),
  btnText: null, // set after DOM ready
  btnLoader: null,
  
  // Header
  userEmailDisplay: document.getElementById('user-email-display'),
  logoutBtn: document.getElementById('logout-btn'),
  changePwBtn: document.getElementById('change-pw-btn'),
  
  // Modal Change Password
  changePwModal: document.getElementById('change-pw-modal'),
  closePwModal: document.getElementById('close-pw-modal'),
  oldPassword: document.getElementById('old-password'),
  newPassword: document.getElementById('new-password'),
  confirmPassword: document.getElementById('confirm-password'),
  submitPwBtn: document.getElementById('submit-pw-btn'),
  
  // Hero
  heroStatusBadge: document.getElementById('hero-status-badge'),
  heroPackage: document.getElementById('hero-package'),
  heroKey: document.getElementById('hero-key'),
  heroToggleKey: document.getElementById('hero-toggle-key'),
  heroCopyKey: document.getElementById('hero-copy-key'),
  heroExpire: document.getElementById('hero-expire'),
  heroShops: document.getElementById('hero-shops'),
  
  // Info cards
  infoKey: document.getElementById('info-key'),
  infoToggleKey: document.getElementById('info-toggle-key'),
  infoCopyKey: document.getElementById('info-copy-key'),
  infoPkg: document.getElementById('info-pkg'),
  infoStatus: document.getElementById('info-status'),
  infoExpire: document.getElementById('info-expire'),
  
  // Shops
  shopsCounter: document.getElementById('shops-counter'),
  shopsList: document.getElementById('shops-list'),
  
  // Timeline
  timelineContainer: document.getElementById('timeline-container'),
  
  // Toast
  toastContainer: document.getElementById('toast-container'),
};

// --- Session ---
let currentSession = null;
let isKeyVisible = false;
try {
  const localSession = localStorage.getItem('retain_user_session');
  const sessionSession = sessionStorage.getItem('retain_user_session');
  currentSession = JSON.parse(localSession || sessionSession || 'null');
} catch(e) {}

// ══════════════════════════════════════
// TOAST SYSTEM
// ══════════════════════════════════════

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '📢'}</div>
    <div class="toast-message">${message}</div>
  `;
  UI.toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function daysUntilExpiry(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  const diff = d - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getActionIcon(action) {
  const icons = {
    'Created': '🆕', 'Revoked': '🚫', 'Activated': '✅',
    'Unbind': '🔗', 'Payment': '💰', 'Renewed': '🔄',
    'Upgraded': '⬆️', 'Downgraded': '⬇️', 'Note': '📝'
  };
  return icons[action] || '📋';
}

const PKG_LABELS = {
  'Starter': 'Starter (1 Toko)',
  'Growth': 'Growth (2 Toko)',
  'Scale': 'Scale (5 Toko)',
  'Unlimited': 'Unlimited'
};

// ══════════════════════════════════════
// API
// ══════════════════════════════════════

async function apiLogin(email, password) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'user_login',
        email: email,
        password: password
      }),
      redirect: 'follow',
      signal: controller.signal
    });
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Koneksi timeout. Server tidak merespons.' };
    }
    return { success: false, message: 'Gagal terhubung ke server.' };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiChangePassword(email, oldPassword, newPassword) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'user_change_password',
        email: email,
        oldPassword: oldPassword,
        newPassword: newPassword
      }),
      redirect: 'follow',
      signal: controller.signal
    });
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Koneksi timeout. Server tidak merespons.' };
    }
    return { success: false, message: 'Gagal terhubung ke server.' };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ══════════════════════════════════════
// ROUTING
// ══════════════════════════════════════

function showLogin() {
  UI.loginScreen.classList.add('active');
  UI.dashboardScreen.classList.remove('active');
}

function showDashboard(data) {
  UI.loginScreen.classList.remove('active');
  UI.dashboardScreen.classList.add('active');
  
  const skeleton = document.getElementById('skeleton-overlay');
  if (skeleton) skeleton.style.display = 'block';
  
  renderDashboard(data);
  
  // Hide skeleton after brief delay for smooth transition
  setTimeout(() => {
    if (skeleton) {
       skeleton.style.opacity = '0';
       setTimeout(() => skeleton.style.display = 'none', 300);
    }
  }, 400);
}

// ══════════════════════════════════════
// RENDER
// ══════════════════════════════════════

function renderDashboard(data) {
  // Update Header
  UI.userEmailDisplay.textContent = data.email;
  
  // Update Hero
  UI.heroPackage.textContent = data.pkg;
  
  // Default to masked key on render
  isKeyVisible = false;
  if(typeof updateKeyDisplay === 'function') updateKeyDisplay();
  else {
    UI.heroKey.textContent = data.key;
    UI.infoKey.textContent = data.key;
  }
  
  UI.heroStatusBadge.textContent = data.status;
  UI.heroStatusBadge.className = 'hero-badge ' + data.status;
  UI.heroPackage.textContent = PKG_LABELS[data.pkg] || data.pkg;
  const daysLeft = daysUntilExpiry(data.expire);
  let expireDisplay = formatDate(data.expire);
  
  const heroCountdown = document.getElementById('hero-countdown');
  heroCountdown.style.display = 'none';

  if (daysLeft !== null && data.status === 'Active') {
    if (daysLeft <= 0) {
      expireDisplay += ' (Expired!)';
    } else {
      heroCountdown.textContent = `${daysLeft} Hari Lagi`;
      heroCountdown.style.display = 'inline-block';
      if (daysLeft <= 7) {
        heroCountdown.style.background = 'rgba(244, 67, 54, 0.2)';
        heroCountdown.style.color = '#f44336';
      } else {
        heroCountdown.style.background = 'rgba(255, 152, 0, 0.2)';
        heroCountdown.style.color = '#ff9800';
      }
    }
  }
  UI.heroExpire.textContent = expireDisplay;
  UI.heroShops.textContent = `${data.shops.length} / ${data.maxShops}`;
  
  // Update Info Grid
  UI.infoPkg.textContent = data.pkg;
  UI.infoStatus.textContent = data.status;
  UI.infoStatus.className = 'info-card-value ' + data.status;
  UI.infoExpire.textContent = expireDisplay;
  
  // Shops
  renderShops(data.shops, data.maxShops);
  
  // Timeline
  renderTimeline(data.history);
}

function renderShops(shops, maxShops) {
  UI.shopsCounter.textContent = `${shops.length} / ${maxShops}`;
  
  if (shops.length === 0) {
    UI.shopsList.innerHTML = `
      <div class="shops-empty">
        <span class="shops-empty-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></span>
        Belum ada toko yang terikat ke lisensi ini.
      </div>
    `;
  } else {
    UI.shopsList.innerHTML = shops.map((shop, i) => `
      <div class="shop-item" style="animation-delay: ${i * 0.05}s">
        <div class="shop-icon"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>
        <span class="shop-name">${shop}</span>
      </div>
    `).join('');
  }
  
  // Slot progress bar
  const percentage = Math.min((shops.length / maxShops) * 100, 100);
  UI.shopsList.innerHTML += `
    <div class="shop-slot-bar">
      <div class="slot-bar-header">
        <span>Penggunaan Slot</span>
        <span>${shops.length} / ${maxShops}</span>
      </div>
      <div class="slot-bar-track">
        <div class="slot-bar-fill" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

function renderTimeline(historyStr) {
  let history = [];
  try {
    history = JSON.parse(historyStr || '[]');
  } catch (e) {
    history = [];
  }
  
  if (history.length === 0) {
    UI.timelineContainer.innerHTML = `
      <div class="timeline-empty">
        <span class="timeline-empty-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
        Belum ada histori langganan tercatat.
      </div>
    `;
    return;
  }
  
  const reversed = [...history].reverse();
  
  UI.timelineContainer.innerHTML = reversed.map((entry, i) => {
    const actionClass = (entry.action || 'Note').toLowerCase();
    const actionIcon = getActionIcon(entry.action);
    return `
      <div class="timeline-item ${actionClass}" style="animation-delay: ${i * 0.06}s">
        <div class="timeline-dot">${actionIcon}</div>
        <div class="timeline-content">
          <div class="timeline-action">${entry.action || 'Note'}</div>
          <div class="timeline-detail">${entry.detail || '-'}</div>
          <div class="timeline-date">${entry.date || '-'}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ══════════════════════════════════════
// EVENT HANDLERS
// ══════════════════════════════════════

// Login
UI.loginBtn.addEventListener('click', async () => {
  const email = UI.userEmail.value.trim();
  const password = UI.userPassword.value.trim();
  
  if (!email || !password) {
    UI.loginError.style.display = 'block';
    UI.loginError.textContent = 'Masukkan email dan password!';
    return;
  }
  
  // Loading state
  const btnText = UI.loginBtn.querySelector('.btn-text');
  const btnLoader = UI.loginBtn.querySelector('.btn-loader');
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-flex';
  UI.loginBtn.disabled = true;
  UI.loginError.style.display = 'none';
  
  const res = await apiLogin(email, password);
  
  // Reset button
  btnText.style.display = 'inline';
  btnLoader.style.display = 'none';
  UI.loginBtn.disabled = false;
  
  if (res.success && res.data) {
    // Save session
    currentSession = { email, data: res.data };
    
    const rememberMe = document.getElementById('remember-me').checked;
    if (rememberMe) {
      localStorage.setItem('retain_user_session', JSON.stringify(currentSession));
      sessionStorage.removeItem('retain_user_session');
    } else {
      sessionStorage.setItem('retain_user_session', JSON.stringify(currentSession));
      localStorage.removeItem('retain_user_session');
    }
    
    showToast('Login berhasil!', 'success');
    showDashboard(res.data);
  } else {
    UI.loginError.style.display = 'block';
    UI.loginError.textContent = res.message || 'Login gagal. Coba lagi.';
  }
});

// Login on Enter
UI.userPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') UI.loginBtn.click();
});
UI.userEmail.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') UI.userPassword.focus();
});

// Logout
UI.logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('retain_user_session');
  localStorage.removeItem('retain_user_session');
  currentSession = null;
  showLogin();
  showToast('Logout berhasil', 'success');
});

// Change Password Modal
UI.changePwBtn.addEventListener('click', () => {
  UI.oldPassword.value = '';
  UI.newPassword.value = '';
  UI.confirmPassword.value = '';
  UI.changePwModal.classList.add('active');
});

UI.closePwModal.addEventListener('click', () => {
  UI.changePwModal.classList.remove('active');
});

UI.submitPwBtn.addEventListener('click', async () => {
  const oldPw = UI.oldPassword.value.trim();
  const newPw = UI.newPassword.value.trim();
  const confirmPw = UI.confirmPassword.value.trim();
  
  if (!oldPw || !newPw || !confirmPw) {
    showToast('Semua field harus diisi!', 'warning');
    return;
  }
  
  if (newPw !== confirmPw) {
    showToast('Konfirmasi password tidak cocok!', 'warning');
    return;
  }
  
  if (newPw.length < 6) {
    showToast('Password baru minimal 6 karakter!', 'warning');
    return;
  }
  
  UI.submitPwBtn.disabled = true;
  UI.submitPwBtn.innerText = 'Menyimpan...';
  
  const email = currentSession.email;
  const res = await apiChangePassword(email, oldPw, newPw);
  
  UI.submitPwBtn.disabled = false;
  UI.submitPwBtn.innerText = 'Simpan Password';
  
  if (res.success) {
    showToast('Password berhasil diubah!', 'success');
    UI.changePwModal.classList.remove('active');
    // Session remains active. Next login will require new password.
  } else {
    showToast(res.message || 'Gagal mengubah password.', 'error');
  }
});

// ══════════════════════════════════════
// KEY TOGGLE & COPY LOGIC
// ══════════════════════════════════════
function updateKeyDisplay() {
  if (!currentSession || !currentSession.data) return;
  const keyToDisplay = isKeyVisible && currentSession.data.fullKey ? currentSession.data.fullKey : currentSession.data.key;
  
  if(UI.heroKey) UI.heroKey.textContent = keyToDisplay;
  if(UI.infoKey) UI.infoKey.textContent = keyToDisplay;
  
  const eyeOpen = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const eyeClosed = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  const toggleIcon = isKeyVisible ? eyeClosed : eyeOpen;
  
  if(UI.heroToggleKey) UI.heroToggleKey.innerHTML = toggleIcon;
  if(UI.infoToggleKey) UI.infoToggleKey.innerHTML = toggleIcon;
  
  if(UI.heroCopyKey) UI.heroCopyKey.style.display = isKeyVisible ? 'inline-block' : 'none';
  if(UI.infoCopyKey) UI.infoCopyKey.style.display = isKeyVisible ? 'inline-block' : 'none';
}

function toggleKey() {
  if (!currentSession || !currentSession.data || !currentSession.data.fullKey) {
     showToast("Data belum lengkap. Silakan Logout dan Login kembali.", "warning");
     return;
  }
  isKeyVisible = !isKeyVisible;
  updateKeyDisplay();
}

function copyKey() {
  if (currentSession && currentSession.data && currentSession.data.fullKey) {
    navigator.clipboard.writeText(currentSession.data.fullKey).then(() => {
      showToast('License key disalin!', 'success');
    }).catch(err => {
      showToast('Gagal menyalin text', 'error');
    });
  }
}

if (UI.heroToggleKey) UI.heroToggleKey.addEventListener('click', toggleKey);
if (UI.infoToggleKey) UI.infoToggleKey.addEventListener('click', toggleKey);
if (UI.heroCopyKey) UI.heroCopyKey.addEventListener('click', copyKey);
if (UI.infoCopyKey) UI.infoCopyKey.addEventListener('click', copyKey);

// ══════════════════════════════════════
// INIT — Restore session
// ══════════════════════════════════════

if (currentSession && currentSession.data) {
  showDashboard(currentSession.data);
  // Background refresh
  apiLogin(currentSession.email, currentSession.password).then(res => {
    if (res.success && res.data) {
      currentSession.data = res.data;
      if (localStorage.getItem('retain_user_session')) {
        localStorage.setItem('retain_user_session', JSON.stringify(currentSession));
      } else {
        sessionStorage.setItem('retain_user_session', JSON.stringify(currentSession));
      }
      renderDashboard(res.data);
    }
  });
} else {
  showLogin();
}
