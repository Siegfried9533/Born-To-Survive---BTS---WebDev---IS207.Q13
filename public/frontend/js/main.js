if (
    typeof dayjs !== "undefined" &&
    window.dayjs_plugin_utc &&
    window.dayjs_plugin_timezone &&
    window.dayjs_plugin_customParseFormat
) {
    dayjs.extend(window.dayjs_plugin_utc);
    dayjs.extend(window.dayjs_plugin_timezone);
    dayjs.extend(window.dayjs_plugin_customParseFormat);
}

// =======================================================
// 1. Thông báo lỗi chung
// =======================================================
const ERROR_CLASS = "dynamic-error-message";
/**
 * Hiển thị thông báo lỗi động ngay sau phần tử input được chỉ định.
 * * @param {jQuery} inputElement - Đối tượng jQuery của thẻ input
 * @param {string} message - Nội dung thông báo lỗi
 */
function displayError(inputElement, message) {
    inputElement.next(`.${ERROR_CLASS}`).remove();

    const $errorDiv = $("<div>")
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
    // Sửa: Gắn sự kiện vào 'document' để bắt tất cả các thẻ <a>
    // ngay cả khi chúng được tải động (dynamic)
    $(document).on("click", "a", function (e) {
        // Skip links marked to avoid fade or the logout button — leave their handlers alone
        if ($(this).data("no-fade") || $(this).attr("id") === "btnLogout") {
            return;
        }

        const href = $(this).attr("href");

        // Tránh áp dụng hiệu ứng cho các link không hợp lệ hoặc link neo (#)
        if (href && !href.startsWith("#") && href.trim() !== "") {
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

/* ========================= */
/* COMPONENT LOADER          
/* ========================= */
$(function () {
    const componentsPath = "../components/";

    // 1. Tải Header
    $("#app-header").load(
        componentsPath + "header.html",
        function (response, status, xhr) {
            if (status == "success") {
                initLitepicker();
                // Đã XÓA initFilterComponent() khỏi đây

                // Attach logout handler after header injection. This ensures
                // clicks always clear client auth and redirect even when
                // inline onclick is blocked by CSP or other issues.
                try {
                    const attachLogout = () => {
                        const logoutEl = document.getElementById("btnLogout");
                        if (!logoutEl) return;
                        if (logoutEl.__logoutBound) return;
                        logoutEl.__logoutBound = true;

                        logoutEl.addEventListener("click", async function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                                if (
                                    window.App &&
                                    typeof App.apiPost === "function"
                                ) {
                                    await App.apiPost("/auth/logout", {});
                                }
                            } catch (err) {
                                console.error("Logout API error:", err);
                            }

                            try {
                                if (
                                    window.App &&
                                    typeof App.clearAuth === "function"
                                ) {
                                    App.clearAuth();
                                } else {
                                    localStorage.removeItem("access_token");
                                    localStorage.removeItem("user");
                                }
                            } catch (e) {
                                console.error("Clear auth error", e);
                            }

                            window.location.href = "/frontend/index.html";
                        });
                    };

                    setTimeout(attachLogout, 0);
                } catch (e) {
                    console.error("Attach logout handler failed", e);
                }
            } else {
                console.error(
                    "Lỗi khi tải header.html: " +
                        xhr.status +
                        " " +
                        xhr.statusText
                );
            }
        }
    );

    // 2. Tải Footer
    $("#app-footer").load(componentsPath + "footer.html");

    // 3. Tải Sidebar
    $("#sidebar").load(
        componentsPath + "sidebar.html",
        function (response, status, xhr) {
            if (status == "success") {
                initSidebar();
            } else if (status == "error") {
                console.error(
                    "Lỗi khi tải sidebar.html: " +
                        xhr.status +
                        " " +
                        xhr.statusText
                );
                $("#sidebar").html("<p>Lỗi tải menu. Vui lòng thử lại.</p>");
            }
        }
    );

    // 4. Tải FILTER (MỚI)
    $("#filter-container").load(
        componentsPath + "filter.html",
        function (response, status, xhr) {
            if (status == "success") {
                // Chạy hàm init cho filter SAU KHI HTML của nó đã được tải
                initFilterComponent();
            } else if (status == "error") {
                console.error(
                    "Lỗi khi tải filter.html: " +
                        xhr.status +
                        " " +
                        xhr.statusText
                );
            }
        }
    );

    // chỉ chạy khi ở trang profile.html
    if ($("main.page-profile").length > 0) {
        initProfilePage();
    }
});

/* ========================== */
/* SIDEBAR INTERACTIVE LOGIC  
/* ========================== */
// function initSidebar() {
//     const sidebar = document.querySelector("#sidebar");
//     if (!sidebar) return; // Sidebar chưa load

//     const menuItems = sidebar.querySelectorAll(".menu-item");
//     if (!menuItems.length) return;

//     menuItems.forEach((item) => {
//         const link = item.querySelector(".menu-link");
//         if (!link) return;

//         // ===================================
//         // LOGIC CLICK (Active + Submenu)
//         // ===================================
//         link.addEventListener("click", function (e) {
//             // 1. XÓA active của tất cả menu
//             // *** LƯU Ý: Phần này cũng xóa style hover inline ***
//             menuItems.forEach((mi) => {
//                 mi.classList.remove("active");

//                 // XÓA HOVER INLINE (do mouseenter/leave tạo ra)
//                 const ml = mi.querySelector(".menu-link");
//                 if (ml) {
//                     ml.style.backgroundColor = "";
//                     ml.style.color = "";
//                     ml.style.boxShadow = "";
//                     mi.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
//                         (icon) => {
//                             icon.style.color = "";
//                         }
//                     );
//                 }
//             });

//             // 2. THÊM active cho menu được click
//             item.classList.add("active");
//             // Khi 'active' được thêm, style .active từ CSS sẽ tự động áp dụng

//             // 3. XỬ LÝ SUBMENU (nếu có)
//             if (item.classList.contains("has-submenu")) {
//                 e.preventDefault();

//                 const submenu = item.querySelector(".submenu");

//                 // ** SỬA LỖI: Dùng class '.show' để khớp với CSS của bạn **
//                 const isOpen = submenu.classList.contains("show");

//                 // 1. ĐÓNG TẤT CẢ submenu KHÁC
//                 document.querySelectorAll(".has-submenu .submenu").forEach((s) => {
//                     if (s !== submenu) s.classList.remove("show");
//                 });
//                 document.querySelectorAll(".has-submenu .menu-link").forEach((l) => {
//                     if (l !== link) l.classList.add("collapsed");
//                 });

//                 // 2. MỞ/ĐÓNG submenu HIỆN TẠI
//                 if (!isOpen) {
//                     link.classList.remove("collapsed");
//                     submenu.classList.add("show");
//                 } else {
//                     link.classList.add("collapsed");
//                     submenu.classList.remove("show");
//                 }
//             }
//         });

//         // ===================================
//         // LOGIC HOVER (Giữ theo yêu cầu)
//         // ===================================
//         item.addEventListener("mouseenter", function () {
//             if (!this.classList.contains("active")) {
//                 const ml = this.querySelector(".menu-link");
//                 ml.style.backgroundColor = "var(--primary)";
//                 ml.style.color = "var(--white)";
//                 ml.style.boxShadow = "0 4px 6px rgba(79, 209, 197, 0.3)";
//                 this.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
//                     (icon) => {
//                         icon.style.color = "var(--white)";
//                     }
//                 );
//             }
//         });

//         item.addEventListener("mouseleave", function () {
//             if (!this.classList.contains("active")) {
//                 const ml = this.querySelector(".menu-link");
//                 ml.style.backgroundColor = "";
//                 ml.style.color = "";
//                 ml.style.boxShadow = "";
//                 this.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
//                     (icon) => {
//                         icon.style.color = "";
//                     }
//                 );
//             }
//         });

//     });
// }

/* ======================================================= */
/* SIDEBAR INTERACTIVE LOGIC
/* ======================================================= */
function initSidebar() {
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) {
        console.warn("Sidebar not found, skipping init.");
        return;
    }

    const menuItems = sidebar.querySelectorAll(".menu-item");
    const submenuItems = sidebar.querySelectorAll(".submenu-item");

    if (!menuItems.length) return;

    function clearAllActiveStyles() {
        menuItems.forEach((mi) => {
            mi.classList.remove("active");
            const ml = mi.querySelector(".menu-link");
            if (ml) {
                ml.style.backgroundColor = "";
                ml.style.color = "";
                ml.style.boxShadow = "";
                mi.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
                    (icon) => {
                        icon.style.color = "";
                    }
                );
            }
        });
        submenuItems.forEach((si) => si.classList.remove("active"));
    }
    function closeAllSubmenus() {
        sidebar.querySelectorAll(".has-submenu .submenu").forEach((s) => {
            s.classList.remove("show");
        });
        sidebar.querySelectorAll(".has-submenu .menu-link").forEach((l) => {
            l.classList.add("collapsed");
        });
    }

    // ==================================================
    // TỰ ĐỘNG ACTIVE MENU KHI TẢI TRANG
    // ==================================================

    // 1. Lấy tên file của trang hiện tại (ví dụ: "overview.html")
    const currentFile = window.location.pathname.split("/").pop();
    // Nếu path rỗng (trang chủ), mặc định là "overview.html"
    const currentFilename = currentFile === "" ? "overview.html" : currentFile;

    let activeLinkFound = false;

    // 1a. Kiểm tra các link submenu con
    submenuItems.forEach((subItem) => {
        const subLink = subItem.querySelector("a");
        if (subLink) {
            const linkPath = subLink.getAttribute("href");
            if (linkPath && linkPath !== "#") {
                // Lấy tên file từ href (ví dụ: "top-category.html")
                const linkFile = linkPath.split("/").pop();

                // So sánh tên file
                if (linkFile && currentFilename === linkFile) {
                    subItem.classList.add("active");
                    activeLinkFound = true;

                    const parentMenuItem = subItem.closest(
                        ".menu-item.has-submenu"
                    );
                    if (parentMenuItem) {
                        parentMenuItem.classList.add("active");
                        parentMenuItem
                            .querySelector(".menu-link")
                            .classList.remove("collapsed");
                        parentMenuItem
                            .querySelector(".submenu")
                            .classList.add("show");
                    }
                }
            }
        }
    });

    // 1b. Nếu không tìm thấy ở con, kiểm tra các link cha
    if (!activeLinkFound) {
        menuItems.forEach((item) => {
            if (!item.classList.contains("has-submenu")) {
                const link = item.querySelector(".menu-link");
                const linkPath = link.getAttribute("href");

                if (linkPath && linkPath !== "#") {
                    // Lấy tên file từ href
                    const linkFile = linkPath.split("/").pop();

                    // So sánh tên file
                    if (linkFile && currentFilename === linkFile) {
                        item.classList.add("active");
                        activeLinkFound = true;
                    }
                }
            }
        });
    }

    // (Nếu là profile.html, href không có trong sidebar -> không active -> OK)
    menuItems.forEach((item) => {
        const link = item.querySelector(".menu-link");
        if (!link) return;

        link.addEventListener("click", function (e) {
            clearAllActiveStyles();
            item.classList.add("active");

            if (item.classList.contains("has-submenu")) {
                e.preventDefault();
                const submenu = item.querySelector(".submenu");
                const isOpen = submenu.classList.contains("show");
                closeAllSubmenus();
                if (!isOpen) {
                    link.classList.remove("collapsed");
                    submenu.classList.add("show");
                }
            } else {
                closeAllSubmenus();
            }
        });

        // --- Logic Hover (Giữ nguyên) ---
        item.addEventListener("mouseenter", function () {
            if (!this.classList.contains("active")) {
                const ml = this.querySelector(".menu-link");
                ml.style.backgroundColor = "var(--primary)";
                ml.style.color = "var(--white)";
                ml.style.boxShadow = "0 4px 6px rgba(79, 209, 197, 0.3)";
                this.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
                    (icon) => {
                        icon.style.color = "var(--white)";
                    }
                );
            }
        });
        item.addEventListener("mouseleave", function () {
            if (!this.classList.contains("active")) {
                const ml = this.querySelector(".menu-link");
                ml.style.backgroundColor = "";
                ml.style.color = "";
                ml.style.boxShadow = "";
                this.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
                    (icon) => {
                        icon.style.color = "";
                    }
                );
            }
        });
    });

    submenuItems.forEach((subItem) => {
        const subLink = subItem.querySelector("a");
        if (!subLink) return;

        subLink.addEventListener("click", function (e) {
            clearAllActiveStyles();
            subItem.classList.add("active");
            const parentMenuItem = this.closest(".menu-item.has-submenu");
            if (parentMenuItem) {
                parentMenuItem.classList.add("active");
            }
        });
    });

    console.log("Sidebar đã được khởi tạo với logic so sánh tên file.");
}

