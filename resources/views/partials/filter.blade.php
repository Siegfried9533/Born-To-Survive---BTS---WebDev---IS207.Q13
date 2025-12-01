<div class="filter-group" data-max="3">
    <label class="filter-label">
        <i class="fa-solid fa-store"></i> Stores:
    </label>
    <div class="filter-display-box" tabindex="0">
        <span class="filter-display-text">&nbsp;</span>
    </div>
    <div class="filter-dropdown">
        @php $stores = isset($stores) ? $stores : []; @endphp
        @forelse($stores as $s)
            @php
                $sid = isset($s->StoreID) ? $s->StoreID : (isset($s['StoreID']) ? $s['StoreID'] : '');
                $sname = isset($s->Name) ? $s->Name : (isset($s['Name']) ? $s['Name'] : ($sid ?: 'Unknown'));
                $inputId = 'store_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $sid ?: $loop->index);
            @endphp
            <div class="filter-item">
                <input type="checkbox" id="{{ $inputId }}" value="{{ $sid }}" data-store-id="{{ $sid }}">
                <label for="{{ $inputId }}">{{ $sname }}</label>
            </div>
        @empty
        @endforelse
    </div>
</div>

<div class="filter-group" data-max="10" id="category-filter-group">
    <label class="filter-label">
        <i class="fa-solid fa-tags"></i> Category:
    </label>
    <div class="filter-display-box" tabindex="0">
        <span class="filter-display-text">&nbsp;</span>
    </div>
    <div class="filter-dropdown">
    </div>
</div>
<div class="filter-group">
    <label class="filter-label">
        <i class="fa-solid fa-arrow-down-wide-short"></i> Sort by:
    </label>
    <div class="filter-display-box" tabindex="0">
        <span class="filter-display-text">Default</span>
    </div>
    <div class="filter-dropdown">
        <div class="filter-item">
            <input type="radio" id="sort_default" name="sort" value="Default" checked>
            <label for="sort_default">Default</label>
        </div>
        <div class="filter-item">
            <input type="radio" id="sort_prog" name="sort" value="Prog">
            <label for="sort_prog">Prog</label>
        </div>
        <div class="filter-item">
            <input type="radio" id="sort_vol" name="sort" value="Volumn">
            <label for="sort_vol">Volumn</label>
        </div>
    </div>
</div>

<button class="btn-apply-filters">Apply Filters</button>