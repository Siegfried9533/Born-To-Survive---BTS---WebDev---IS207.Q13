@extends('app')

@section('title', 'Sales')

@section('content')

    <div id="filter-container">
        @include('partials.filter')
    </div>

    <section class="container-fluid-dashboard px-4 pb-5">
        <div class="card section-card shadow-sm">
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                <h5 class="mb-0 fw-semibold text-dark">Growth GMV ordered</h5>
                <button id="downloadBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </button>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 growth-table" id="growthTable">
                        <thead class="bg-light align-middle">
                            <tr>
                                <th rowspan="2" class="text-center" style="width: 10%;">Rank</th>
                                <th rowspan="2" class="text-center" style="width: 10%;">ID</th>
                                <th rowspan="2" class="store-header" style="width: 30%;">Store</th>
                                <th colspan="2" class="text-center" style="width: 50%;">Growth GMV Ordered</th>
                            </tr>
                            <tr class="sub-header bg-light-subtle">
                                <th class="text-end pe-4" style="width: 25%;">Omni <i id="sort-omni" class="fas fa-sort sort-icon ms-1 text-muted" style="font-size: 11px;"></i></th>
                                <th class="text-end pe-4" style="width: 25%;">InStore <i id="sort-instore" class="fas fa-sort sort-icon ms-1 text-muted" style="font-size: 11px;"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Data will be populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

@endsection

@push('scripts')
    {{-- Add page-specific scripts here if necessary --}}
@endpush