/* ======================================================= */
/* KHỞI TẠO BỘ LỌC NGÀY 
/* ======================================================= */
function initLitepicker() {
    // 1. Lấy tất cả các phần tử DOM cần thiết (Không đổi)
    const triggerBtn = document.getElementById("calendarTriggerBtn");
    const startDateDisplay = document.getElementById("startDateDisplay");
    const endDateDisplay = document.getElementById("endDateDisplay");
    const startDateHidden = document.getElementById("startDate");
    const endDateHidden = document.getElementById("endDate");

    // 2. Kiểm tra (Không đổi)
    if (
        !triggerBtn ||
        !startDateDisplay ||
        !endDateDisplay ||
        !startDateHidden ||
        !endDateHidden
    ) {
        console.warn(
            "Không tìm thấy các phần tử (button/inputs) để khởi tạo Litepicker."
        );
        return;
    }

    // 3. Lấy giá trị ban đầu và Định dạng (Không đổi)
    const initialStart = startDateHidden.value;
    const initialEnd = endDateHidden.value;
    const DISPLAY_FORMAT = "DD MMMM YYYY";
    const DATA_FORMAT = "DD-MM-YYYY";

    // 4. Cấu hình (Không đổi)
    const picker = new Litepicker({
        element: startDateHidden,
        singleMode: false,
        allowRepick: true,
        format: DATA_FORMAT,
        startDate: initialStart,
        endDate: initialEnd,
        splitView: true,
        numberOfMonths: 2,
        numberOfColumns: 2,
    });

    // 5. Cập nhật hiển thị ban đầu (ĐÃ THÊM 2 DÒNG .size)
    const initialStartDateObj = picker.getStartDate();
    const initialEndDateObj = picker.getEndDate();
    if (initialStartDateObj && initialEndDateObj) {
        // Cập nhật giá trị
        startDateDisplay.value = initialStartDateObj.format(DISPLAY_FORMAT);
        endDateDisplay.value = initialEndDateObj.format(DISPLAY_FORMAT);

        // *** THÊM MỚI: Cập nhật size (co dãn) ***
        startDateDisplay.size = startDateDisplay.value.length;
        endDateDisplay.size = endDateDisplay.value.length;
    }

    // 6. Lắng nghe sự kiện CHỌN XONG (ĐÃ THÊM 2 DÒNG .size)
    picker.on("selected", (date1, date2) => {
        // Cập nhật giá trị
        startDateDisplay.value = date1.format(DISPLAY_FORMAT);
        endDateDisplay.value = date2.format(DISPLAY_FORMAT);

        startDateHidden.value = date1.format(DATA_FORMAT);
        endDateHidden.value = date2.format(DATA_FORMAT);

        // *** THÊM MỚI: Cập nhật size (co dãn) ***
        startDateDisplay.size = startDateDisplay.value.length;
        endDateDisplay.size = endDateDisplay.value.length;
    });

    // 7. "Cầu nối" Click (Không đổi)
    triggerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        picker.show(triggerBtn);
    });

    console.log("Litepicker đã được khởi tạo và gắn vào icon!");
}

/* ======================================================= */
/* KHỞI TẠO COMPONENT FILTER 
/* ======================================================= */
function initFilterComponent() {
    const $filterGroups = $(".filter-group");
    if (!$filterGroups.length) {
        console.warn("Không tìm thấy .filter-group để khởi tạo.");
        return;
    }

    // --- Helper 1: Cập nhật text hiển thị ---
    function updateDisplayText($group) {
        const $displayText = $group.find(".filter-display-text");
        const $checkedInputs = $group.find("input:checked");

        if ($checkedInputs.length === 0) {
            $displayText.html("&nbsp;").removeClass("has-selection");
        } else {
            const selectedValues = $checkedInputs
                .map(function () {
                    return $(this).val();
                })
                .get()
                .join(", ");

            $displayText.text(selectedValues).addClass("has-selection");
        }
    }

    // --- Helper 2: Xử lý giới hạn (max) ---
    function handleSelectionLimits($group) {
        const maxCount = parseInt($group.attr("data-max"), 10);
        if (!maxCount) return;

        const $checkboxes = $group.find('input[type="checkbox"]');
        const checkedCount = $group.find(
            'input[type="checkbox"]:checked'
        ).length;

        if (checkedCount >= maxCount) {
            $checkboxes
                .not(":checked")
                .prop("disabled", true)
                .closest(".filter-item")
                .addClass("disabled");
        } else {
            $checkboxes
                .prop("disabled", false)
                .closest(".filter-item")
                .removeClass("disabled");
        }
    }

    // --- Helper 3: Tự động tạo Category (thay cho document.write) ---
    function generateCategories() {
        // Nhắm vào dropdown của group category bằng ID
        const $categoryDropdown = $("#category-filter-group .filter-dropdown");
        if (!$categoryDropdown.length) return;

        let categoryHTML = "";
        for (let i = 1; i <= 12; i++) {
            categoryHTML += `
                <div class="filter-item">
                    <input type="checkbox" id="cat${i}" value="Category ${i}">
                    <label for="cat${i}">Category ${i}</label>
                </div>
            `;
        }

        // Chèn HTML category vào sau header (nếu có)
        const $header = $categoryDropdown.find(".filter-dropdown-header");
        if ($header.length) {
            $header.after(categoryHTML); // Chèn sau header
        } else {
            $categoryDropdown.html(categoryHTML); // Chèn trực tiếp
        }
    }

    // --- 1. Thêm header "Chọn tối đa X" ---
    $filterGroups.each(function () {
        const $group = $(this);
        const maxCount = parseInt($group.attr("data-max"), 10);
        // Kiểm tra xem header đã tồn tại chưa
        if (maxCount && $group.find(".filter-dropdown-header").length === 0) {
            const $header = $("<div></div>")
                .addClass("filter-dropdown-header")
                .html(`Select up to ${maxCount} <hr>`);
            $group.find(".filter-dropdown").prepend($header);
        }
    });

    generateCategories();

    // --- 2. Mở/đóng dropdown khi click vào box ---
    // Sửa: Dùng ID selector '#filter-container'
    $("#filter-container").on("click", ".filter-display-box", function (e) {
        e.stopPropagation();
        const $currentGroup = $(this).closest(".filter-group");
        $(".filter-group").not($currentGroup).removeClass("open");
        $currentGroup.toggleClass("open");
    });

    // --- 3. Xử lý khi chọn một item (change) ---
    // Sửa: Dùng ID selector '#filter-container'
    $("#filter-container").on(
        "change",
        'input[type="checkbox"], input[type="radio"]',
        function () {
            const $group = $(this).closest(".filter-group");

            handleSelectionLimits($group);
            updateDisplayText($group);

            if ($(this).is(":radio")) {
                $group.removeClass("open");
            }
        }
    );

    // --- 4. Đóng dropdown khi click ra ngoài ---
    $(window).on("click", function () {
        $filterGroups.removeClass("open");
    });

    // --- 5. Ngăn click BÊN TRONG dropdown làm đóng dropdown ---
    // Sửa: Dùng ID selector '#filter-container'
    $("#filter-container").on("click", ".filter-dropdown", function (e) {
        e.stopPropagation();
    });

    // --- 6. Khởi tạo trạng thái ban đầu ---
    $filterGroups.each(function () {
        const $group = $(this);
        updateDisplayText($group);
        handleSelectionLimits($group);
    });

    console.log("Filter component đã được khởi tạo.");
}

