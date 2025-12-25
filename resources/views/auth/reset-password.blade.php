<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reset Password - Modalab</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="shortcut icon" href="/assets/images/Favicon.png" type="image/x-icon" />
    <link rel="stylesheet" href="/frontend/css/style.css" />
    <link rel="stylesheet" href="/frontend/css/sign-in.css" />
</head>

<body>
    <div id="loading-screen">
        <div class="loader">
            <div class="spinner"></div>
        </div>
    </div>

    <header class="nav-overlay">
        <div class="container">
            <div class="nav-inner d-flex align-items-center justify-content-between">
                <div class="nav-left d-flex align-items-center">
                    <img src="/assets/images/Logo-02.png" alt="logo" class="nav-logo me-2" />
                    <span class="nav-title">MODALAB</span>
                </div>
            </div>
        </div>
    </header>

    <main class="fade-page">
        <div class="signin-container d-flex flex-column flex-md-row vh-100">
            <div class="left justify-content-center align-items-center w-100 w-md-50">
                <div class="form-wrapper">
                    <h2 class="title-main mb-2">Reset Password</h2>
                    <p class="mb-4">Enter your new password</p>

                    <form id="resetPasswordForm">
                        <!-- Current password (shown only if authenticated) -->
                        <div id="oldPasswordGroup" class="mb-3 d-none">
                            <label class="form-label fs-small">Current Password</label>
                            <div class="input-group">
                                <input type="password" id="oldPasswordInput" class="form-control" placeholder="Current password" />
                                <span class="input-group-text password-toggle-icon" data-target="#oldPasswordInput">
                                    <i class="fa-solid fa-eye-slash"></i>
                                </span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fs-small">New Password</label>
                            <div class="input-group">
                                <input type="password" id="newPasswordInput" class="form-control" placeholder="New password" />
                                <span class="input-group-text password-toggle-icon" data-target="#newPasswordInput">
                                    <i class="fa-solid fa-eye-slash"></i>
                                </span>
                            </div>
                            <div id="strengthBar" class="strength-bar mt-2"></div>
                            <div id="strengthText" class="mt-1 fs-small"></div>
                            <ul id="passwordRequirements" class="mt-2 fs-small"></ul>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fs-small">Confirm Password</label>
                            <div class="input-group">
                                <input type="password" id="confirmPasswordInput" class="form-control" placeholder="Confirm password" />
                                <span class="input-group-text password-toggle-icon" data-target="#confirmPasswordInput">
                                    <i class="fa-solid fa-eye-slash"></i>
                                </span>
                            </div>
                        </div>

                        <button type="submit" id="resetBtn" class="btn btn-primary fw-bold w-100 mb-3">
                            Reset Password
                        </button>
                    </form>

                    <div class="text-center">
                        <a href="{{ route('auth.login') }}" class="link-page text-decoration-none fs-small">
                            Back to Sign In
                        </a>
                    </div>
                </div>
            </div>

            <div class="right d-none d-md-flex p-5">
                <img src="/assets/images/Logo-01.png" alt="Modalab" width="110" class="mb-3" />
                <h1 class="fw-bold">MODALAB</h1>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-left fs-small">© 2025 <b>BTS - Born to Survive</b></div>
            <div class="footer-right fs-small">
                <a href="https://sites.google.com/gm.uit.edu.vn/bts/" class="text-decoration-none me-4">Born to Survive</a>
                <a href="https://sites.google.com/gm.uit.edu.vn/bts/%C4%91%E1%BB%93-%C3%A1n/h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn" class="text-decoration-none me-4">Documentation</a>
                <a href="#" class="text-decoration-none">License</a>
            </div>
        </div>
    </footer>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js"></script>
    <script src="/frontend/js/app-core.js"></script>
    <script src="/frontend/js/main.js"></script>
    <script src="/frontend/js/forgot-reset.js"></script>
</body>
</html>
