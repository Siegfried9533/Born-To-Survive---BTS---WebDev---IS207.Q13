// sign-in.js

document.addEventListener('DOMContentLoaded', () => {
    const form  = document.getElementById('loginForm');
    const email = document.getElementById('loginEmail');
    const pass  = document.getElementById('loginPassword');
    const error = document.getElementById('loginError');

    if (!form) return;

    // Nếu đã login rồi thì redirect đến dashboard
    if (App.isLoggedIn()) {
        window.location.href = '/dashboard/overview';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.textContent = '';

        if (!email.value.trim() || !pass.value) {
            error.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
            return;
        }

        // Disable button khi đang xử lý
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng nhập...';

        try {
            const data = await App.apiPost('/auth/login', {
                email: email.value.trim(),
                password: pass.value,
            });

            // Lưu token và user info
            App.setToken(data.access_token);
            App.setUser(data.user);

            // Redirect đến dashboard
            window.location.href = '/dashboard/overview';
        } catch (err) {
            console.error(err);
            error.textContent = err.message || 'Đăng nhập thất bại';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