/* ======================================================= */
/* 7. KHỞI TẠO LOGIC TRANG PROFILE (NÂNG CẤP)
/* ======================================================= */
function initProfilePage() {
    // --- (Phần 1: Logic Edit/Save và DoB Picker giữ nguyên) ---
    const dobPicker = flatpickr("#dob-picker", {
        dateFormat: "Y-m-d",
        allowInput: false,
    });

    const $editButton = $("#btn-edit-profile");
    const $profileInputs = $(".profile-input");
    const $dobPickerInput = $("#dob-picker");

    $editButton.on("click", function () {
        const $this = $(this);
        if ($this.text() === "Edit") {
            $profileInputs.prop("disabled", false);
            $dobPickerInput.prop("disabled", false);
            $this
                .text("Save")
                .removeClass("btn-primary")
                .addClass("btn-success");
        } else {
            $profileInputs.prop("disabled", true);
            $dobPickerInput.prop("disabled", true);
            $this
                .text("Edit")
                .removeClass("btn-success")
                .addClass("btn-primary");
        }
    });

    // =============================================
    // --- PHẦN 2: LOGIC LỊCH TASK (NÂNG CẤP) ---
    // =============================================

    // 1. Cấu trúc dữ liệu Task (Lưu nhiều task, thời gian, trạng thái)
    let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || {};
    /* Cấu trúc mẫu:
    tasks = {
      "2025-11-10": [
        { "id": 167888, "time": "09:00", "text": "Task A", "completed": false },
        { "id": 167999, "time": "14:30", "text": "Task B", "completed": true }
      ]
    }
    */

    // 2. Lấy các phần tử UI
    const $taskAddForm = $("#task-add-form");
    const $taskFormLabel = $("#task-form-label");
    const $taskTimeInput = $("#task-time-input"); // (Task 2)
    const $taskTextInput = $("#task-text-input");
    const $taskListArea = $("#task-list-area");
    const $taskNotificationArea = $("#task-notification-area"); // (Task 3)

    let currentSelectedDate = null; // Biến lưu ngày đang chọn

    // 3. Khởi tạo Input chọn giờ (Task 2)
    const timePicker = flatpickr($taskTimeInput, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i", // 24h format (VD: 14:30)
    });

    // 4. Các hàm Helper
    function saveTasks() {
        localStorage.setItem("calendarTasks", JSON.stringify(tasks));
    }
    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    // === TASK 3: HÀM HIỂN THỊ THÔNG BÁO ===
    function showTaskMessage(message, isError = false) {
        const $notification = $("<div></div>")
            .addClass("task-notification")
            .addClass(isError ? "error" : "success")
            .text(message);

        $taskNotificationArea.html($notification);

        // Tự động biến mất sau 3.5 giây
        setTimeout(() => {
            $notification.fadeOut(500, function () {
                $(this).remove();
            });
        }, 3500);
    }
    // (Xóa lỗi của riêng form thêm task)
    function clearFormErrors() {
        $taskTimeInput.next(`.${ERROR_CLASS}`).remove();
        $taskTextInput.next(`.${ERROR_CLASS}`).remove();
    }

    // === TASK 4: HÀM HIỂN THỊ DANH SÁCH TASK CHO 1 NGÀY ===
    function renderTasksForDay(dateStr) {
        $taskListArea.empty(); // Xóa list cũ
        const dayTasks = tasks[dateStr] || [];

        if (dayTasks.length === 0) {
            $taskListArea.html(
                '<p class="text-muted text-center fs-small mt-2">No tasks for this day.</p>'
            );
            return;
        }

        // Sắp xếp task theo thời gian
        dayTasks.sort((a, b) => (a.time > b.time ? 1 : -1));

        dayTasks.forEach((task) => {
            const isCompleted = task.completed;
            const itemClass = isCompleted ? "task-item completed" : "task-item";
            const completeIcon = isCompleted ? "fa-undo" : "fa-check";
            const completeText = isCompleted ? "Undo" : "Done";

            const taskHTML = `
                <div class="${itemClass}" data-task-id="${task.id}">
                    <span class="task-item-time">${task.time}</span>
                    <div class="task-item-text">
                        ${task.text}
                    </div>
                    <div class="task-item-actions d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary btn-complete">
                            <i class="fa-solid ${completeIcon} me-1"></i> ${completeText}
                        </button>
                        <button class="btn btn-sm btn-delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            $taskListArea.append(taskHTML);
        });
    }

    // 5. Khởi tạo Lịch Widget (Nâng cấp)
    const calendarWidget = flatpickr("#flatpickr-calendar", {
        inline: true,
        dateFormat: "Y-m-d",

        // === TASK 4: VẼ BORDER ĐỎ CHO NGÀY CÓ TASK ===
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const date = dayjs(dObj).format("YYYY-MM-DD");
            const dayTasks = tasks[date] || [];

            // Chỉ thêm border nếu có task VÀ ít nhất 1 task chưa hoàn thành
            if (
                dayTasks.length > 0 &&
                dayTasks.some((task) => !task.completed)
            ) {
                dayElem.classList.add("day-with-task");
            }
        },

        // === TASK 2 & 4: MỞ UI KHI CLICK VÀO 1 NGÀY ===
        onChange: function (selectedDates, dateStr, instance) {
            currentSelectedDate = dayjs(dateStr).format("YYYY-MM-DD");

            // Cập nhật label cho form Thêm Task
            $taskFormLabel.text(
                `Add Task for ${dayjs(dateStr).format("DD MMMM, YYYY")}`
            );

            // Hiển thị danh sách task (Task 4)
            renderTasksForDay(currentSelectedDate);

            // Hiển thị form thêm task (Task 2)
            $taskAddForm.slideDown(200);
            clearFormErrors(); // Xóa lỗi cũ
        },
    });

    // 6. Logic các nút

    // === TASK 2: SUBMIT FORM THÊM TASK MỚI ===
    $taskAddForm.on("submit", function (e) {
        e.preventDefault(); // Ngăn tải lại trang
        clearFormErrors(); // Xóa lỗi cũ

        const taskTime = $taskTimeInput.val();
        const taskText = $taskTextInput.val();

        // === TASK 2: VALIDATE (KIỂM TRA TRỐNG) ===
        let isValid = true;
        if (!taskTime) {
            // Dùng hàm thông báo lỗi chung của bạn
            displayError($taskTimeInput, "Please select a time.");
            isValid = false;
        }
        if (!taskText) {
            displayError($taskTextInput, "Please enter task details.");
            isValid = false;
        }
        if (!isValid || !currentSelectedDate) return;

        // Tạo task mới
        const newTask = {
            id: generateId(),
            time: taskTime,
            text: taskText,
            completed: false,
        };

        // Thêm vào data
        if (!tasks[currentSelectedDate]) {
            tasks[currentSelectedDate] = [];
        }
        tasks[currentSelectedDate].push(newTask);

        saveTasks();
        calendarWidget.redraw(); // Vẽ lại lịch (để thêm border đỏ)
        renderTasksForDay(currentSelectedDate); // Cập nhật list

        // Reset form
        $taskTextInput.val("");
        timePicker.clear();

        // === TASK 3: HIỂN THỊ THÔNG BÁO THÀNH CÔNG ===
        showTaskMessage("Task added successfully!");
    });

    // === TASK 4: CLICK NÚT COMPLETE/DELETE (Dùng Event Delegation) ===
    $taskListArea.on("click", ".btn-delete", function () {
        const $taskItem = $(this).closest(".task-item");
        const taskId = $taskItem.data("task-id");

        // Xóa task khỏi mảng
        let dayTasks = tasks[currentSelectedDate];
        tasks[currentSelectedDate] = dayTasks.filter(
            (task) => task.id !== taskId
        );

        saveTasks();
        calendarWidget.redraw(); // Vẽ lại lịch (có thể xóa border)
        renderTasksForDay(currentSelectedDate); // Cập nhật list
    });

    $taskListArea.on("click", ".btn-complete", function () {
        const $taskItem = $(this).closest(".task-item");
        const taskId = $taskItem.data("task-id");

        // Tìm và thay đổi trạng thái
        let dayTasks = tasks[currentSelectedDate];
        const taskToToggle = dayTasks.find((task) => task.id === taskId);

        if (taskToToggle) {
            taskToToggle.completed = !taskToToggle.completed; // Đảo trạng thái
        }

        saveTasks();
        calendarWidget.redraw(); // Vẽ lại lịch (có thể xóa/thêm border)
        renderTasksForDay(currentSelectedDate); // Cập nhật list
    });

    // --- (Phần 7: Logic Timezone giữ nguyên) ---
    const $timeZoneSelect = $("#timeZone");
    function updateCalendarToday() {
        const selectedTZ = $timeZoneSelect.val();
        const todayInTZ = dayjs.tz(Date.now(), selectedTZ).format("YYYY-MM-DD");
        // Sửa: Dùng 'set Date' để đánh dấu ngày 'hôm nay'
        calendarWidget.setDate(todayInTZ, false);
    }
    $timeZoneSelect.on("change", updateCalendarToday);
    updateCalendarToday(); // Chạy lần đầu

    console.log("Trang Profile đã được khởi tạo (với Lịch Task Nâng Cao).");
}

/* ======================================================= */
/* OVERVIEW: ĐỌC FILE overview-data.txt → VẼ BIỂU ĐỒ */
/* ======================================================= */
function initOverviewChartsFromFile() {
    if (!document.getElementById("gmvEvolutionChart")) return;

    $.get("../../assets/fake-data/overview-data.txt", function (text) {
        const data = parseOverviewData(text);

        // Vẽ 3 biểu đồ
        renderGMVEvolution(data.GMV_Evolution);
        renderModalabSynthesis(data.Modalab_Synthesis);
        renderSalesChannels(data.Sales_Channels);
    }).fail(function () {
        console.error("Không tải được file overview-data.txt");
        alert(
            "Lỗi: Không tìm thấy dữ liệu. Vui lòng kiểm tra file /assets/fake-data/overview-data.txt"
        );
    });
}

function parseOverviewData(text) {
    const sections = {};
    let currentSection = null;

    text.split("\n").forEach((line) => {
        line = line.trim();
        if (!line || line.startsWith("#")) return;
        if (line.startsWith("[") && line.endsWith("]")) {
            currentSection = line.slice(1, -1);
            sections[currentSection] = {};
        } else if (currentSection && line.includes("=")) {
            const [key, value] = line.split("=");
            sections[currentSection][key.trim()] = value.trim();
        }
    });
    return sections;
}

// === 1. GMV Evolution (Line on top of Bar) ===
function renderGMVEvolution(data) {
    const ctx = document.getElementById("gmvEvolutionChart").getContext("2d");
    const labels = data.labels.split(",");
    const gmv = data.gmv.split(",").map(Number);
    const growth = data.growth.split(",").map(Number);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "GMV",
                    data: gmv,
                    backgroundColor: "#647acb",
                    borderRadius: 4,
                    barThickness: 18,
                    order: 2, // Cột ở dưới
                },
                {
                    type: "line",
                    label: "Growth",
                    data: growth,
                    borderColor: "#f6ad55",
                    backgroundColor: "#f6ad55",
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: "#f6ad55",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    yAxisID: "y1",
                    order: 1, // Đường ở trên
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label === "GMV") {
                                return `GMV: €${(
                                    context.parsed.y / 1000000
                                ).toFixed(1)}M`;
                            } else {
                                return `Growth: ${context.parsed.y.toFixed(
                                    1
                                )}%`;
                            }
                        },
                    },
                },
            },
            scales: {
                y: {
                    ticks: { callback: (v) => `€${(v / 1000000).toFixed(1)}M` },
                    grid: { color: "#e5e7eb" },
                },
                y1: {
                    position: "right",
                    ticks: { callback: (v) => `${v}%` },
                    grid: { drawOnChartArea: false },
                },
                x: { grid: { display: false } },
            },
        },
    });
}

// === 2. Modalab Synthesis ===
function renderModalabSynthesis(data) {
    const ctx = document.getElementById("modalabChart").getContext("2d");
    const labels = data.labels.split(",");
    const values = data.values.split(",").map(Number);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: "#647acb",
                    borderRadius: 6,
                    barThickness: 22,
                },
            ],
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.parsed.x}%`;
                        },
                    },
                },
            },
            scales: {
                x: { max: 6, ticks: { stepSize: 1, callback: (v) => `${v}%` } },
                y: { grid: { display: false } },
            },
        },
    });
}

