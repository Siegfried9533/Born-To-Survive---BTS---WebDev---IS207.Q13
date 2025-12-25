// ========== AUTH + API HELPERS DÙNG CHUNG ==========

window.App = window.App || {};

// Tự động detect API base URL từ current domain
App.config = {
    apiBaseUrl: window.location.origin + "/api",
};

App.getToken = function () {
    return localStorage.getItem("access_token");
};

App.setToken = function (token) {
    localStorage.setItem("access_token", token);
};

App.getUser = function () {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
        return null;
    }
};

App.setUser = function (user) {
    localStorage.setItem("user", JSON.stringify(user));
};

App.clearAuth = function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
};

App.isLoggedIn = function () {
    return !!App.getToken();
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

    // Debug log
    console.debug("App.apiRequest", method, App.config.apiBaseUrl + path, "status:", res.status);

    if (res.status === 401) {
        // Hết hạn token / chưa đăng nhập
        App.clearAuth();
        // Chỉ redirect nếu không phải trang login
        if (!location.pathname.includes("login") && !location.pathname.endsWith("/")) {
            window.location.href = "/login";
        }
        throw new Error("Unauthenticated");
    }

    let data = {};
    try {
        data = await res.json();
    } catch (e) {}

    if (!res.ok) {
        console.error("API error", {
            url: App.config.apiBaseUrl + path,
            method,
            status: res.status,
            body: data,
        });
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
        window.location.href = "/login";
        return false;
    }
    return true;
};

// =======================================================
// GLOBAL LOGOUT HANDLER - BẮT CLICK DÙ HEADER LOAD ĐỘNG
// =======================================================
document.addEventListener("click", async function (e) {
    const logoutBtn = e.target.closest("#btnLogout");
    if (!logoutBtn) return;

    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") {
        e.stopImmediatePropagation();
    }

    try {
        await App.apiPost("/auth/logout", {});
    } catch (err) {
        console.error("Logout API error:", err);
    }

    App.clearAuth();

    try {
        location.replace("/login?logout=1");
    } catch (e) {
        window.location.href = "/login?logout=1";
    }
});

// =======================================================
// AUTO-UPDATE UI với thông tin user đã login
// =======================================================
document.addEventListener("DOMContentLoaded", function () {
    const user = App.getUser();
    
    // Cập nhật avatar dropdown nếu đã login
    if (user && user.employee) {
        const avatarName = document.querySelector(".nav-avatar-name");
        if (avatarName) {
            avatarName.textContent = user.employee.Name || user.username;
        }
    }
});
