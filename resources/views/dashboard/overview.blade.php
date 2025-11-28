<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Overview</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css" />
    <link rel="shortcut icon" href="{{ asset('images/Favicon.png') }}" type="image/x-icon">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body>
    <aside id="sidebar" class="sidebar"></aside>

    <main class="main-content fade-page">
        <header id="app-header"></header>
        <div id="filter-container"></div>

        <section class="container-fluid-dashboard px-4 py-3">
            <div class="row g-4">

                <!-- 1. Modalab Synthesis -->
                <div class="col-lg-6">
                    <div class="card section-card h-100">
                        <div class="card-body p-4 d-flex flex-column">
                            <h5 class="card-title mb-3">Modalab Synthesis</h5>
                            <div class="chart-wrapper">
                                <canvas id="modalabChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. Sales Channels -->
                <div class="col-lg-6">
                    <div class="card section-card h-100">
                        <div class="card-body p-4 d-flex flex-column">
                            <h5 class="card-title mb-3">Percentage of Products Sold</h5>
                            <div class="chart-wrapper">
                                <canvas id="salesChannelsChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. GMV Evolution (dưới) -->
                <div class="col-12 mt-4">
                    <div class="card section-card">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0">Evolution of GMV over 12 months</h5>
                                <span class="text-warning fw-bold">Growth</span>
                            </div>
                            <div class="chart-wrapper-evolution">
                                <canvas id="gmvEvolutionChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>

        <footer id="app-footer"></footer>
    </main>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/litepicker/dist/litepicker.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>