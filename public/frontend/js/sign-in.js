// sign-in.js

document.addEventListener('DOMContentLoaded', () => {
    const form  = document.getElementById('loginForm');
    const email = document.getElementById('loginEmail');
    const pass  = document.getElementById('loginPassword');
    const error = document.getElementById('loginError');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.textContent = '';

        if (!email.value.trim() || !pass.value) {
            error.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
            return;
        }

        try {
            const data = await App.apiPost('/auth/login', {
                email: email.value.trim(),
                password: pass.value,
            });

            App.setToken(data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Sau login → vào dashboard
            window.location.href = '/frontend/pages/overview.html';
        } catch (err) {
            console.error(err);
            error.textContent = err.message || 'Đăng nhập thất bại';
        }
    });
});
