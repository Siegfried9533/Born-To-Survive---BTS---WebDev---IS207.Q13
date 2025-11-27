// $(function () {
//   const componentsPath = "/resources/components/";

//   // 1. Tải Header
//   $("#app-header").load(
//     componentsPath + "header.html",
//     function (response, status, xhr) {
//       if (status == "success") {
//         initLitepicker();
//         // Đã XÓA initFilterComponent() khỏi đây
//       } else {
//         console.error(
//           "Lỗi khi tải header.html: " + xhr.status + " " + xhr.statusText
//         );
//       }
//     }
//   );

//   // 2. Tải Footer
//   $("#app-footer").load(componentsPath + "footer.html");

//   // 3. Tải Sidebar
//   $("#sidebar").load(
//     componentsPath + "sidebar.html",
//     function (response, status, xhr) {
//       if (status == "success") {
//         initSidebar();
//       } else if (status == "error") {
//         console.error(
//           "Lỗi khi tải sidebar.html: " + xhr.status + " " + xhr.statusText
//         );
//         $("#sidebar").html("<p>Lỗi tải menu. Vui lòng thử lại.</p>");
//       }
//     }
//   );

//   // 4. Tải FILTER (MỚI)
//   $("#filter-container").load(
//     componentsPath + "filter.html",
//     function (response, status, xhr) {
//       if (status == "success") {
//         // Chạy hàm init cho filter SAU KHI HTML của nó đã được tải
//         initFilterComponent();
//       } else if (status == "error") {
//         console.error(
//           "Lỗi khi tải filter.html: " + xhr.status + " " + xhr.statusText
//         );
//       }
//     }
//   );

//   // chỉ chạy khi ở trang profile.html
//   if ($("main.page-profile").length > 0) {
//     initProfilePage();
//   }
// });

$(document).ready(function () {
    // Không cần khai báo componentsPath hay dùng .load() nữa!
    
    // 1. Header đã có sẵn HTML -> Chạy luôn hàm khởi tạo
    if ($("#app-header").length) {
        initLitepicker();
    }

    // 2. Sidebar đã có sẵn -> Chạy luôn
    if ($("#sidebar").length) {
        initSidebar();
    }

    // 3. Filter đã có sẵn -> Chạy luôn
    // Lưu ý: Đảm bảo hàm initFilterComponent đã được import hoặc định nghĩa
    if ($("#filter-container").length) {
        initFilterComponent();
    }

    // 4. Trang Profile
    if ($("main.page-profile").length > 0) {
        initProfilePage();
    }
});