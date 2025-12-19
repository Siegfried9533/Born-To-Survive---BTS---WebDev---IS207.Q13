import $ from 'jquery';
import { fetchCustomers, fetchAllCustomersForExport } from './api.js';

/* ======================================================= */
/* CUSTOMERS PAGE: Load danh sách khách hàng từ API */
/* ======================================================= */

let currentPage = 1;

async function loadCustomers(page = 1) {
    const tableBody = $('#topCustomerTable tbody');
    
    // Hiển thị loading
    tableBody.html(`
        <tr>
            <td colspan="5" class="text-center py-4 text-muted">
                <i class="fas fa-spinner fa-spin me-2"></i> Loading data from API...
            </td>
        </tr>
    `);

    try {
        const response = await fetchCustomers(page);
        const result = response.data;

        if (result.status === 'success' && result.data && result.data.data) {
            const customers = result.data.data;
            const paginationData = result.data;

            if (customers.length === 0) {
                tableBody.html(`
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                            <i class="fas fa-inbox me-2"></i> No customers found
                        </td>
                    </tr>
                `);
                return;
            }

            // Render dữ liệu
            let html = '';
            customers.forEach((customer, index) => {
                const rankClass = getRankClass(customer.rank);
                const rowNumber = (paginationData.current_page - 1) * paginationData.per_page + index + 1;

                html += `
                    <tr>
                        <td class="text-center fw-semibold">${rowNumber}</td>
                        <td class="text-center text-muted">${customer.CustomerID}</td>
                        <td>
                            <div>
                                <div class="fw-semibold">${customer.Name || 'N/A'}</div>
                                <small class="text-muted">${customer.Email || 'N/A'}</small>
                            </div>
                        </td>
                        <td class="text-end pe-4 fw-semibold">
                            ${formatCurrency(customer.total_spent)}
                        </td>
                        <td class="text-end pe-4">
                            <span class="badge ${rankClass}">${customer.rank}</span>
                        </td>
                    </tr>
                `;
            });

            tableBody.html(html);

            // Render pagination
            renderPagination(paginationData);

            console.log('✅ Customers loaded successfully:', customers.length);
        } else {
            throw new Error('Invalid API response structure');
        }
    } catch (error) {
        console.error('❌ Error loading customers:', error);
        tableBody.html(`
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i> 
                    Failed to load data. Please check console (F12).
                </td>
            </tr>
        `);
    }
}

function renderPagination(data) {
    const paginationContainer = $('#topCustomerTable').closest('.card').find('.card-footer');
    
    // Xóa pagination cũ nếu có
    if (paginationContainer.length === 0) {
        $('#topCustomerTable').closest('.card-body').after(`
            <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center py-3 px-4">
                <div class="text-muted small" id="pagination-info"></div>
                <nav id="pagination-nav"></nav>
            </div>
        `);
    }

    // Thông tin phân trang
    const from = data.from || 0;
    const to = data.to || 0;
    const total = data.total || 0;
    $('#pagination-info').html(`Showing ${from} to ${to} of ${total} customers`);

    // Nút phân trang
    let paginationHtml = '<ul class="pagination pagination-sm mb-0">';

    // Previous button
    if (data.current_page > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${data.current_page - 1}">Previous</a>
            </li>
        `;
    } else {
        paginationHtml += `
            <li class="page-item disabled">
                <span class="page-link">Previous</span>
            </li>
        `;
    }

    // Page numbers (hiển thị tối đa 5 trang)
    const maxPages = 5;
    let startPage = Math.max(1, data.current_page - Math.floor(maxPages / 2));
    let endPage = Math.min(data.last_page, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === data.current_page) {
            paginationHtml += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
    }

    // Next button
    if (data.current_page < data.last_page) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${data.current_page + 1}">Next</a>
            </li>
        `;
    } else {
        paginationHtml += `
            <li class="page-item disabled">
                <span class="page-link">Next</span>
            </li>
        `;
    }

    paginationHtml += '</ul>';
    $('#pagination-nav').html(paginationHtml);

    // Bind click events
    $('#pagination-nav .page-link').on('click', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page) {
            currentPage = page;
            loadCustomers(page);
        }
    });
}

function getRankClass(rank) {
    const classes = {
        'VIP': 'bg-danger text-white',
        'Gold': 'bg-warning text-dark',
        'Member': 'bg-secondary text-white'
    };
    return classes[rank] || 'bg-secondary text-white';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

// Download CSV functionality
async function downloadCustomersCSV() {
    const btn = $('#downloadBtn');
    const originalHtml = btn.html();
    
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i> Downloading...');

    try {
        const response = await fetchAllCustomersForExport();
        const result = response.data;

        if (result.status === 'success' && result.data) {
            const customers = result.data;

            // Tạo CSV content
            let csv = 'Rank,Customer ID,Customer Name,Email,Phone,City,Country,Total Spent,Rank Level\n';

            customers.forEach((customer, index) => {
                const row = [
                    index + 1,
                    customer.CustomerID,
                    `"${customer.Name || 'N/A'}"`,
                    `"${customer.Email || 'N/A'}"`,
                    customer.Telephone || 'N/A',
                    customer.City || 'N/A',
                    customer.Country || 'N/A',
                    customer.total_spent || 0,
                    customer.rank
                ].join(',');
                csv += row + '\n';
            });

            // Download file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ CSV downloaded successfully');
        }
    } catch (error) {
        console.error('❌ Error downloading CSV:', error);
        alert('Failed to download CSV. Please check console (F12).');
    } finally {
        btn.prop('disabled', false).html(originalHtml);
    }
}

// Initialize when DOM is ready
$(document).ready(function() {
    console.log('🚀 Customers page initialized');
    
    // Load initial data
    loadCustomers(1);

    // Download button handler
    $('#downloadBtn').on('click', function(e) {
        e.preventDefault();
        downloadCustomersCSV();
    });
});
