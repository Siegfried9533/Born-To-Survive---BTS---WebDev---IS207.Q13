// =======================================================
// Thông báo lỗi chung
// =======================================================

const ERROR_CLASS = 'dynamic-error-message';

/**
 * Hiển thị thông báo lỗi động ngay sau phần tử input được chỉ định.
 * * @param {jQuery} inputElement - Đối tượng jQuery của thẻ input
 * @param {string} message - Nội dung thông báo lỗi
 */
function displayError(inputElement, message) {
    inputElement.next(`.${ERROR_CLASS}`).remove();

    const $errorDiv = $('<div>')
        .addClass(`text-danger fs-small mt-1 ${ERROR_CLASS}`)
        .text(message);

    inputElement.after($errorDiv);
    inputElement.focus();
}

function clearAllErrors() {
    $(`.${ERROR_CLASS}`).remove();
}

// --- Hàm kiểm tra định dạng email ---
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== Loading Effect =====
window.addEventListener("load", () => {
    const loader = document.getElementById("loading");
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 400);
    }, 1000);
});

// Hiệu ứng loading (fade-in khi trang xuất hiện)
window.addEventListener("load", () => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const loading = document.getElementById("loading-screen");
    const page = document.querySelector(".fade-page");

    setTimeout(() => {
        loading.style.opacity = "0";
        setTimeout(() => {
            loading.style.display = "none";
            page.classList.add("loaded");
        }, 600);
    }, 800);
});

// Hiệu ứng chuyển trang mượt (fade-out)
document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#")) {
            e.preventDefault();
            document.querySelector(".fade-page").classList.remove("loaded");
            setTimeout(() => {
                window.scrollTo(0, 0);
                window.location.href = href;
            }, 500);
        }
    });
});