// === 3. Sales Channels (Percentage of Products Sold) ===
function renderSalesChannels(data) {
    const ctx = document.getElementById("salesChannelsChart").getContext("2d");
    const labels = data.labels.split(",");
    const values = data.values.split(",").map(Number);
    const colors = data.colors.split(",");

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 4,
                    borderColor: "#fff",
                    hoverOffset: 12,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                legend: {
                    position: "right",
                    align: "center",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 16,
                        font: { size: 11.5, family: "Roboto" },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce(
                                (a, b) => a + b,
                                0
                            );
                            const percentage = ((value / total) * 100).toFixed(
                                1
                            );
                            return `${context.label}: ${percentage}%`;
                        },
                    },
                },
            },
        },
    });
}

// Cấu hình tooltip toàn cục (có thể override từng biểu đồ)
if (typeof Chart !== "undefined") {
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(0, 0, 0, 0.85)";
    Chart.defaults.plugins.tooltip.titleColor = "#fff";
    Chart.defaults.plugins.tooltip.bodyColor = "#fff";
    Chart.defaults.plugins.tooltip.borderColor = "#402dbaff";
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.titleFont = {
        size: 13,
        family: "Roboto",
        weight: "600",
    };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 12, family: "Roboto" };
}

/* GỌI KHI TRANG OVERVIEW */
$(document).ready(function () {
    if (window.location.pathname.includes("overview")) {
        initOverviewChartsFromFile();
    }
});

/* ======================================================= */
/* SALES */
/* ======================================================= */
function initSalesGrowthTable() {
    const dataPath = "../../assets/fake-data/growth-data.txt";

    $.get(dataPath, function (text) {
        const lines = text.split("\n");
        const $tbody = $("#growthTable tbody");
        $tbody.empty();

        let data = [];
        let totalOmni = 0;
        let totalInStore = 0;

        // === 1. ĐỌC DỮ LIỆU + TÍNH TỔNG ===
        lines.forEach((line) => {
            line = line.trim();
            if (!line || line.startsWith("#")) return;

            const cols = line.split("|");
            if (cols.length !== 7) return;

            const [rank, id, store, omni, omniGrowth, inStore, inStoreGrowth] =
                cols;
            const omniVal = parseInt(omni);
            const inStoreVal = parseInt(inStore);

            if (!isNaN(omniVal)) totalOmni += omniVal;
            if (!isNaN(inStoreVal)) totalInStore += inStoreVal;

            data.push({
                rank: parseInt(rank),
                id,
                store,
                omni: omniVal,
                omniGrowth: parseFloat(omniGrowth),
                inStore: inStoreVal,
                inStoreGrowth: parseFloat(inStoreGrowth),
            });
        });

        // === 2. SẮP XẾP MẶC ĐỊNH: OMNI GIẢM DẦN ===
        sortData("omni", false);

        // === 3. THÊM DÒNG TOTAL ===
        const totalRow = `
      <tr class="table-total bg-light">
        <td class="text-center"></td>
        <td class="text-center text-primary fw-bold">Total</td>
        <td class="ps-3 text-primary fw-bold">Store</td>
        <td class="text-end pe-4">
          <div class="value-euro">${totalOmni.toLocaleString("fr-FR")} €</div>
        </td>
        <td class="text-end pe-4">
          <div class="value-euro">${totalInStore.toLocaleString(
              "fr-FR"
          )} €</div>
        </td>
      </tr>
    `;
        $tbody.append(totalRow);

        // === 4. HIỂN THỊ DỮ LIỆU ===
        renderData();

        // === 5. HÀM SẮP XẾP ===
        function sortData(column, ascending) {
            data.sort((a, b) => {
                if (column === "store") {
                    return ascending
                        ? a.store.localeCompare(b.store)
                        : b.store.localeCompare(a.store);
                } else if (column === "omni") {
                    return ascending ? a.omni - b.omni : b.omni - a.omni;
                } else if (column === "instore") {
                    return ascending
                        ? a.inStore - b.inStore
                        : b.inStore - a.inStore;
                }
            });

            // Cập nhật rank
            data.forEach((row, i) => (row.rank = i + 1));
        }

        // === 6. HÀM RENDER DỮ LIỆU ===
        function renderData() {
            // Xóa dữ liệu cũ (giữ TOTAL)
            $tbody.find("tr:not(.table-total)").remove();

            data.forEach((row) => {
                let rankCell = "";
                if (row.rank === 1) {
                    rankCell = `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`;
                } else if (row.rank === 2) {
                    rankCell = `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`;
                } else if (row.rank === 3) {
                    rankCell = `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`;
                } else {
                    rankCell = `<div class="rank-normal">${row.rank}</div>`;
                }

                const formatPct = (p) => {
                    if (isNaN(p))
                        return '<span class="text-danger">NaN%</span>';
                    const color = p >= 0 ? "text-success" : "text-danger";
                    const sign = p >= 0 ? "+" : "";
                    return `<span class="${color} growth-pct">${sign}${p.toFixed(
                        2
                    )}%</span>`;
                };

                const dataRow = `
          <tr>
            <td class="text-center">${rankCell}</td>
            <td class="text-center text-muted fw-medium">${row.id}</td>
            <td class="ps-3 fw-semibold text-dark store-name">${row.store}</td>
            <td class="text-end pe-4">
              <div class="value-euro">${row.omni.toLocaleString(
                  "fr-FR"
              )} €</div>
              <div>${formatPct(row.omniGrowth)}</div>
            </td>
            <td class="text-end pe-4">
              <div class="value-euro">${row.inStore.toLocaleString(
                  "fr-FR"
              )} €</div>
              <div>${formatPct(row.inStoreGrowth)}</div>
            </td>
          </tr>
        `;
                $tbody.append(dataRow);
            });
        }

        // === 7. GÁN SỰ KIỆN SORT ===
        let currentSort = { col: "omni", asc: false };

        function applySort(col) {
            const asc = currentSort.col === col ? !currentSort.asc : false;
            currentSort = { col, asc };
            sortData(col, asc);
            renderData();

            // Cập nhật icon
            $(".sort-icon")
                .removeClass("fa-sort-up fa-sort-down")
                .addClass("fa-sort");
            $(`#sort-${col}`)
                .removeClass("fa-sort")
                .addClass(asc ? "fa-sort-up" : "fa-sort-down");
        }

        $("#sort-store")
            .off("click")
            .on("click", () => applySort("store"));
        $("#sort-omni")
            .off("click")
            .on("click", () => applySort("omni"));
        $("#sort-instore")
            .off("click")
            .on("click", () => applySort("instore"));

        // Mặc định: sort Omni giảm dần
        $("#sort-omni").removeClass("fa-sort").addClass("fa-sort-down");

        // === 8. DOWNLOAD CSV CÓ TOTAL ===
        $("#downloadBtn")
            .off("click")
            .on("click", function () {
                let csv =
                    "Rank,Id,Store,Omni,Omni Growth,InStore,InStore Growth\n";
                csv += `,Total,Store,${totalOmni},,${totalInStore},\n`;
                data.forEach((d) => {
                    csv += `${d.rank},${d.id},${d.store},${d.omni},${d.omniGrowth},${d.inStore},${d.inStoreGrowth}\n`;
                });
                const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "growth-gmv-data.csv";
                a.click();
                URL.revokeObjectURL(url);
            });
    }).fail(function () {
        $("#growthTable tbody").html(`
      <tr><td colspan="5" class="text-center text-danger py-4">
        Lỗi tải file: <code>${dataPath}</code>
      </td></tr>
    `);
    });
}

// GỌI KHI VÀO TRANG SALES
$(document).ready(function () {
    if (window.location.pathname.includes("sales")) {
        initSalesGrowthTable();
    }
});

/* ======================================================= */
/* TOP CATEGORY    */
/* ======================================================= */

