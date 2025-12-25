/**
 * Dark Mode Manager
 * Quản lý chức năng dark mode cho toàn bộ ứng dụng
 */

class DarkModeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    /**
     * Lấy theme từ localStorage
     */
    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    /**
     * Lấy theme từ system preference
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Khởi tạo dark mode
     */
    init() {
        // Áp dụng theme ngay khi load
        this.applyTheme(this.theme);

        // Lắng nghe thay đổi system theme
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Chỉ áp dụng system theme nếu user chưa set preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        }

        // Tạo toggle button nếu chưa có
        this.createToggleButton();
    }

    /**
     * Áp dụng theme
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleIcon(theme);
        
        // Dispatch event để các components khác có thể lắng nghe
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    /**
     * Set theme mới
     */
    setTheme(theme, save = true) {
        this.theme = theme;
        this.applyTheme(theme);
        
        if (save) {
            localStorage.setItem('theme', theme);
        }
    }

    /**
     * Toggle theme
     */
    toggle() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Tạo toggle button
     */
    createToggleButton() {
        // Kiểm tra xem đã có button chưa
        if (document.getElementById('darkModeToggle')) {
            return;
        }

        // Tìm vị trí để thêm button (trong nav-icons)
        const navIcons = document.querySelector('.nav-icons');
        if (!navIcons) {
            // Nếu không tìm thấy, thử tìm trong header
            const header = document.querySelector('#app-header .top-row');
            if (header) {
                const searchForm = header.querySelector('.search');
                if (searchForm && searchForm.parentElement) {
                    const toggleBtn = document.createElement('button');
                    toggleBtn.id = 'darkModeToggle';
                    toggleBtn.className = 'dark-mode-toggle';
                    toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
                    toggleBtn.innerHTML = this.getToggleIcon(this.theme);
                    toggleBtn.addEventListener('click', () => this.toggle());
                    
                    // Chèn vào trước search form
                    searchForm.parentElement.insertBefore(toggleBtn, searchForm);
                }
            }
            return;
        }

        // Tạo button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'darkModeToggle';
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
        toggleBtn.innerHTML = this.getToggleIcon(this.theme);
        toggleBtn.addEventListener('click', () => this.toggle());

        // Chèn vào đầu nav-icons (trước các icon khác)
        navIcons.insertBefore(toggleBtn, navIcons.firstChild);
    }

    /**
     * Lấy icon cho toggle button
     */
    getToggleIcon(theme) {
        if (theme === 'dark') {
            return '<i class="fa-solid fa-sun"></i>';
        }
        return '<i class="fa-solid fa-moon"></i>';
    }

    /**
     * Cập nhật icon của toggle button
     */
    updateToggleIcon(theme) {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = this.getToggleIcon(theme);
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.theme;
    }
}

// Khởi tạo Dark Mode Manager
let darkModeManager;

// Khởi tạo khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        darkModeManager = new DarkModeManager();
    });
} else {
    darkModeManager = new DarkModeManager();
}

// Export để sử dụng ở nơi khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager;
}

// Export global
window.DarkModeManager = DarkModeManager;
window.darkModeManager = darkModeManager;

