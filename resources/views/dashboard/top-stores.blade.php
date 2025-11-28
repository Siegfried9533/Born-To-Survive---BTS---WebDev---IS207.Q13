@extends('layouts.app')

@section('title', 'Top Stores Analysis')

@section('content')

    <div id="filter-container">
        @include('partials.filter')
        </div>

    <section class="container-fluid-dashboard px-4 pb-5">
        <div class="card section-card shadow-sm">

            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                <h5 class="mb-0 fw-semibold text-dark">Stores Information</h5>
                <button id="downloadBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </button>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 growth-table" id="storesTable">
                        <thead class="bg-light align-middle">
                            <tr>
                                <th rowspan="2" style="width: 5%;" class="text-center">Rank</th>
                                <th rowspan="2" style="width: 10%;">Store ID</th>
                                <th rowspan="2" style="width: 15%;">Name</th>
                                <th rowspan="2" style="width: 10%;">City</th>
                                <th rowspan="2" style="width: 10%;">Country</th>
                                <th rowspan="2" style="width: 10%;">ZIPCode</th>
                                <th rowspan="2" style="width: 10%;">Latitude</th>
                                <th rowspan="2" style="width: 10%;">Longitude</th>
                                <th colspan="2" style="width: 25%;">Growth GMV</th>
                            </tr>
                            <tr class="sub-header" style="background-color:#b30000; color:#fff;">
                                <th class="text-end pe-4 sortable" data-col="catSelected" style="cursor:pointer">
                                    Categories Selected <span class="sort-arrow"></span>
                                </th>
                                <th class="text-end pe-4 sortable" data-col="allCat" style="cursor:pointer">
                                    All Categories <span class="sort-arrow"></span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </section>

@endsection

@push('scripts')
    @vite('resources/js/top-stores.js')
    @vite('resources/js/filter-component.js')
@endpush