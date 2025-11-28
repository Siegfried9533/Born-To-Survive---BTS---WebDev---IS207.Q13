// =======================================================
// FORGOT_PWD
// =======================================================

$(document).ready(function () {
    const $emailInput = $('#emailInput');
    const $forgotPasswordForm = $('#forgotPasswordForm');
    const $continueBtn = $('#continueBtn');

    // --- Hàm giả lập để kiểm tra email ---
    function checkEmailExists(email) {
        const existingEmails = [
            'test@modalab.com', 'admin@modalab.com', 'user@example.com'
        ];
        return existingEmails.includes(email.toLowerCase());
    }

    function handleEmailCheck(e) {
        e.preventDefault();

        const email = $emailInput.val().trim();
        clearAllErrors();

        if (email === '') {     // Gọi từ main.js
            displayError($emailInput, 'Please enter your email address');
            return;
        }

        if (!isValidEmail(email)) {
            displayError($emailInput, 'Invalid email format');
            return;
        }

        if (checkEmailExists(email)) {
            alert('A password reset request has been sent. Redirecting...');

            window.location.href = 'reset-pwd.html';

        } else {
            displayError($emailInput, 'This email address is not registered in our system.');
        }
    }

    $continueBtn.on('click', handleEmailCheck);
    $forgotPasswordForm.on('submit', handleEmailCheck);

    $emailInput.on('input', function () {
        $(this).next(`.${ERROR_CLASS}`).remove();
    });
});

// =======================================================
// RESET_PWD
// =======================================================
$(document).ready(function () {
    // Xử lý logic hiển thị/ẩn mật khẩu
    $('.password-toggle-icon').on('click', function () {
        const $icon = $(this);
        const targetId = $icon.data('target');
        const $input = $(targetId);
        const currentType = $input.attr('type');

        if (currentType === 'password') {
            $input.attr('type', 'text');
            $icon.removeClass('fa-eye-slash').addClass('fa-eye');
        } else {
            $input.attr('type', 'password');
            $icon.removeClass('fa-eye').addClass('fa-eye-slash');
        }
    });

    const $newPasswordInput = $('#newPasswordInput');
    const $confirmPasswordInput = $('#confirmPasswordInput');
    const $resetPasswordForm = $('#resetPasswordForm');
    const $resetBtn = $('#resetBtn');

    const $strengthBar = $('#strengthBar');
    const $strengthText = $('#strengthText');
    const $passwordRequirements = $('#passwordRequirements');

    // Kiểm tra độ mạnh của mật khẩu
    function checkPasswordStrength(password) {
        $newPasswordInput.next(`.${ERROR_CLASS}`).remove();

        if (password.length === 0) {
            $strengthBar.removeClass().addClass('strength-bar');
            $strengthText.text('');
            $passwordRequirements.empty();
            return { valid: false, message: 'Password is required' };
        }

        const result = zxcvbn(password);
        const score = result.score;
        const scoreTexts = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

        $strengthBar.removeClass().addClass(`strength-bar strength-${score}`);

        $strengthText.text(`Strength: ${scoreTexts[score]}`).removeClass('strength-success strength-fail');

        $passwordRequirements.empty();

        if (score >= 3) {
            $strengthText.addClass('strength-success').text('Strength: Excellent!');

            const $li = $('<li>')
                .text('Password meets all minimum strength requirements')
                .addClass('strength-success');
            $passwordRequirements.append($li);

            return { valid: true, message: '' };

        } else {
            $strengthText.addClass('strength-fail');

            const suggestions = result.feedback.suggestions;

            if (suggestions && suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    if (suggestion.trim() !== '') {
                        const $li = $('<li>')
                            .text(suggestion)
                            .addClass('strength-fail');
                        $passwordRequirements.append($li);
                    }
                });
            }
            return {
                valid: false,
                message: 'Password must achieve Strong or Very Strong rating (score ≥ 3).'
            };
        }
    }

    // --- Kiểm tra đã nhập hết các ô input chưa ---
    function handleResetPassword(e) {
        e.preventDefault();

        const newPwd = $newPasswordInput.val().trim();
        const confirmPwd = $confirmPasswordInput.val().trim();

        clearAllErrors();

        const strengthResult = checkPasswordStrength(newPwd);

        if (!strengthResult.valid) {
            if (newPwd === '') {
                displayError($newPasswordInput, 'Password is required');
            }
            return;
        }

        if (confirmPwd === '') {
            displayError($confirmPasswordInput, 'Please confirm your new password');
            return;
        }

        if (newPwd !== confirmPwd) {
            displayError($confirmPasswordInput, 'Passwords do not match');
            return;
        }

        alert('Password successfully reset! Redirecting to Sign In');
        window.location.href = '../index.html';
    }

    $resetBtn.on('click', handleResetPassword);
    $resetPasswordForm.on('submit', handleResetPassword);

    $newPasswordInput.on('input', function () {
        checkPasswordStrength($(this).val());
    });
    $confirmPasswordInput.on('input', function () { $(this).next(`.${ERROR_CLASS}`).remove(); });
});