function initTopCategory() {
    if ($("#topCategoryTable").length === 0) return;

    $.get("../../assets/fake-data/top-category-data.txt", function (text) {
        const lines = text
            .replace(/^\uFEFF/, "")
            .replace(/\r\n?/g, "\n")
            .trim()
            .split("\n");
        const $tbody = $("#topCategoryTable tbody");
        $tbody.empty();

        let data = [];
        let totalDelta = 0,
            totalInstore = 0;

        lines.forEach((line) => {
            if (!line.trim()) return;
            const c = line.split("|").map((s) => s.trim());
            if (c.length < 6) return;

            const deltaNum = parseFloat(c[3].replace(/[^\d.-]/g, "")) || 0;
            const instoreNum = parseFloat(c[5].replace(/[^\d.-]/g, "")) || 0;

            totalDelta += deltaNum;
            totalInstore += instoreNum;

            data.push({
                rank: 0,
                id: c[1],
                name: c[2], // dùng chung cho Family / Model
                deltaGMV: c[3],
                vnGrowth: c[4],
                instore: c[5],
                deltaNum,
                instoreNum,
            });
        });

        sortData("delta", false);
        render();

        function sortData(col, asc) {
            data.sort((a, b) =>
                asc
                    ? a[col + "Num"] - b[col + "Num"]
                    : b[col + "Num"] - a[col + "Num"]
            );
            data.forEach((r, i) => (r.rank = i + 1));
        }

        function render() {
            $tbody.empty();

            // TOTAL ROW – giống hệt Sales
            $tbody.append(`
                <tr class="table-total align-middle">
                    <td></td>
                    <td class="text-primary fw-bold">Total</td>
                    <td class="text-primary fw-bold">All Categories</td>
                    <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(
                        1
                    )}K pts</div></td>
                    <td class="text-end pe-4"><div class="value-main">${totalInstore.toLocaleString(
                        "fr-FR"
                    )} €</div></td>
                </tr>
            `);

            // DATA ROWS
            data.forEach((r) => {
                const rankCell =
                    r.rank === 1
                        ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
                        : r.rank === 2
                        ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
                        : r.rank === 3
                        ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
                        : `<div class="rank-normal">${r.rank}</div>`;

                const deltaClass =
                    r.deltaNum > 0 ? "text-success" : "text-danger";

                $tbody.append(`
                    <tr class="align-middle">
                        <td class="text-center">${rankCell}</td>
                        <td class="text-muted fw-medium">${r.id}</td>
                        <td class="item-name">${r.name}</td>
                        <td class="text-end pe-4"><div class="value-main ${deltaClass}">${r.deltaGMV}</div></td>
                        <td class="text-end pe-4"><div class="value-main text-primary">${r.instore}</div></td>
                    </tr>
                `);
            });
        }

        // Sort events – giống hệt Sales
        let sortState = { col: "delta", asc: false };
        function applySort(col) {
            sortState.asc = sortState.col === col ? !sortState.asc : false;
            sortState.col = col;
            sortData(col, sortState.asc);
            render();
            $("#topCategoryTable .sort-icon")
                .removeClass("fa-sort-up fa-sort-down")
                .addClass("fa-sort");
            $("#sort-" + col)
                .removeClass("fa-sort")
                .addClass(sortState.asc ? "fa-sort-up" : "fa-sort-down");
        }

        $("#sort-delta, #sort-instore")
            .off("click")
            .on("click", function () {
                applySort(this.id.split("-")[1]);
            });

        // Mặc định sort Delta giảm dần
        $("#sort-delta").removeClass("fa-sort").addClass("fa-sort-down");

        // Download CSV
        $("#downloadCategoryBtn")
            .off("click")
            .on("click", function () {
                let csv = "Rank,ID,Family,Delta GMV,VN Growth,InStore GMV\n";
                csv += `,Total,All Categories,${totalDelta.toFixed(
                    1
                )}K pts,,${totalInstore.toLocaleString("fr-FR")} €\n`;
                data.forEach(
                    (r) =>
                        (csv += `${r.rank},${r.id},${r.name},${r.deltaGMV},${r.vnGrowth},${r.instore}\n`)
                );
                const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "top-category-growth.csv";
                a.click();
                URL.revokeObjectURL(url);
            });
    }).fail(function () {
        $("#topCategoryTable tbody").html(
            '<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu top-category-data.txt</td></tr>'
        );
    });
}

/* ========================================================= */
/* TOP PRODUCTS  */
/* ========================================================= */
function initTopProducts() {
    if ($("#topProductsTable").length === 0) return;

    $.get("../../assets/fake-data/top-products-data.txt", function (text) {
        const lines = text
            .replace(/^\uFEFF/, "")
            .replace(/\r\n?/g, "\n")
            .trim()
            .split("\n");
        const $tbody = $("#topProductsTable tbody");
        $tbody.empty();

        let data = [];
        let totalDelta = 0,
            totalInstore = 0;

        lines.forEach((line) => {
            if (!line.trim()) return;
            const c = line.split("|").map((s) => s.trim());
            if (c.length < 6) return;

            const deltaNum = parseFloat(c[3].replace(/[^\d.-]/g, "")) || 0;
            const instoreNum = parseFloat(c[5].replace(/[^\d.-]/g, "")) || 0;

            totalDelta += deltaNum;
            totalInstore += instoreNum;

            data.push({
                rank: 0,
                id: c[1],
                name: c[2],
                deltaGMV: c[3],
                vnGrowth: c[4],
                instore: c[5],
                deltaNum,
                instoreNum,
            });
        });

        sortData("delta", false);
        render();

        function sortData(col, asc) {
            data.sort((a, b) =>
                asc
                    ? a[col + "Num"] - b[col + "Num"]
                    : b[col + "Num"] - a[col + "Num"]
            );
            data.forEach((r, i) => (r.rank = i + 1));
        }

        function render() {
            $tbody.empty();

            $tbody.append(`
                <tr class="table-total align-middle">
                    <td></td>
                    <td class="text-primary fw-bold">Total</td>
                    <td class="text-primary fw-bold">All Products</td>
                    <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(
                        2
                    )} pts</div></td>
                    <td class="text-end pe-4"><div class="value-main">${totalInstore.toLocaleString(
                        "fr-FR"
                    )} €</div></td>
                </tr>
            `);

            data.forEach((r) => {
                const rankCell =
                    r.rank === 1
                        ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
                        : r.rank === 2
                        ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
                        : r.rank === 3
                        ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
                        : `<div class="rank-normal">${r.rank}</div>`;

                const deltaClass =
                    r.deltaNum > 0 ? "text-success" : "text-danger";

                $tbody.append(`
                    <tr class="align-middle">
                        <td class="text-center">${rankCell}</td>
                        <td class="text-muted fw-medium">${r.id}</td>
                        <td class="item-name">${r.name}</td>
                        <td class="text-end pe-4"><div class="value-main ${deltaClass}">${r.deltaGMV}</div></td>
                        <td class="text-end pe-4"><div class="value-main text-primary">${r.instore}</div></td>
                    </tr>
                `);
            });
        }

        // Sort – giống hệt Category
        let sortState = { col: "delta", asc: false };
        function applySort(col) {
            sortState.asc = sortState.col === col ? !sortState.asc : false;
            sortState.col = col;
            sortData(col, sortState.asc);
            render();
            $("#topProductsTable .sort-icon")
                .removeClass("fa-sort-up fa-sort-down")
                .addClass("fa-sort");
            $("#topProductsTable #sort-" + col)
                .removeClass("fa-sort")
                .addClass(sortState.asc ? "fa-sort-up" : "fa-sort-down");
        }

        $("#topProductsTable").on(
            "click",
            "#sort-delta, #sort-instore",
            function () {
                applySort(this.id.split("-")[1]);
            }
        );

        $("#topProductsTable #sort-delta")
            .removeClass("fa-sort")
            .addClass("fa-sort-down");

        // Download CSV
        $("#downloadProductBtn")
            .off("click")
            .on("click", function () {
                let csv = "Rank,ID,Model,Delta GMV,VN Growth,InStore GMV\n";
                csv += `,Total,All Products,${totalDelta.toFixed(
                    2
                )} pts,,${totalInstore.toLocaleString("fr-FR")} €\n`;
                data.forEach(
                    (r) =>
                        (csv += `${r.rank},${r.id},${r.name},${r.deltaGMV},${r.vnGrowth},${r.instore}\n`)
                );
                const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "top-products-growth.csv";
                a.click();
                URL.revokeObjectURL(url);
            });
    }).fail(function () {
        $("#topProductsTable tbody").html(
            '<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu top-products-data.txt</td></tr>'
        );
    });
}

// GỌI KHI LOAD TRANG
$(document).ready(function () {
    initTopCategory();
    initTopProducts();
});

