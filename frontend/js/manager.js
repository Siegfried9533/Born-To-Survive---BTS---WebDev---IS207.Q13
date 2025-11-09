// =======================================================
// SIDEBAR INTERACTIVE LOGIC (Active + Hover + Submenu)
// =======================================================
(function () {
  // Chờ DOM sẵn sàng và sidebar tồn tại
  function initSidebar() {
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) return; // Sidebar chưa load

    const menuItems = sidebar.querySelectorAll(".menu-item");
    if (!menuItems.length) return;

    menuItems.forEach((item) => {
      const link = item.querySelector(".menu-link");

      // CLICK: xử lý active + submenu
      link.addEventListener("click", function (e) {
        // Menu không có submenu → vẫn cho phép chuyển trang (nếu có href thật)
        if (!item.classList.contains("has-submenu")) {
          // e.preventDefault(); // Bỏ nếu bạn muốn link thật hoạt động
        }

        // 1. XÓA active + HOVER INLINE của tất cả menu
        menuItems.forEach((mi) => {
          mi.classList.remove("active");

          // XÓA HOVER INLINE (do mouseenter/leave tạo ra)
          const ml = mi.querySelector(".menu-link");
          ml.style.backgroundColor = "";
          ml.style.color = "";
          ml.style.boxShadow = "";
          mi.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
            (icon) => {
              icon.style.color = "";
            }
          );
        });

        // 2. THÊM active cho menu được click
        item.classList.add("active");

        // 3. XỬ LÝ SUBMENU (nếu có)
        if (item.classList.contains("has-submenu")) {
          e.preventDefault();

          const submenu = item.querySelector(".submenu");
          const isOpen = submenu.classList.contains("open");

          // 1. ĐÓNG TẤT CẢ submenu KHÁC
          document.querySelectorAll(".has-submenu .submenu").forEach((s) => {
            s.classList.remove("open");
          });
          document.querySelectorAll(".has-submenu .menu-link").forEach((l) => {
            l.classList.add("collapsed");
          });

          // 2. MỞ/ĐÓNG submenu HIỆN TẠI
          if (!isOpen) {
            link.classList.remove("collapsed");
            submenu.classList.add("open");
          } else {
            link.classList.add("collapsed");
            submenu.classList.remove("open");
          }
        }
      });
    });

    // HOVER: chỉ áp dụng khi KHÔNG active
    menuItems.forEach((item) => {
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
  }

  // CHẠY KHI DOM SẴN SÀNG
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidebar);
  } else {
    initSidebar();
  }

  // TỰ ĐỘNG CHẠY LẠI nếu sidebar được load bằng AJAX/fetch
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length && document.querySelector("#sidebar")) {
        initSidebar();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
