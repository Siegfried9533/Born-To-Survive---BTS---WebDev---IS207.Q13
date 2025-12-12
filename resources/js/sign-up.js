// =======================================================
// SIGN UP FORM VALIDATION & HANDLING
// =======================================================

$(document).ready(function () {
    const $fullNameInput = $('#fullNameInput');
    const $emailInput = $('#emailInput');
    const $passwordInput = $('#passwordInput');
    const $signUpBtn = $('#signUpBtn');
    const $signupForm = $('#signupForm');

    const ERROR_CLASS = "dynamic-error-message";

    // --- Email validation ---
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // --- Show error ---
    function displayError(inputElement, message) {
        inputElement.next(`.${ERROR_CLASS}`).remove();

        const $errorDiv = $("<div>")
            .addClass(`text-danger fs-small mt-1 ${ERROR_CLASS}`)
            .text(message);

        inputElement.after($errorDiv);
        inputElement.focus();
    }

    // --- Clear all errors ---
    function clearAllErrors() {
        $(`.${ERROR_CLASS}`).remove();
    }

    // --- Validate form ---
    function validateForm() {
        clearAllErrors();

        const fullName = $fullNameInput.val().trim();
        const email = $emailInput.val().trim();
        const password = $passwordInput.val().trim();

        let isValid = true;

        if (fullName === '') {
            displayError($fullNameInput, 'Please enter your full name');
            isValid = false;
        }

        if (email === '') {
            displayError($emailInput, 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(email)) {
            displayError($emailInput, 'Invalid email format');
            isValid = false;
        }

        if (password === '') {
            displayError($passwordInput, 'Please enter a password');
            isValid = false;
        } else if (password.length < 6) {
            displayError($passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    // --- Sign Up button click ---
    $signUpBtn.on('click', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Simulate sign up (replace with actual API call)
        const userData = {
            fullName: $fullNameInput.val().trim(),
            email: $emailInput.val().trim(),
            password: $passwordInput.val().trim()
        };

        console.log('Sign up data:', userData);

        // TODO: Send to backend API
        alert('Sign up successful! Redirecting to dashboard...');
        window.location.href = '/dashboard/overview';
    });

    // --- Form submit ---
    $signupForm.on('submit', function (e) {
        e.preventDefault();
        $signUpBtn.click();
    });

    // --- Clear error on input ---
    $fullNameInput.on('input', function () {
        $(this).next(`.${ERROR_CLASS}`).remove();
    });

    $emailInput.on('input', function () {
        $(this).next(`.${ERROR_CLASS}`).remove();
    });

    $passwordInput.on('input', function () {
        $(this).next(`.${ERROR_CLASS}`).remove();
    });
});
