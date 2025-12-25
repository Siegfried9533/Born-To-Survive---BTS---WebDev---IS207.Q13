{{-- Auth Check Script - Include in protected pages --}}
<script>
    // Kiểm tra authentication trước khi render page
    (function() {
        if (typeof App === 'undefined' || typeof App.getToken !== 'function') {
            console.error('App.getToken not defined. Make sure app-core.js is loaded first.');
            return;
        }
        
        const token = App.getToken();
        if (!token) {
            // Chưa đăng nhập -> redirect về login
            console.log('No auth token found, redirecting to login...');
            window.location.href = '/login';
        }
    })();
</script>
