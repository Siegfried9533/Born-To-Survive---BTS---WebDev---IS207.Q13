<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Customers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css" />
    <link rel="shortcut icon" href="/assets/images/Favicon.png" type="image/x-icon">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
</head>

<body>
    <aside id="sidebar" class="sidebar"></aside>
    <main class="main-content">
        <header id="app-header"></header>
        <div id="filter-container"></div>

        <section class="container-fluid-dashboard px-4 pb-5">
            <div class="card section-card shadow-sm">
                <div
                    class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                    <h5 class="mb-0 fw-semibold text-dark">Top Customers by Revenue</h5>
                    <button id="downloadBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>

                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 growth-table" id="customerTable">
                            <thead class="bg-light align-middle">
                                <tr>
                                    <th rowspan="2" class="text-center">Rank</th>
                                    <th rowspan="2" class="text-center">Customer ID</th>
                                    <th rowspan="2">Customer Name</th>
                                    <th colspan="2" class="text-center">Performance</th>
                                </tr>
                                <tr class="sub-header bg-light-subtle">
                                    <th class="text-end pe-4">
                                        Revenue <i id="sort-revenue" class="fas fa-sort sort-icon ms-1 text-muted"
                                            style="font-size: 11px;"></i>
                                    </th>
                                    <th class="text-end pe-4">
                                        Orders <i id="sort-orders" class="fas fa-sort sort-icon ms-1 text-muted"
                                            style="font-size: 11px;"></i>
                                    </th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/litepicker/dist/litepicker.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script src="../js/main.js"></script>
    <!-- JS riêng cho trang này -->
    <script src="../js/main.js"></script>
</body>

</html>