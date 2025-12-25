// =======================================================
// HELPER CONSTANTS & FUNCTIONS
// =======================================================

const ERROR_CLASS = "error-message";

function displayError($input, message) {
    $input.next(`.${ERROR_CLASS}`).remove();
    $input.after(`<div class="${ERROR_CLASS} text-danger mt-1">${message}</div>`);
}

function clearAllErrors() {
    $(`.${ERROR_CLASS}`).remove();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =======================================================
// FORGOT_PWD
// =======================================================

$(document).ready(function () {
    const $emailInput = $("#emailInput");
    const $forgotPasswordForm = $("#forgotPasswordForm");
    const $continueBtn = $("#continueBtn");

    // Nếu không có form forgot-password thì bỏ qua
    if (!$forgotPasswordForm.length) return;

    // Gọi backend để gửi email reset
    async function handleEmailCheck(e) {
        e.preventDefault();

        const email = $emailInput.val().trim();
        clearAllErrors();

        if (email === "") {
            displayError($emailInput, "Please enter your email address");
            return;
        }

        if (!isValidEmail(email)) {
            displayError($emailInput, "Invalid email format");
            return;
        }

        $continueBtn.prop("disabled", true).text("Sending...");

        try {
            // Gọi API backend
            const res = await App.apiPost("/auth/forgot-password", { email });

            alert("A password reset request has been created. Redirecting...");

            // Lấy token + email từ response (PasswordResetController trả token trong DEV)
            const token = res.token || res.debug_token || "";
            const redirectUrl = `/reset-password?email=${encodeURIComponent(
                email
            )}&token=${encodeURIComponent(token)}`;

            window.location.href = redirectUrl;
        } catch (err) {
            console.error(err);
            displayError(
                $emailInput,
                err.message ||
                    "This email address is not registered in our system."
            );
            $continueBtn.prop("disabled", false).text("Continue");
        }
    }

    $continueBtn.on("click", handleEmailCheck);
    $forgotPasswordForm.on("submit", handleEmailCheck);

    $emailInput.on("input", function () {
        $(this).next(`.${ERROR_CLASS}`).remove();
    });
});

// =======================================================
// RESET_PWD
// =======================================================
$(document).ready(function () {
    const $resetPasswordForm = $("#resetPasswordForm");
    
    // Nếu không có form reset-password thì bỏ qua
    if (!$resetPasswordForm.length) return;

    // Lấy email & token từ query string (reset-pwd.html?email=...&token=...)
    const params = new URLSearchParams(window.location.search);
    const resetEmail = params.get("email");
    const resetToken = params.get("token");

    // Nếu user đã đăng nhập (App.getToken()) thì dùng flow authenticated change-password
    const isAuthenticated =
        typeof App !== "undefined" &&
        typeof App.getToken === "function" &&
        !!App.getToken();

    if (!isAuthenticated) {
        // token-based reset requires email & token
        if (!resetEmail || !resetToken) {
            alert("Invalid reset link. Please request password reset again.");
            window.location.href = "/forgot-password";
            return;
        }
    } else {
        // show current-password input for authenticated change
        $("#oldPasswordGroup").removeClass("d-none");
    }

    // Xử lý logic hiển thị/ẩn mật khẩu
    $(".password-toggle-icon").on("click", function () {
        const $icon = $(this);
        const targetId = $icon.data("target");
        const $input = $(targetId);
        const currentType = $input.attr("type");

        if (currentType === "password") {
            $input.attr("type", "text");
            $icon.removeClass("fa-eye-slash").addClass("fa-eye");
        } else {
            $input.attr("type", "password");
            $icon.removeClass("fa-eye").addClass("fa-eye-slash");
        }
    });

    const $newPasswordInput = $("#newPasswordInput");
    const $confirmPasswordInput = $("#confirmPasswordInput");
    const $resetBtn = $("#resetBtn");

    const $strengthBar = $("#strengthBar");
    const $strengthText = $("#strengthText");
    const $passwordRequirements = $("#passwordRequirements");

    // Kiểm tra độ mạnh của mật khẩu
    function checkPasswordStrength(password) {
        $newPasswordInput.next(`.${ERROR_CLASS}`).remove();

        if (password.length === 0) {
            $strengthBar.removeClass().addClass("strength-bar");
            $strengthText.text("");
            $passwordRequirements.empty();
            return { valid: false, message: "Password is required" };
        }

        // Nếu có zxcvbn
        if (typeof zxcvbn === "function") {
            const result = zxcvbn(password);
            const score = result.score;
            const scoreTexts = [
                "Too Weak",
                "Weak",
                "Fair",
                "Strong",
                "Very Strong",
            ];

            $strengthBar.removeClass().addClass(`strength-bar strength-${score}`);

            $strengthText
                .text(`Strength: ${scoreTexts[score]}`)
                .removeClass("strength-success strength-fail");

            $passwordRequirements.empty();

            if (score >= 1) {
                $strengthText
                    .addClass("strength-success")
                    .text(`Strength: ${scoreTexts[score]}`);

                const $li = $("<li>")
                    .text("Password meets the minimum strength requirements")
                    .addClass("strength-success");
                $passwordRequirements.append($li);

                return { valid: true, message: "" };
            } else {
                $strengthText.addClass("strength-fail");

                const suggestions = result.feedback.suggestions;

                if (suggestions && suggestions.length > 0) {
                    suggestions.forEach((suggestion) => {
                        if (suggestion.trim() !== "") {
                            const $li = $("<li>")
                                .text(suggestion)
                                .addClass("strength-fail");
                            $passwordRequirements.append($li);
                        }
                    });
                }
                return {
                    valid: false,
                    message: "Password must be at least Weak (score ≥ 1).",
                };
            }
        } else {
            // Fallback: kiểm tra đơn giản nếu không có zxcvbn
            if (password.length >= 6) {
                return { valid: true, message: "" };
            }
            return { valid: false, message: "Password must be at least 6 characters" };
        }
    }

    // --- Kiểm tra & gọi API reset ---
    async function handleResetPassword(e) {
        e.preventDefault();

        const newPwd = $newPasswordInput.val().trim();
        const confirmPwd = $confirmPasswordInput.val().trim();

        const oldPwd = $("#oldPasswordInput").length
            ? $("#oldPasswordInput").val().trim()
            : "";

        clearAllErrors();

        const strengthResult = checkPasswordStrength(newPwd);

        if (!strengthResult.valid) {
            if (newPwd === "") {
                displayError($newPasswordInput, "Password is required");
            }
            return;
        }

        if (confirmPwd === "") {
            displayError(
                $confirmPasswordInput,
                "Please confirm your new password"
            );
            return;
        }

        if (newPwd !== confirmPwd) {
            displayError($confirmPasswordInput, "Passwords do not match");
            return;
        }

        $resetBtn.prop("disabled", true).text("Processing...");

        try {
            if (isAuthenticated) {
                // Authenticated user: call change-password endpoint
                if (!oldPwd) {
                    displayError(
                        $("#oldPasswordInput"),
                        "Please enter your current password"
                    );
                    $resetBtn.prop("disabled", false).text("Reset Password");
                    return;
                }

                await App.apiPost("/auth/change-password", {
                    current_password: oldPwd,
                    new_password: newPwd,
                    new_password_confirmation: confirmPwd,
                });

                alert("Password updated successfully. Redirecting to Profile");
                window.location.href = "/profile";
            } else {
                // Token-based reset (public)
                await App.apiPost("/auth/reset-password", {
                    email: resetEmail,
                    token: resetToken,
                    password: newPwd,
                    password_confirmation: confirmPwd,
                });

                alert("Password successfully reset! Redirecting to Sign In");
                window.location.href = "/login";
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Reset password failed");
            $resetBtn.prop("disabled", false).text("Reset Password");
        }
    }

    $resetBtn.on("click", handleResetPassword);
    $resetPasswordForm.on("submit", handleResetPassword);

    $newPasswordInput.on("input", function () {
        checkPasswordStrength($(this).val());
    });
    $confirmPasswordInput.on("input", function () {
        $(this).next(`.${ERROR_CLASS}`).remove();
    });
});