// =======================================================
// REPORT-CUSTOMERS
// =======================================================
function initCustomerEnglish() {
    if ($("#topCustomerTable").length === 0) return;

    const today = dayjs();
    $("#last-update").text(today.format("MMM DD, YYYY HH:mm"));

    // ==================== DỮ LIỆU GIẢ ĐẦY ĐỦ ====================
    const TOTAL_CUSTOMERS = 15211;
    const EVER_PURCHASED = 9876;
    const NEW_CUSTOMERS = 2134;

    const INACTIVE = { 30: 3124, 60: 1856, 90: 987, plus: 2909 };

    // Customer Overview
    $("#total-customers").text(TOTAL_CUSTOMERS.toLocaleString());
    $("#ever-purchased").text(EVER_PURCHASED.toLocaleString());
    $("#new-customers").text(NEW_CUSTOMERS.toLocaleString());
    $("#bar-purchased").css(
        "width",
        ((EVER_PURCHASED / TOTAL_CUSTOMERS) * 100).toFixed(1) + "%"
    );
    $("#bar-new").css(
        "width",
        ((NEW_CUSTOMERS / TOTAL_CUSTOMERS) * 100).toFixed(1) + "%"
    );

    // Gender Chart
    new Chart($("#genderChart"), {
        type: "doughnut",
        data: {
            labels: ["Male", "Female", "Unknown"],
            datasets: [
                {
                    data: [9482, 5644, 85],
                    backgroundColor: ["#3b82f6", "#ec4899", "#9ca3af"],
                    borderWidth: 3,
                    borderColor: "#fff",
                },
            ],
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: { legend: { display: false } },
        },
    });

    // Recency Table
    $("#recencyTable").html(`
    <thead>
        <tr class="table-light">
            <th rowspan="2" class="text-start">Purchase Cycle</th>
            <th colspan="4" class="sub-header">Days Since Last Purchase</th>
            <th rowspan="2">Total</th>
            <th rowspan="2">% Inactive Customers</th>
        </tr>
        <tr class="table-light">
            <th>1–30 days</th>
            <th>31–60 days</th>
            <th>61–90 days</th>
            <th>>90 days</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="text-start fw-bold">Inactive Customers</td>
            <td>3,124</td>
            <td>1,856</td>
            <td>987</td>
            <td>2,909</td>
            <td class="fw-bold">8,876</td>
            <td>-</td>
        </tr>
        <tr>
            <td class="text-start">1–30 days</td>
            <td>0</td><td>0</td><td>0</td><td>0</td>
            <td>0</td><td>0%</td>
        </tr>
        <tr>
            <td class="text-start">31–60 days</td>
            <td>0</td><td>0</td><td>0</td><td>0</td>
            <td>0</td><td>0%</td>
        </tr>
        <tr>
            <td class="text-start">61–90 days</td>
            <td>0</td><td>0</td><td>0</td><td>0</td>
            <td>0</td><td>0%</td>
        </tr>
        <tr>
            <td class="text-start">>90 days</td>
            <td>0</td><td>0</td><td>0</td><td>0</td>
            <td>0</td><td>0%</td>
        </tr>
        <tr class="total-row">
            <td class="text-start fw-bold">Total</td>
            <td>0</td><td>0</td><td>0</td><td>0</td>
            <td class="fw-bold">0</td><td>0%</td>
        </tr>
        <tr class="inactive-percent-row">
            <td class="text-start fw-bold">% Inactive Over Time</td>
            <td>0%</td><td>0%</td><td>0%</td><td>0%</td>
            <td class="fw-bold">100%</td><td></td>
        </tr>
        <tr class="at-risk-row">
            <td class="text-start fw-bold">At Risk / Lost Customers</td>
            <td>0</td><td>0</td><td>0</td><td>0</td>
            <td class="fw-bold">0 (0%)</td><td></td>
        </tr>
    </tbody>
`);

    // New Customer Segments
    $("#newCustomerTable").html(`
        <thead class="table-light"><tr><th>Segment</th><th class="text-center">Count</th><th class="text-center">% of Total</th></tr></thead>
        <tbody>
            <tr><td>First-time Buyer</td><td class="text-center">892</td><td class="text-center">5.9%</td></tr>
            <tr><td>New Card Created</td><td class="text-center">213</td><td class="text-center">1.4%</td></tr>
            <tr><td>One-time Buyer</td><td class="text-center">1,029</td><td class="text-center">6.8%</td></tr>
            <tr><td>Repeat Buyer (2+)</td><td class="text-center">487</td><td class="text-center">3.2%</td></tr>
            <tr><td>Dormant New Customers</td><td class="text-center">1,412</td><td class="text-center">9.3%</td></tr>
        </tbody>
    `);

    // Purchase Frequency
    $("#frequencyTable").html(`
        <thead class="table-light">
            <tr><th>Orders</th><th class="text-center">Customers</th><th class="text-center">% Customers</th><th class="text-end">Revenue</th><th class="text-center">% Revenue</th></tr>
        </thead>
        <tbody>
            <tr><td>1 order</td><td class="text-center">4,821</td><td class="text-center">48.8%</td><td class="text-end">0 ₫</td><td class="text-center">0%</td></tr>
            <tr><td>2 orders</td><td class="text-center">2,156</td><td class="text-center">21.8%</td><td class="text-end">0 ₫</td><td class="text-center">0%</td></tr>
            <tr><td>3 orders</td><td class="text-center">987</td><td class="text-center">10.0%</td><td class="text-end">0 ₫</td><td class="text-center">0%</td></tr>
            <tr><td>4+ orders</td><td class="text-center">1,912</td><td class="text-center">19.4%</td><td class="text-end">0 ₫</td><td class="text-center">0%</td></tr>
        </tbody>
    `);

    // Top Customers
    const top10 = [
        ["C001234", "John Smith", "12.4M ₫", 48],
        ["C005678", "Emma Wilson", "11.8M ₫", 42],
        ["C009012", "Michael Brown", "10.9M ₫", 39],
        ["C003456", "Sarah Davis", "9.7M ₫", 35],
        ["C007890", "James Lee", "8.9M ₫", 33],
        ["C002345", "Olivia Martinez", "8.5M ₫", 31],
        ["C006789", "William Garcia", "8.1M ₫", 30],
        ["C004567", "Sophia Rodriguez", "7.8M ₫", 29],
        ["C008901", "Daniel Hernandez", "7.5M ₫", 28],
        ["C001357", "Isabella Lopez", "7.2M ₫", 27],
    ];

    const $tbody = $("#topCustomerTable tbody");
    $tbody.empty();
    top10.forEach((c, i) => {
        const rank = i + 1;
        const medal =
            rank === 1
                ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
                : rank === 2
                ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
                : rank === 3
                ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
                : `<div class="rank-normal">${rank}</div>`;

        $tbody.append(`
            <tr class="align-middle">
                <td class="text-center">${medal}</td>
                <td class="text-muted small">${c[0]}</td>
                <td class="item-name">${c[1]}</td>
                <td class="text-end pe-4"><div class="value-main text-success">${c[2]}</div></td>
                <td class="text-end pe-4"><div class="value-main">${c[3]}</div></td>
            </tr>
        `);
    });

    // ==================== NÚT DOWNLOAD CSV  ====================
    $(".download-btn")
        .off("click")
        .on("click", function (e) {
            e.preventDefault();
            const type = $(this).data("target");
            let csvContent = "";
            let filename = "export.csv";

            if (type === "recency") {
                csvContent = `Purchase Cycle,1-30 days,31-60 days,61-90 days,>90 days,Total,% Inactive\nInactive Customers,3124,1856,987,2909,8876,\nRepeat Rate,,,,,68.2%\nAt Risk / Lost,,,,,9.3%`;
                filename = "Customer_Recency.csv";
            } else if (type === "top-customers") {
                csvContent = "Rank,Customer ID,Customer Name,Revenue,Orders\n";
                $("#topCustomerTable tbody tr").each(function (i) {
                    const rank = i + 1;
                    const cells = $(this).find("td");
                    csvContent += `${rank},${cells.eq(1).text()},${cells
                        .eq(2)
                        .text()},${cells.eq(3).text().trim()},${cells
                        .eq(4)
                        .text()
                        .trim()}\n`;
                });
                filename = "Top_Customers.csv";
            }
            // Bạn có thể thêm các case khác (overview, gender, frequency...) nếu cần

            const blob = new Blob(["\uFEFF" + csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            link.setAttribute("href", URL.createObjectURL(blob));
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
}

// CHẠY KHI VÀO TRANG REPORT CUSTOMER
$(document).ready(function () {
    if (window.location.pathname.includes("customer")) {
        initCustomerEnglish();
    }
});

// =======================================================
// CUSTOMERS
// =======================================================
const dataPath = "../../assets/fake-data/customers-data.txt";

$.get(dataPath, function (text) {
    const lines = text.split("\n");
    const $tbody = $("#customerTable tbody");
    let data = [];
    let totalRevenue = 0;
    let totalOrders = 0;

    // Đọc dữ liệu
    lines.forEach((line) => {
        line = line.trim();
        if (!line || line.startsWith("#")) return;
        const cols = line.split("|");
        if (cols.length !== 5) return;

        const revenue = parseInt(cols[3]);
        const orders = parseInt(cols[4]);
        totalRevenue += revenue;
        totalOrders += orders;

        data.push({
            rank: parseInt(cols[0]),
            id: cols[1],
            name: cols[2],
            revenue: revenue,
            orders: orders,
            aov: Math.round(revenue / orders),
        });
    });

    // Trạng thái sort hiện tại
    let currentSort = { col: "revenue", asc: false };

    // Hàm sort + toggle
    function doSort(col) {
        const asc = currentSort.col === col ? !currentSort.asc : false;
        currentSort = { col, asc };

        data.sort((a, b) => (asc ? a[col] - b[col] : b[col] - a[col]));
        data.forEach((d, i) => (d.rank = i + 1));

        renderData();

        // Cập nhật icon
        $(".sort-icon")
            .removeClass("fa-sort-up fa-sort-down")
            .addClass("fa-sort");
        $(`#sort-${col}`)
            .removeClass("fa-sort")
            .addClass(asc ? "fa-sort-up" : "fa-sort-down")
            .css("color", asc ? "#16a34a" : "#dc2626");
    }

    // Hàm render
    function renderData() {
        $tbody.empty();
        data.forEach((d) => {
            const rankCell =
                d.rank === 1
                    ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
                    : d.rank === 2
                    ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
                    : d.rank === 3
                    ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
                    : `<div class="rank-normal">${d.rank}</div>`;

            $tbody.append(`
                    <tr>
                        <td class="text-center">${rankCell}</td>
                        <td class="text-center text-muted small">${d.id}</td>
                        <td class="ps-3 fw-semibold">${d.name}</td>
                        <td class="text-end pe-4"><div class="value-euro text-success fw-bold">${d.revenue.toLocaleString(
                            "vi-VN"
                        )} ₫</div></td>
                        <td class="text-end pe-4"><div class="value-euro">${
                            d.orders
                        }</div><div class="text-muted small">AOV: ${d.aov.toLocaleString(
                "vi-VN"
            )} ₫</div></td>
                    </tr>
                `);
        });

        // Dòng Total
        $tbody.append(`
                <tr class="table-total">
                    <td colspan="3" class="text-center text-primary fw-bold">TOTAL</td>
                    <td class="text-end pe-4 text-primary fw-bold">${totalRevenue.toLocaleString(
                        "vi-VN"
                    )} ₫</td>
                    <td class="text-end pe-4 text-primary fw-bold">${totalOrders} orders</td>
                </tr>
            `);
    }

    // Gắn sự kiện sort (chỉ gắn 1 lần)
    $("#sort-revenue")
        .off("click")
        .on("click", () => doSort("revenue"));
    $("#sort-orders")
        .off("click")
        .on("click", () => doSort("orders"));

    // Mặc định: Revenue giảm dần
    doSort("revenue");

    // Download CSV
    $("#downloadBtn")
        .off("click")
        .on("click", () => {
            let csv = "\uFEFFRank,Customer ID,Name,Revenue,Orders,AOV\n";
            csv += `,,TOTAL,${totalRevenue},${totalOrders},\n`;
            data.forEach(
                (d) =>
                    (csv += `${d.rank},${d.id},${d.name},${d.revenue},${d.orders},${d.aov}\n`)
            );
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
                new Blob([csv], { type: "text/csv;charset=utf-8;" })
            );
            a.download =
                "Top_500_Customers_" + dayjs().format("YYYYMMDD") + ".csv";
            a.click();
        });
}).fail(() => {
    $("#customerTable tbody").html(
        `<tr><td colspan="5" class="text-center text-danger py-5">Không tìm thấy file customers.txt</td></tr>`
    );
});

// =======================================================
// TOP-STORES
// =======================================================
$(document).ready(function () {
    const $tbody = $("#storesTable tbody");
    const dataPath = "../../assets/fake-data/stores-data.txt";
    let data = [];
    let currentSort = { col: "allCat", asc: false };

    // ============= CSS CHO HUY CHƯƠNG (chỉ cần 1 lần) =============
    const medalStyle = `
    <style>
      .rank-trophy { font-size: 1.5rem; line-height: 1; }
      .rank-trophy.gold i   { color: #FFD700; text-shadow: 0 0 12px rgba(255,215,0,0.7); }
      .rank-trophy.silver i { color: #C0C0C0; text-shadow: 0 0 12px rgba(192,192,192,0.7); }
      .rank-trophy.bronze i { color: #CD7F32; text-shadow: 0 0 12px rgba(205,127,50,0.7); }
      .rank-normal { 
        text-align: center; 
        font-weight: 600; 
        color: #495057; 
        font-size: 1.1rem;
      }
    </style>
  `;
    $("head").append(medalStyle);

    // ============= LOAD DỮ LIỆU =============
    $.get(dataPath, function (text) {
        const lines = text.trim().split("\n");
        lines.forEach((line) => {
            const cols = line.split(",");
            if (cols.length < 9) return;
            data.push({
                id: cols[0].trim(),
                name: cols[1].trim(),
                city: cols[2].trim(),
                country: cols[3].trim(),
                zip: cols[4].trim(),
                lat: parseFloat(cols[5]),
                lng: parseFloat(cols[6]),
                catSelected: parseInt(cols[7]),
                allCat: parseInt(cols[8]),
            });
        });

        sortAndRender(currentSort.col, currentSort.asc);
    }).fail(() => {
        $tbody.html(
            `<tr><td colspan="10" class="text-center text-danger">Không tải được file stores.txt</td></tr>`
        );
    });

    // ============= HÀM TẠO HUY CHƯƠNG =============
    function getRankMedal(rank) {
        if (rank === 1)
            return `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`;
        if (rank === 2)
            return `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`;
        if (rank === 3)
            return `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`;
        return `<div class="rank-normal">${rank}</div>`;
    }

    // ============= SORT + RENDER =============
    function sortAndRender(column, asc) {
        // Sort dữ liệu hiện tại
        data.sort((a, b) =>
            asc ? a[column] - b[column] : b[column] - a[column]
        );

        // Tính rank mới dựa trên allCat (hoặc cột đang sort nếu muốn)
        const rankedData = data.map((d, i) => ({
            ...d,
            currentRank: i + 1,
        }));

        $tbody.empty();

        rankedData.forEach((d) => {
            const rankHtml = getRankMedal(d.currentRank);

            const row = `
        <tr>
            <td class="text-center align-middle">${rankHtml}</td>
            <td class="text-center text-muted small">${d.id}</td>
            <td class="fw-semibold">${d.name}</td>
            <td>${d.city}</td>
            <td>${d.country}</td>
            <td>${d.zip}</td>
            <td>${d.lat.toFixed(6)}</td>
            <td>${d.lng.toFixed(6)}</td>
            <td class="text-end pe-4">
                <div class="value-main text-success fw-bold">${d.catSelected.toLocaleString(
                    "vi-VN"
                )} ₫</div>
            </td>
            <td class="text-end pe-4">
                <div class="value-main text-success fw-bold">${d.allCat.toLocaleString(
                    "vi-VN"
                )} ₫</div>
            </td>
        </tr>
      `;
            $tbody.append(row);
        });

        // Cập nhật mũi tên sort
        $("#storesTable thead th .sort-arrow").text("");
        $(`#storesTable thead th[data-col="${column}"] .sort-arrow`).text(
            asc ? "▲" : "▼"
        );
    }

    // ============= CLICK ĐỂ SORT =============
    $("#storesTable thead").on("click", ".sortable", function () {
        const col = $(this).data("col");
        if (currentSort.col === col) {
            currentSort.asc = !currentSort.asc;
        } else {
            currentSort = { col: col, asc: false };
        }
        sortAndRender(currentSort.col, currentSort.asc);
    });
});

// =======================================================
// REPORT-REVENUES
// =======================================================
$(document).ready(function () {
    const revenueTable = $("#revenueTable tbody");
    const viewModeSelect = $("#viewMode");
    let chartLine, chartBar, chartPie;

    const today = new Date();
    const revenueData = [];

    // Tạo dữ liệu 6 tháng gần đây
    for (let m = 0; m < 6; m++) {
        const month = new Date(today.getFullYear(), today.getMonth() - m, 1);
        for (let i = 1; i <= 5; i++) {
            revenueData.push({
                date: new Date(month.getFullYear(), month.getMonth(), i)
                    .toISOString()
                    .slice(0, 10),
                storeId: `S0${i}`,
                name: `Store ${String.fromCharCode(64 + i)}`,
                country: i % 2 === 0 ? "UK" : "USA",
                revenue: Math.floor(Math.random() * 15000 + 5000),
                growth: Math.floor(Math.random() * 20 - 10),
                category: ["Electronics", "Clothing", "Home"][i % 3],
            });
        }
    }

    function renderTable(data) {
        revenueTable.empty();
        data.forEach((d) => {
            const growthClass = d.growth >= 0 ? "text-success" : "text-danger";
            revenueTable.append(`
                <tr>
                    <td>${d.date}</td>
                    <td>$${d.revenue.toLocaleString()}</td>
                    <td class='${growthClass}'>${d.growth}%</td>
                </tr>
            `);
        });
    }

    function renderCharts(data) {
        // --- Revenue Trend (Line chart 7 ngày trong tuần) ---
        const day = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(d.toISOString().slice(0, 10));
        }
        const weeklyRevenue = weekDates.map((date) => {
            const dayData = data.filter((d) => d.date === date);
            return dayData.length
                ? dayData.reduce((sum, x) => sum + x.revenue, 0)
                : Math.floor(Math.random() * 15000 + 5000);
        });
        const ctxLine = document.getElementById("lineChart").getContext("2d");
        if (chartLine) chartLine.destroy();
        chartLine = new Chart(ctxLine, {
            type: "line",
            data: {
                labels: weekDates,
                datasets: [
                    {
                        label: "Revenue",
                        data: weeklyRevenue,
                        borderColor: "#007bff",
                        backgroundColor: "rgba(0,123,255,0.1)",
                        fill: true,
                        tension: 0.4,
                        pointStyle: "circle",
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
            },
        });

        // --- Revenue Comparison (6 tháng gần đây) ---
        const monthLabels = [];
        const monthlyRevenue = [];
        for (let m = 5; m >= 0; m--) {
            const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
            const monthKey = d.toISOString().slice(0, 7);
            monthLabels.push(monthKey);
            const monthTotal = data
                .filter((x) => x.date.slice(0, 7) === monthKey)
                .reduce((sum, x) => sum + x.revenue, 0);
            monthlyRevenue.push(monthTotal);
        }

        // Fake growth so với cùng kỳ năm trước
        const monthlyRevenuePrev = monthlyRevenue.map(
            (x) => x * (Math.random() * 0.3 + 0.85)
        );
        const growthPercent = monthlyRevenue.map((val, i) =>
            monthlyRevenuePrev[i]
                ? (
                      ((val - monthlyRevenuePrev[i]) / monthlyRevenuePrev[i]) *
                      100
                  ).toFixed(1)
                : 0
        );

        const ctxBar = document.getElementById("barChart").getContext("2d");
        if (chartBar) chartBar.destroy();
        chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        type: "line",
                        label: "Growth (%) vs Last Year",
                        data: growthPercent,
                        backgroundColor: "#f46505ff",
                        borderColor: "#f4a005",
                        borderWidth: 2,
                        fill: false,
                        yAxisID: "y1",
                        order: 1,
                        tension: 0.4,
                        pointStyle: "circle",
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    },
                    {
                        type: "bar",
                        label: "Monthly Revenue",
                        data: monthlyRevenue,
                        backgroundColor: "#4b50ea",
                        order: 2,
                        borderRadius: 8,
                        barPercentage: 0.5,
                        categoryPercentage: 0.6,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "top" } },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Revenue ($)" },
                    },
                    y1: {
                        position: "right",
                        ticks: { callback: (val) => val + "%" },
                        title: { display: true, text: "Growth (%)" },
                        beginAtZero: true,
                    },
                },
            },
        });

        // --- Pie chart ---
        const categories = [...new Set(data.map((d) => d.category))];
        const categorySums = categories.map((c) =>
            data
                .filter((d) => d.category === c)
                .reduce((sum, x) => sum + x.revenue, 0)
        );
        const ctxPie = document.getElementById("pieChart").getContext("2d");
        if (chartPie) chartPie.destroy();
        chartPie = new Chart(ctxPie, {
            type: "pie",
            data: {
                labels: categories,
                datasets: [
                    {
                        data: categorySums,
                        backgroundColor: [
                            "#007bff",
                            "#28a745",
                            "#dc3545",
                            "#ffc107",
                        ],
                        hoverOffset: 10,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
            },
        });
        $("#pieChart").css("max-height", "300px");
    }

    function updateReport() {
        const mode = viewModeSelect.val();
        let filteredData = [...revenueData];
        renderTable(filteredData);
        renderCharts(filteredData);

        // Tổng doanh thu
        const totalRevenue = filteredData.reduce(
            (sum, d) => sum + d.revenue,
            0
        );
        $("#sumRevenue").text(`$${totalRevenue.toLocaleString()}`);

        // Tính growth theo mode
        let growth = 0;
        if (mode === "daily") {
            const todayStr = today.toISOString().slice(0, 10);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            const todayRevenue = filteredData
                .filter((d) => d.date === todayStr)
                .reduce((s, x) => s + x.revenue, 0);
            const yesterdayRevenue = filteredData
                .filter((d) => d.date === yesterdayStr)
                .reduce((s, x) => s + x.revenue, 0);
            growth = yesterdayRevenue
                ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                : 0;
        } else if (mode === "weekly") {
            const day = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
            const lastMonday = new Date(monday);
            lastMonday.setDate(monday.getDate() - 7);
            let thisWeek = 0,
                lastWeek = 0;
            for (let i = 0; i < 7; i++) {
                const d1 = new Date(monday);
                d1.setDate(monday.getDate() + i);
                const d2 = new Date(lastMonday);
                d2.setDate(lastMonday.getDate() + i);
                const str1 = d1.toISOString().slice(0, 10);
                const str2 = d2.toISOString().slice(0, 10);
                thisWeek += filteredData
                    .filter((d) => d.date === str1)
                    .reduce((s, x) => s + x.revenue, 0);
                lastWeek += filteredData
                    .filter((d) => d.date === str2)
                    .reduce((s, x) => s + x.revenue, 0);
            }
            growth = lastWeek ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
        } else if (mode === "monthly") {
            const thisMonth = today.toISOString().slice(0, 7);
            const lastMonthDate = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
            );
            const lastMonth = lastMonthDate.toISOString().slice(0, 7);
            const thisMonthRevenue = filteredData
                .filter((d) => d.date.slice(0, 7) === thisMonth)
                .reduce((s, x) => s + x.revenue, 0);
            const lastMonthRevenue = filteredData
                .filter((d) => d.date.slice(0, 7) === lastMonth)
                .reduce((s, x) => s + x.revenue, 0);
            growth = lastMonthRevenue
                ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
                  100
                : 0;
        } else if (mode === "yearly") {
            const thisYear = today.getFullYear();
            const lastYear = thisYear - 1;
            const thisYearRevenue = filteredData
                .filter((d) => new Date(d.date).getFullYear() === thisYear)
                .reduce((s, x) => s + x.revenue, 0);
            const lastYearRevenue = filteredData
                .filter((d) => new Date(d.date).getFullYear() === lastYear)
                .reduce((s, x) => s + x.revenue, 0);
            growth = lastYearRevenue
                ? ((thisYearRevenue - lastYearRevenue) / lastYearRevenue) * 100
                : 0;
        }

        const growthText = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
        const growthClass = growth >= 0 ? "text-success" : "text-danger";
        $("#monthlyGrowth")
            .text(growthText)
            .removeClass("text-success text-danger")
            .addClass(growthClass);
        let labelText =
            mode.charAt(0).toUpperCase() + mode.slice(1) + " Growth";
        $("#monthlyGrowth").prev("h6").text(labelText);

        // Active stores
        $("#activeStores").text(filteredData.length);
    }

    viewModeSelect.on("change", updateReport);
    updateReport();
});

