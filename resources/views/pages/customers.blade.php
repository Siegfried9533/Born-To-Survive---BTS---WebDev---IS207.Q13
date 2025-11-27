@extends('app')

@section('title', 'Customers')

@section('content')

    <div id="filter-container">
        @include('partials.filter')
    </div>

    <section class="container-fluid-dashboard px-4 pb-5">
        <div class="card section-card shadow-sm">
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
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
                                    Revenue <i id="sort-revenue" class="fas fa-sort sort-icon ms-1 text-muted" style="font-size: 11px;"></i>
                                </th>
                                <th class="text-end pe-4">
                                    Orders <i id="sort-orders" class="fas fa-sort sort-icon ms-1 text-muted" style="font-size: 11px;"></i>
                                </th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

@endsection

@push('scripts')
    {{-- Page-specific scripts can be added here if needed, e.g.: @vite('resources/js/customers.js') --}}
@endpush