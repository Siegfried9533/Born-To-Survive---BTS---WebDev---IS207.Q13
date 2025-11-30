@extends('layouts.app')

@section('title', 'Top Products Analysis')

@section('content')

    <div id="filter-container">
        @include('partials.filter')
    </div>

    <section class="container-fluid-dashboard px-4 pb-5">
        <div class="card section-card shadow-sm">

            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                <h5 class="mb-0 fw-semibold text-dark">Top Products Growth GMV</h5>
                <button id="downloadProductBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </button>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 growth-table" id="topProductsTable">
                        <thead class="bg-light align-middle">
                            <tr>
                                <th style="width: 10%;" class="text-center">Rank</th>
                                <th style="width: 10%;">ID</th>
                                <th style="width: 30%;">Model</th>
                                <th class="text-end pe-4" style="width: 25%;">
                                    Delta GMV
                                    <i id="sort-delta" class="fas fa-sort sort-icon ms-1 text-muted"></i>
                                </th>
                                <th class="text-end pe-4" style="width: 25%;">
                                    InStore GMV
                                    <i id="sort-instore" class="fas fa-sort sort-icon ms-1 text-muted"></i>
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
    @vite('resources/js/top-products.js')
    @vite('resources/js/filter-component.js')
@endpush