// =======================================================
// REPORT-SALES
// =======================================================

// 1. Biểu đồ tròn - Kênh bán hàng (đã sửa lỗi JSON)
new Chart(document.getElementById("channelChart"), {
    type: "doughnut",
    data: {
        labels: ["Website", "App Mobile", "Facebook", "Zalo", "Offline Store"],
        datasets: [
            {
                data: [38, 25, 18, 12, 7],
                backgroundColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ef4444",
                ],
                borderWidth: 4,
                borderColor: "#fff",
                hoverOffset: 10,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { padding: 20 } } },
    },
});

// 2. Biểu đồ cột
new Chart(document.getElementById("topProductsChart"), {
    type: "bar",
    data: {
        labels: [
            "iPhone 15 Pro",
            "MacBook Air M2",
            "Samsung S24",
            "iPad Pro",
            "AirPods Pro",
            "Apple Watch 9",
            "Sony WH-1000XM5",
            "Dell XPS 15",
            "Surface Pro 9",
            "Galaxy Tab S9",
        ],
        datasets: [
            {
                label: "Doanh thu (tỷ ₫)",
                data: [142, 118, 97, 85, 72, 68, 59, 54, 48, 43],
                backgroundColor: "#3bbef6ff",
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { display: false } } },
    },
});

