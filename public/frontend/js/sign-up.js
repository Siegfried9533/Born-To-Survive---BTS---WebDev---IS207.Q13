// sign-up.js

document.addEventListener('DOMContentLoaded', () => {
    App.requireAuth(); // yêu cầu admin đã login mới được tạo user

    const form = document.getElementById('signupForm');
    const btn  = document.getElementById('signUpBtn');

    if (!form || !btn) return;

    btn.addEventListener('click', async () => {
        const fullName = document.getElementById('fullNameInput').value.trim();
        const email    = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;

        if (!fullName || !email || !password) {
            alert('Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
            return;
        }

        // Tạm thời: role & storeId fix cứng, sau này bạn có form chọn thì sửa ở đây
        const payload = {
            name:     fullName,
            email:    email,
            password: password,
            role:     'staff',  // hoặc 'manager', tuỳ nghiệp vụ
            store_id: 'ST01',
        };

        try {
            await App.apiPost('/users', payload);
            alert('Tạo tài khoản mới thành công!');
            form.reset();
        } catch (err) {
            alert(err.message || 'Tạo tài khoản thất bại');
        }
    });
});
