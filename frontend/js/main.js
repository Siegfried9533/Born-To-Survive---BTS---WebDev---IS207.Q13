if (typeof dayjs !== 'undefined' && window.dayjs_plugin_utc && window.dayjs_plugin_timezone && window.dayjs_plugin_customParseFormat) {
    dayjs.extend(window.dayjs_plugin_utc);
    dayjs.extend(window.dayjs_plugin_timezone);
    dayjs.extend(window.dayjs_plugin_customParseFormat);
}
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

/* ========================= */
/* COMPONENT LOADER          
/* ========================= */
$(function () {
    const componentsPath = "../components/";

    // 1. Tải Header
    $("#app-header").load(componentsPath + "header.html", function (response, status, xhr) {
        if (status == "success") {
            initLitepicker();
            // Đã XÓA initFilterComponent() khỏi đây
        } else {
            console.error("Lỗi khi tải header.html: " + xhr.status + " " + xhr.statusText);
        }
    });

    // 2. Tải Footer
    $("#app-footer").load(componentsPath + "footer.html");

    // 3. Tải Sidebar
    $("#sidebar").load(componentsPath + "sidebar.html", function (
        response,
        status,
        xhr
    ) {
        if (status == "success") {
            initSidebar();
        } else if (status == "error") {
            console.error(
                "Lỗi khi tải sidebar.html: " + xhr.status + " " + xhr.statusText
            );
            $("#sidebar").html("<p>Lỗi tải menu. Vui lòng thử lại.</p>");
        }
    });

    // 4. Tải FILTER (MỚI)
    $("#filter-container").load(componentsPath + "filter.html", function (
        response,
        status,
        xhr
    ) {
        if (status == "success") {
            // Chạy hàm init cho filter SAU KHI HTML của nó đã được tải
            initFilterComponent();
        } else if (status == "error") {
            console.error(
                "Lỗi khi tải filter.html: " + xhr.status + " " + xhr.statusText
            );
        }
    });

    // chỉ chạy khi ở trang profile.html
    if ($('main.page-profile').length > 0) {
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
    const currentFile = window.location.pathname.split('/').pop();
    // Nếu path rỗng (trang chủ), mặc định là "overview.html"
    const currentFilename = (currentFile === "") ? "overview.html" : currentFile;

    let activeLinkFound = false;

    // 1a. Kiểm tra các link submenu con
    submenuItems.forEach((subItem) => {
        const subLink = subItem.querySelector("a");
        if (subLink) {
            const linkPath = subLink.getAttribute("href");
            if (linkPath && linkPath !== "#") {
                // Lấy tên file từ href (ví dụ: "top-category.html")
                const linkFile = linkPath.split('/').pop();

                // So sánh tên file
                if (linkFile && currentFilename === linkFile) {
                    subItem.classList.add("active");
                    activeLinkFound = true;

                    const parentMenuItem = subItem.closest(".menu-item.has-submenu");
                    if (parentMenuItem) {
                        parentMenuItem.classList.add("active");
                        parentMenuItem.querySelector(".menu-link").classList.remove("collapsed");
                        parentMenuItem.querySelector(".submenu").classList.add("show");
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
                    const linkFile = linkPath.split('/').pop();

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
    const triggerBtn = document.getElementById('calendarTriggerBtn');
    const startDateDisplay = document.getElementById('startDateDisplay');
    const endDateDisplay = document.getElementById('endDateDisplay');
    const startDateHidden = document.getElementById('startDate');
    const endDateHidden = document.getElementById('endDate');

    // 2. Kiểm tra (Không đổi)
    if (!triggerBtn || !startDateDisplay || !endDateDisplay || !startDateHidden || !endDateHidden) {
        console.warn("Không tìm thấy các phần tử (button/inputs) để khởi tạo Litepicker.");
        return;
    }

    // 3. Lấy giá trị ban đầu và Định dạng (Không đổi)
    const initialStart = startDateHidden.value;
    const initialEnd = endDateHidden.value;
    const DISPLAY_FORMAT = 'DD MMMM YYYY';
    const DATA_FORMAT = 'DD-MM-YYYY';

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
    picker.on('selected', (date1, date2) => {
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
    triggerBtn.addEventListener('click', (e) => {
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
    const $filterGroups = $('.filter-group');
    if (!$filterGroups.length) {
        console.warn("Không tìm thấy .filter-group để khởi tạo.");
        return;
    }

    // --- Helper 1: Cập nhật text hiển thị ---
    function updateDisplayText($group) {
        const $displayText = $group.find('.filter-display-text');
        const $checkedInputs = $group.find('input:checked');

        if ($checkedInputs.length === 0) {
            $displayText.html('&nbsp;').removeClass('has-selection');
        } else {
            const selectedValues = $checkedInputs.map(function () {
                return $(this).val();
            }).get().join(', ');

            $displayText.text(selectedValues).addClass('has-selection');
        }
    }

    // --- Helper 2: Xử lý giới hạn (max) ---
    function handleSelectionLimits($group) {
        const maxCount = parseInt($group.attr('data-max'), 10);
        if (!maxCount) return;

        const $checkboxes = $group.find('input[type="checkbox"]');
        const checkedCount = $group.find('input[type="checkbox"]:checked').length;

        if (checkedCount >= maxCount) {
            $checkboxes.not(':checked').prop('disabled', true)
                .closest('.filter-item').addClass('disabled');
        } else {
            $checkboxes.prop('disabled', false)
                .closest('.filter-item').removeClass('disabled');
        }
    }

    // --- Helper 3: Tự động tạo Category (thay cho document.write) ---
    function generateCategories() {
        // Nhắm vào dropdown của group category bằng ID
        const $categoryDropdown = $('#category-filter-group .filter-dropdown');
        if (!$categoryDropdown.length) return;

        let categoryHTML = '';
        for (let i = 1; i <= 12; i++) {
            categoryHTML += `
                <div class="filter-item">
                    <input type="checkbox" id="cat${i}" value="Category ${i}">
                    <label for="cat${i}">Category ${i}</label>
                </div>
            `;
        }

        // Chèn HTML category vào sau header (nếu có)
        const $header = $categoryDropdown.find('.filter-dropdown-header');
        if ($header.length) {
            $header.after(categoryHTML); // Chèn sau header
        } else {
            $categoryDropdown.html(categoryHTML); // Chèn trực tiếp
        }
    }

    // --- 1. Thêm header "Chọn tối đa X" ---
    $filterGroups.each(function () {
        const $group = $(this);
        const maxCount = parseInt($group.attr('data-max'), 10);
        // Kiểm tra xem header đã tồn tại chưa
        if (maxCount && $group.find('.filter-dropdown-header').length === 0) {
            const $header = $('<div></div>')
                .addClass('filter-dropdown-header')
                .html(`Select up to ${maxCount} <hr>`);
            $group.find('.filter-dropdown').prepend($header);
        }
    });

    generateCategories();

    // --- 2. Mở/đóng dropdown khi click vào box ---
    // Sửa: Dùng ID selector '#filter-container'
    $('#filter-container').on('click', '.filter-display-box', function (e) {
        e.stopPropagation();
        const $currentGroup = $(this).closest('.filter-group');
        $('.filter-group').not($currentGroup).removeClass('open');
        $currentGroup.toggleClass('open');
    });

    // --- 3. Xử lý khi chọn một item (change) ---
    // Sửa: Dùng ID selector '#filter-container'
    $('#filter-container').on('change', 'input[type="checkbox"], input[type="radio"]', function () {
        const $group = $(this).closest('.filter-group');

        handleSelectionLimits($group);
        updateDisplayText($group);

        if ($(this).is(':radio')) {
            $group.removeClass('open');
        }
    });

    // --- 4. Đóng dropdown khi click ra ngoài ---
    $(window).on('click', function () {
        $filterGroups.removeClass('open');
    });

    // --- 5. Ngăn click BÊN TRONG dropdown làm đóng dropdown ---
    // Sửa: Dùng ID selector '#filter-container'
    $('#filter-container').on('click', '.filter-dropdown', function (e) {
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

    const $editButton = $('#btn-edit-profile');
    const $profileInputs = $('.profile-input');
    const $dobPickerInput = $('#dob-picker');

    $editButton.on('click', function () {
        const $this = $(this);
        if ($this.text() === "Edit") {
            $profileInputs.prop('disabled', false);
            $dobPickerInput.prop('disabled', false);
            $this.text('Save').removeClass('btn-primary').addClass('btn-success');
        } else {
            $profileInputs.prop('disabled', true);
            $dobPickerInput.prop('disabled', true);
            $this.text('Edit').removeClass('btn-success').addClass('btn-primary');
        }
    });

    // =============================================
    // --- PHẦN 2: LOGIC LỊCH TASK (NÂNG CẤP) ---
    // =============================================

    // 1. Cấu trúc dữ liệu Task (Lưu nhiều task, thời gian, trạng thái)
    let tasks = JSON.parse(localStorage.getItem('calendarTasks')) || {};
    /* Cấu trúc mẫu:
    tasks = {
      "2025-11-10": [
        { "id": 167888, "time": "09:00", "text": "Task A", "completed": false },
        { "id": 167999, "time": "14:30", "text": "Task B", "completed": true }
      ]
    }
    */

    // 2. Lấy các phần tử UI
    const $taskAddForm = $('#task-add-form');
    const $taskFormLabel = $('#task-form-label');
    const $taskTimeInput = $('#task-time-input'); // (Task 2)
    const $taskTextInput = $('#task-text-input');
    const $taskListArea = $('#task-list-area');
    const $taskNotificationArea = $('#task-notification-area'); // (Task 3)

    let currentSelectedDate = null; // Biến lưu ngày đang chọn

    // 3. Khởi tạo Input chọn giờ (Task 2)
    const timePicker = flatpickr($taskTimeInput, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i", // 24h format (VD: 14:30)
    });

    // 4. Các hàm Helper
    function saveTasks() {
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    }
    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    // === TASK 3: HÀM HIỂN THỊ THÔNG BÁO ===
    function showTaskMessage(message, isError = false) {
        const $notification = $('<div></div>')
            .addClass('task-notification')
            .addClass(isError ? 'error' : 'success')
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
            $taskListArea.html('<p class="text-muted text-center fs-small mt-2">No tasks for this day.</p>');
            return;
        }

        // Sắp xếp task theo thời gian
        dayTasks.sort((a, b) => (a.time > b.time) ? 1 : -1);

        dayTasks.forEach(task => {
            const isCompleted = task.completed;
            const itemClass = isCompleted ? 'task-item completed' : 'task-item';
            const completeIcon = isCompleted ? 'fa-undo' : 'fa-check';
            const completeText = isCompleted ? 'Undo' : 'Done';

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
            if (dayTasks.length > 0 && dayTasks.some(task => !task.completed)) {
                dayElem.classList.add("day-with-task");
            }
        },

        // === TASK 2 & 4: MỞ UI KHI CLICK VÀO 1 NGÀY ===
        onChange: function (selectedDates, dateStr, instance) {
            currentSelectedDate = dayjs(dateStr).format("YYYY-MM-DD");

            // Cập nhật label cho form Thêm Task
            $taskFormLabel.text(`Add Task for ${dayjs(dateStr).format("DD MMMM, YYYY")}`);

            // Hiển thị danh sách task (Task 4)
            renderTasksForDay(currentSelectedDate);

            // Hiển thị form thêm task (Task 2)
            $taskAddForm.slideDown(200);
            clearFormErrors(); // Xóa lỗi cũ
        }
    });

    // 6. Logic các nút

    // === TASK 2: SUBMIT FORM THÊM TASK MỚI ===
    $taskAddForm.on('submit', function (e) {
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
            completed: false
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
        $taskTextInput.val('');
        timePicker.clear();

        // === TASK 3: HIỂN THỊ THÔNG BÁO THÀNH CÔNG ===
        showTaskMessage("Task added successfully!");
    });

    // === TASK 4: CLICK NÚT COMPLETE/DELETE (Dùng Event Delegation) ===
    $taskListArea.on('click', '.btn-delete', function () {
        const $taskItem = $(this).closest('.task-item');
        const taskId = $taskItem.data('task-id');

        // Xóa task khỏi mảng
        let dayTasks = tasks[currentSelectedDate];
        tasks[currentSelectedDate] = dayTasks.filter(task => task.id !== taskId);

        saveTasks();
        calendarWidget.redraw(); // Vẽ lại lịch (có thể xóa border)
        renderTasksForDay(currentSelectedDate); // Cập nhật list
    });

    $taskListArea.on('click', '.btn-complete', function () {
        const $taskItem = $(this).closest('.task-item');
        const taskId = $taskItem.data('task-id');

        // Tìm và thay đổi trạng thái
        let dayTasks = tasks[currentSelectedDate];
        const taskToToggle = dayTasks.find(task => task.id === taskId);

        if (taskToToggle) {
            taskToToggle.completed = !taskToToggle.completed; // Đảo trạng thái
        }

        saveTasks();
        calendarWidget.redraw(); // Vẽ lại lịch (có thể xóa/thêm border)
        renderTasksForDay(currentSelectedDate); // Cập nhật list
    });

    // --- (Phần 7: Logic Timezone giữ nguyên) ---
    const $timeZoneSelect = $('#timeZone');
    function updateCalendarToday() {
        const selectedTZ = $timeZoneSelect.val();
        const todayInTZ = dayjs.tz(Date.now(), selectedTZ).format("YYYY-MM-DD");
        // Sửa: Dùng 'set Date' để đánh dấu ngày 'hôm nay'
        calendarWidget.setDate(todayInTZ, false);
    }
    $timeZoneSelect.on('change', updateCalendarToday);
    updateCalendarToday(); // Chạy lần đầu

    console.log("Trang Profile đã được khởi tạo (với Lịch Task Nâng Cao).");
}