// 3. Biểu đồ đường
const dates = Array.from({ length: 30 }, (_, i) =>
    dayjs()
        .subtract(29 - i, "day")
        .format("DD/MM")
);
const revenues = [
    32, 35, 38, 36, 41, 44, 42, 48, 51, 49, 53, 55, 58, 56, 61, 64, 62, 68, 71,
    69, 74, 77, 79, 82, 85, 88, 91, 94, 96, 102,
];

new Chart(document.getElementById("revenueTrendChart"), {
    type: "line",
    data: {
        labels: dates,
        datasets: [
            {
                label: "Doanh thu (tỷ ₫)",
                data: revenues,
                borderColor: "#54f7c0ff",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: "#10b981",
            },
        ],
    },
    options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: false } },
    },
});

// 4. Biểu đồ Gauge (bán nguyệt)
document.addEventListener("DOMContentLoaded", function () {
    // CẤU HÌNH GIÁ TRỊ TẠI ĐÂY
    const percent = 87.3; // Giá trị % muốn hiển thị

    const progressBar = document.getElementById("progress-bar");

    // Tính toán chiều dài của đường path (cung tròn)
    // getTotalLength() là hàm có sẵn của SVG path
    const totalLength = progressBar.getTotalLength();

    // Thiết lập stroke-dasharray bằng chiều dài cung (tạo nét đứt dài bằng cả cung)
    progressBar.style.strokeDasharray = totalLength;

    // Ban đầu ẩn toàn bộ (offset = totalLength)
    progressBar.style.strokeDashoffset = totalLength;

    // Tính toán offset cần thiết để hiển thị đúng %
    // Công thức: Offset = Tổng dài - (Tổng dài * % / 100)
    const offset = totalLength - (totalLength * percent) / 100;

    // Set timeout nhỏ để CSS transition hoạt động (tạo hiệu ứng chạy)
    setTimeout(() => {
        progressBar.style.strokeDashoffset = offset;
    }, 100);
});

// ==================== TOP 10 PROVINCES ====================
const topProvinces = [
    ["Ho Chi Minh City", "428B ₫", "34.3%"],
    ["Hanoi", "312B ₫", "25.0%"],
    ["Da Nang", "98B ₫", "7.9%"],
    ["Binh Duong", "76B ₫", "6.1%"],
    ["Dong Nai", "64B ₫", "5.1%"],
    ["Can Tho", "48B ₫", "3.8%"],
    ["Hai Phong", "42B ₫", "3.4%"],
    ["Khanh Hoa", "38B ₫", "3.0%"],
    ["Long An", "35B ₫", "2.8%"],
    ["Ba Ria - Vung Tau", "31B ₫", "2.5%"],
];

const $provTbody = $("#topProvincesTable tbody");
$provTbody.empty();
topProvinces.forEach((p, i) => {
    const rank = i + 1;
    const medal =
        rank === 1
            ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
            : rank === 2
            ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
            : rank === 3
            ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
            : `<div class="rank-normal">${rank}</div>`;

    $provTbody.append(`
        <tr class="align-middle">
            <td class="text-center">${medal}</td>
            <td class="item-name">${p[0]}</td>
            <td class="text-end pe-4"><div class="value-main text-success">${p[1]}</div></td>
            <td class="text-end pe-4"><div class="value-main">${p[2]}</div></td>
        </tr>
    `);
});

// ==================== TOP 10 SALES REPRESENTATIVES ====================
const topSalesReps = [
    ["Lan Nguyen", "89.2B ₫", 1842, "48.4M ₫"],
    ["Minh Tran", "76.5B ₫", 1623, "47.1M ₫"],
    ["Huong Le", "68.9B ₫", 1498, "46.0M ₫"],
    ["Hoang Pham", "62.1B ₫", 1387, "44.8M ₫"],
    ["Mai Hoang", "58.7B ₫", 1298, "45.2M ₫"],
    ["Nam Vu", "55.3B ₫", 1210, "45.7M ₫"],
    ["Thu Do", "52.9B ₫", 1165, "45.4M ₫"],
    ["Khanh Ngo", "50.4B ₫", 1108, "45.5M ₫"],
    ["Ngoc Bui", "48.1B ₫", 1056, "45.5M ₫"],
    ["Long Dang", "46.8B ₫", 1021, "45.8M ₫"],
];

const $repTbody = $("#topSalesRepsTable tbody");
$repTbody.empty();
topSalesReps.forEach((r, i) => {
    const rank = i + 1;
    const medal =
        rank === 1
            ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
            : rank === 2
            ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
            : rank === 3
            ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
            : `<div class="rank-normal">${rank}</div>`;

    $repTbody.append(`
        <tr class="align-middle">
            <td class="text-center">${medal}</td>
            <td class="item-name">${r[0]}</td>
            <td class="text-end pe-4"><div class="value-main text-success">${r[1]}</div></td>
            <td class="text-center"><div class="value-main">${r[2]}</div></td>
            <td class="text-end pe-4"><div class="value-main">${r[3]}</div></td>
        </tr>
    `);
});

// ==================== NÚT DOWNLOAD CSV ====================
$(".download-btn")
    .off("click")
    .on("click", function (e) {
        e.preventDefault();
        const type = $(this).data("target");
        let csvContent = "";
        let filename = "export.csv";

        if (type === "top-provinces") {
            csvContent = "Rank,Province/City,Revenue,% Total\n";
            $("#topProvincesTable tbody tr").each(function (i) {
                const rank = i + 1;
                const cells = $(this).find("td");
                const province = cells.eq(1).text();
                const revenue = cells.eq(2).text().trim();
                const percent = cells.eq(3).text().trim();
                csvContent += `${rank},${province},${revenue},${percent}\n`;
            });
            filename = "Top_10_Provinces.csv";
        } else if (type === "top-sales-reps") {
            csvContent = "Rank,Employee,Revenue,Orders,AOV\n";
            $("#topSalesRepsTable tbody tr").each(function (i) {
                const rank = i + 1;
                const cells = $(this).find("td");
                const name = cells.eq(1).text();
                const revenue = cells.eq(2).text().trim();
                const orders = cells.eq(3).text().trim();
                const aov = cells.eq(4).text().trim();
                csvContent += `${rank},${name},${revenue},${orders},${aov}\n`;
            });
            filename = "Top_10_Sales_Representatives.csv";
        }
        // (giữ nguyên các case cũ như top-customers, recency...)

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
document.addEventListener("click", async function (e) {
    const logoutBtn = e.target.closest("#btnLogout");
    if (!logoutBtn) return; // Không phải bấm nút logout thì bỏ qua

    e.preventDefault();
    e.stopPropagation();

    try {
        // 1. Gọi API logout
        await App.apiPost("/auth/logout", {});
    } catch (err) {
        console.error("Logout API error:", err);
        // Kể cả lỗi vẫn tiếp tục xoá token ở client
    }

    // 2. Xoá token + user đã lưu khi login
    App.clearAuth();

    // 3. Quay về màn Sign In
    window.location.href = "/frontend/index.html";
});
