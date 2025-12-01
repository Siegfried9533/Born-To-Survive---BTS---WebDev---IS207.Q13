// ========== AUTH + API HELPERS DÙNG CHUNG ==========

window.App = window.App || {};

App.config = {
    apiBaseUrl: "http://btswebdev.local:8888/api", // đổi nếu domain khác
};

App.getToken = function () {
    return localStorage.getItem("access_token");
};

App.setToken = function (token) {
    localStorage.setItem("access_token", token);
};

App.clearAuth = function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
};

App.apiRequest = async function (method, path, body = null) {
    const headers = { Accept: "application/json" };
    const token = App.getToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (body !== null) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(App.config.apiBaseUrl + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    // Debug: log basic request/response info for easier diagnosis
    try {
        console.debug(
            "App.apiRequest",
            method,
            App.config.apiBaseUrl + path,
            "status:",
            res.status
        );
    } catch (e) {}

    if (res.status === 401) {
        // Hết hạn token / chưa đăng nhập
        App.clearAuth();
        if (!location.pathname.endsWith("/index.html")) {
            window.location.href = "/frontend/index.html";
        }
        throw new Error("Unauthenticated");
    }

    let data = {};
    try {
        data = await res.json();
    } catch (e) {}

    if (!res.ok) {
        try {
            console.error("API error", {
                url: App.config.apiBaseUrl + path,
                method,
                status: res.status,
                body: data,
            });
        } catch (e) {}
        throw new Error(data.message || "Request failed: " + res.status);
    }

    return data;
};

App.apiGet = (p) => App.apiRequest("GET", p);
App.apiPost = (p, b) => App.apiRequest("POST", p, b);
App.apiPut = (p, b) => App.apiRequest("PUT", p, b);
App.apiDel = (p, b) => App.apiRequest("DELETE", p, b);

App.requireAuth = function () {
    if (!App.getToken()) {
        window.location.href = "/frontend/index.html";
    }
};
// =======================================================
// GLOBAL LOGOUT HANDLER - BẮT CLICK DÙ HEADER LOAD ĐỘNG
// =======================================================
document.addEventListener("click", async function (e) {
    const logoutBtn = e.target.closest("#btnLogout");
    if (!logoutBtn) return; // Không phải bấm nút logout thì bỏ qua

    e.preventDefault();
    // Prevent other handlers (including delegated jQuery handlers) from running
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") {
        e.stopImmediatePropagation();
    }

    try {
        // 1. Gọi API logout
        await App.apiPost("/auth/logout", {});
    } catch (err) {
        console.error("Logout API error:", err);
        // Kể cả lỗi vẫn tiếp tục xoá token ở client
    }

    // 2. Xoá token + user đã lưu khi login
    App.clearAuth();

    // 3. Chuyển thẳng về Sign In. Use replace so back-button doesn't return to protected page.
    try {
        location.replace("/frontend/index.html?logout=1");
    } catch (e) {
        window.location.href = "/frontend/index.html?logout=1";
    }
});
