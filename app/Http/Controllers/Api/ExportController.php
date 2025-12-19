<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportController extends Controller
{
    /**
     * API chung để xuất dữ liệu dạng CSV.
     *
     * GET /api/export/{type}
     * Ví dụ: /api/export/customers, /api/export/stores, /api/export/products, /api/export/invoices
     */
    public function export(string $type, Request $request)
    {
        $type = strtolower($type);
        $now  = now()->format('Ymd_His');

        switch ($type) {
            case 'customers':
                $fileName = "customers_export_{$now}.csv";
                $columns  = [
                    'CustomerID',
                    'Name',
                    'Telephone',
                    'Email',
                    'City',
                    'Country',
                    'Gender',
                    'DateOfBirth',
                    'JobTitle',
                ];
                $query    = DB::table('customers')->select($columns);
                break;

            case 'stores':
                $fileName = "stores_export_{$now}.csv";
                $columns  = [
                    'StoreID',
                    'StoreName',
                    'City',
                    'Country',
                    'NumberOfEmployee',
                    'ZipCode',
                    'Latitude',
                    'Longitude',
                ];
                $query    = DB::table('stores')->select($columns);
                break;

            case 'products':
                $fileName = "products_export_{$now}.csv";
                $columns  = [
                    'ProductID',
                    'Category',
                    'SubCategory',
                    'Description',
                    'Color',
                    'Size',
                    'ProductCost',
                ];
                $query    = DB::table('products')->select($columns);
                break;

            case 'transactions':
            case 'invoices': // alias cũ
                $fileName = "transactions_export_{$now}.csv";
                $columns  = [
                    'InvoiceID',
                    'InvoiceHASH',
                    'Line',
                    'CustomerID',
                    'ProductID',
                    'Size',
                    'Color',
                    'UnitPrice',
                    'Quantity',
                    'DATE',
                    'DiscountID',
                    'LineTotal',
                    'StoreID',
                    'EmployeeID',
                    'Currency',
                    'CurrencySymbol',
                    'SKU',
                    'TransactionType',
                    'PaymentMethod',
                    'InvoiceTotal',
                ];
                $query    = DB::table('transactions')->select($columns);
                break;

            default:
                return response()->json([
                    'status'  => 'error',
                    'message' => "Export type '{$type}' không được hỗ trợ.",
                ], 400);
        }

        // Stream file CSV về client
        return response()->streamDownload(function () use ($query, $columns) {
            $handle = fopen('php://output', 'w');

            // Ghi dòng header
            fputcsv($handle, $columns);

            // Ghi từng dòng dữ liệu (chunk để tránh tốn RAM)
            $query->orderBy($columns[0])->chunk(1000, function ($rows) use ($handle, $columns) {
                foreach ($rows as $row) {
                    $line = [];
                    foreach ($columns as $col) {
                        $line[] = $row->{$col};
                    }
                    fputcsv($handle, $line);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}


