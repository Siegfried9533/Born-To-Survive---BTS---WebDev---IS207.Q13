<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Forgot Password</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="shortcut icon" href="{{ asset('images/Favicon.png') }}" type="image/x-icon">
    @vite(['resources/css/style.css', 'resources/css/sign-in.css'])
    
</head>

<body>
    <!-- Loading -->
    <div id="loading-screen">
        <div class="loader">
            <div class="spinner"></div>
        </div>
    </div>

    <!-- NAVBAR -->
    <header class="nav-overlay">
        <div class="container">
            <div class="nav-inner d-flex align-items-center justify-content-between">
                <div class="nav-left d-flex align-items-center">
                    <img src="{{ asset('images/Logo-02.png') }}" alt="logo" class="nav-logo me-2">
                    <span class="nav-title">MODALAB</span>
                </div>

                <nav class="nav-center d-none d-md-flex align-items-center fs-small">
                    <a href="{{ url('/dashboard/overview') }}" class="nav-link">
                        <i class="fa-solid fa-chart-line me-2"></i>
                        DASHBOARD
                    </a>

                    <a href="{{ url('/profile') }}" class="nav-link">
                        <i class="fa-solid fa-user me-2"></i>
                        PROFILE
                    </a>

                    <a href="{{ url('/') }}" class="nav-link">
                        <i class="fa-solid fa-key me-2"></i>
                        SIGN IN
                    </a>
                </nav>

                <div class="nav-right">
                    <a href="{{ url('/auth/sign-up') }}" class="btn btn-signup">SIGN UP</a>
                </div>
            </div>
        </div>
    </header>

    <!-- CONTENT -->
    <main class="fade-page">
        <div class="signin-container d-flex flex-column flex-md-row vh-100">
            <!-- Left Side (Form) -->
            <div class="left justify-content-center align-items-center w-100 w-md-50">
                <div class="form-wrapper">
                    <h2 class="title-main mb-2">Forgot Password</h2>
                    <p class="mb-4">Enter your email address to change password</p>

                    <form id="forgotPasswordForm">
                        <div class="mb-3">
                            <label class="form-label fs-small">Email</label>
                            <input type="email" id="emailInput" class="form-control" placeholder="Your email address">
                        </div>

                        <button type="button" id="continueBtn"
                            class="btn btn-primary fw-bold w-100 mb-3">Continue</button>
                    </form>
                </div>
            </div>

            <!-- Right Side (Banner) -->
            <div class="right d-none d-md-flex p-5">
                <img src="{{ asset('images/Logo-01.png') }}" alt="Modalab" width="110" class="mb-3">
                <h1 class="fw-bold">MODALAB</h1>
            </div>
        </div>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-left fs-small">
                © 2025 <b>BTS - Born to Survive</b>
            </div>
            <div class="footer-right fs-small">
                <a href="https://sites.google.com/gm.uit.edu.vn/bts/" class="text-decoration-none me-4">Born to
                    Survive</a>
                <a href="https://sites.google.com/gm.uit.edu.vn/bts/%C4%91%E1%BB%93-%C3%A1n/h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn"
                    class="text-decoration-none me-4">Documentation</a>
                <a href="#" class="text-decoration-none">License</a>
            </div>
        </div>
    </footer>


    <!-- JS -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    @vite(['resources/js/main.js', 'resources/js/sign-in.js'])
</body>

</html>