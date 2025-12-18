<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>@yield('title', 'Sales Report')</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css" />
    
    <link rel="shortcut icon" href="/assets/images/Favicon.png" type="image/x-icon">
    
    @vite(['resources/css/style.css', 'resources/js/main.js'])
    
    @stack('styles')
    
    <script>
        window.Laravel = {
            baseUrl: "{{ url('/') }}"
        };
    </script>
</head>

<body>
    <aside id="sidebar" class="sidebar">
        @include('partials.sidebar')
    </aside>

    <main class="main-content">
        <header id="app-header">
            @yield('header', view('partials.sales-header'))
        </header>

        <div id="page-content">
            @yield('content')
        </div>

        <footer id="app-footer">
            @include('partials.footer')
        </footer>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/litepicker/dist/litepicker.js"></script>

    @stack('scripts')
</body>
</html>
