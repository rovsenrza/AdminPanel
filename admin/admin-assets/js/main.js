document.addEventListener('DOMContentLoaded', function() {
    initAuthGuard();
    initMenuToggle();
    initModals();
    initTooltips();
    initThemeToggle();
    initSidebarToggle();
    initLogout();
    loadThemePreference();
    loadSidebarState();
});

function initAuthGuard() {
    const path = window.location.pathname || '';
    if (path.endsWith('/admin/login') || path.endsWith('login.html')) {
        return;
    }

    fetch('/backend/api/me', { credentials: 'include' })
        .then(res => {
            if (!res.ok || res.status === 401) {
                window.location.href = '/admin/login';
                return null;
            }
            return res.json();
        })
        .catch(() => {
            window.location.href = '/admin/login';
        });
}

function initLogout() {
    const logoutLinks = Array.from(document.querySelectorAll('a.menu-link'))
        .filter(a => {
            const text = (a.textContent || '').trim().toLowerCase();
            const hasIcon = !!a.querySelector('.fa-sign-out-alt');
            return text === 'logout' || hasIcon;
        });

    logoutLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await fetch('/backend/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {
                // ignore
            }
            window.location.href = '/admin/login';
        });
    });
}

function initMenuToggle() {
    const menuItems = document.querySelectorAll('.menu-item.has-sub');
    
    menuItems.forEach(item => {
        const link = item.querySelector('.menu-link');
        link.addEventListener('click', function(e) {
            e.preventDefault();
            item.classList.toggle('open');
        });
    });
}

function initModals() {
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const targetModal = document.querySelector(this.getAttribute('data-bs-target'));
            if (targetModal) {
                openModal(targetModal);
            }
        });
    });

    const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
}

function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggers.forEach(trigger => {
        trigger.setAttribute('title', trigger.getAttribute('data-bs-title') || '');
    });
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.content-wrapper');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function confirmDelete(message = 'Are you sure you want to delete this item?') {
    return confirm(message);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        });
    }
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.layout-menu');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            document.body.classList.toggle('sidebar-collapsed', isCollapsed);
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            updateSidebarIcon();
        });
    }
}

function loadSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebar = document.querySelector('.layout-menu');
    if (isCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
    }
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    updateSidebarIcon();
}

function updateSidebarIcon() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.layout-menu');
    if (sidebarToggle && sidebar) {
        const icon = sidebarToggle.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-right';
        } else {
            icon.className = 'fas fa-chevron-left';
        }
    }
}

function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function checkSlugUnique(slug, existingSlugs = []) {
    if (!existingSlugs.includes(slug)) {
        return slug;
    }
    
    let counter = 1;
    let newSlug = `${slug}-${counter}`;
    
    while (existingSlugs.includes(newSlug)) {
        counter++;
        newSlug = `${slug}-${counter}`;
    }
    
    return newSlug;
}

function validateImageSize(file, maxSizeKB = 400) {
    const maxSizeBytes = maxSizeKB * 1024;
    if (file.size > maxSizeBytes) {
        showAlert(`Image size must be less than ${maxSizeKB}KB. Current size: ${Math.round(file.size / 1024)}KB`, 'danger');
        return false;
    }
    return true;
}
