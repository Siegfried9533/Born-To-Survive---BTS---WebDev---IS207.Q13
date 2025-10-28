// =======================================================
// 1. Thông báo lỗi chung
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

// =======================================================
// 2. Xử lí loading và effect
// =======================================================
window.addEventListener("load", () => {
    const loader = document.getElementById("loading");
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 400);
    }, 1000);
});

// Hiệu ứng loading (fade-in khi trang xuất hiện)
$(window).on("load", function () {
    window.history.scrollRestoration = "manual";
    $(window).scrollTop(0);

    const $loadingScreen = $("#loading-screen");
    const $fadePage = $(".fade-page");

    if ($loadingScreen.length) {
        setTimeout(function () {
            $loadingScreen.css("opacity", "0");

            setTimeout(function () {
                $loadingScreen.hide();

                if ($fadePage.length) {
                    $fadePage.addClass("loaded");
                }
            }, 600);
        }, 800);
    } else if ($fadePage.length) {
        $fadePage.addClass("loaded");
    }
});

// Hiệu ứng chuyển trang mượt (fade-out)
$(document).ready(function () {
    $("a").on("click", function (e) {
        const href = $(this).attr("href");

        // Tránh áp dụng hiệu ứng cho các link không hợp lệ hoặc link neo (#)
        if (href && !href.startsWith("#") && href.trim() !== '') {
            e.preventDefault();

            const $fadePage = $(".fade-page");

            if ($fadePage.length) {
                $fadePage.removeClass("loaded");

                setTimeout(function () {
                    $(window).scrollTop(0);
                    window.location.href = href;
                }, 500);
            } else {
                window.location.href = href;
            }
        }
    });
});

// 3. Load components
$(document).ready(function () {
    loadComponents();

    // --- Logic sidebar (sau khi gọi components) ---
    function setupSidebarLogic() {
        // Xử lý Sidebar Toggle (Đóng/Mở Submenu)
        $('.menu-item.has-submenu > .menu-link').on('click', function (e) {
            e.preventDefault();

            const $link = $(this);
            const $item = $link.parent('.menu-item');
            const $submenu = $item.find('.submenu');

            // Toggle (Đóng/Mở) submenu hiện tại
            $link.toggleClass('collapsed');
            $submenu.toggleClass('show');

            // Loại bỏ trạng thái 'active' và đóng các submenu khác
            $('.menu-item.has-submenu').not($item).each(function () {
                $(this).find('.menu-link').addClass('collapsed');
                $(this).find('.submenu').removeClass('show');
            });

            // Xử lý active state:
            if (!$link.hasClass('collapsed')) {
                $item.addClass('active');
            } else {
                $item.removeClass('active');
            }

            // Đảm bảo chỉ có một mục không có submenu được active tại một thời điểm
            $('.menu-item').not($item).not('.has-submenu').removeClass('active');
        });

        // Xử lý Active cho mục không có submenu
        $('.menu-item:not(.has-submenu) > .menu-link').on('click', function (e) {
            e.preventDefault();

            const $item = $(this).parent('.menu-item');

            $('.sidebar-menu .menu-item').removeClass('active');
            $('.sidebar-menu .submenu').removeClass('show');
            $('.sidebar-menu .has-submenu .menu-link').addClass('collapsed');

            $item.addClass('active');
        });
    }

    // HÀM NHÚNG COMPONENT (có mở rộng)
    function loadComponents() {
        const $sidebarPlaceholder = $('#sidebar');

        if ($sidebarPlaceholder.length) {
            $sidebarPlaceholder.load('../components/sidebar.html', function (response, status, xhr) {
                if (status == "error") {
                    console.error("Lỗi khi tải component Sidebar: " + xhr.status + " " + xhr.statusText);
                } else {
                    setupSidebarLogic();
                }
            });
        }
    }
});
