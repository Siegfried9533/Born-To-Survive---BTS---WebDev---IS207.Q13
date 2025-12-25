<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        try {
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
                    $orderBy  = 'CustomerID';
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
                    $orderBy  = 'StoreID';
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
                    $orderBy  = 'ProductID';
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
                    $orderBy  = 'InvoiceID';
                    break;

                default:
                    return response()->json([
                        'status'  => 'error',
                        'message' => "Export type '{$type}' không được hỗ trợ.",
                    ], 400);
            }

            // Stream file CSV về client
            $headers = [
                'Content-Type'        => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                'Pragma'              => 'no-cache',
                'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
                'Expires'             => '0',
                'X-Accel-Buffering'   => 'no', // Tắt buffering cho nginx
            ];

            return response()->streamDownload(function () use ($query, $columns, $orderBy, $type) {
                // Thêm BOM UTF-8 để Excel hiển thị đúng tiếng Việt
                echo "\xEF\xBB\xBF";

                $handle = fopen('php://output', 'w');
                
                if ($handle === false) {
                    throw new \Exception('Không thể mở output stream');
                }

                // Ghi dòng header
                fputcsv($handle, $columns);

                // Ghi từng dòng dữ liệu (chunk để tránh tốn RAM)
                try {
                    $hasData = false;
                    $query->orderBy($orderBy)->chunk(1000, function ($rows) use ($handle, $columns, &$hasData) {
                        $hasData = true;
                        foreach ($rows as $row) {
                            $line = [];
                            foreach ($columns as $col) {
                                // Xử lý giá trị null và chuyển đổi sang array nếu cần
                                $value = isset($row->{$col}) ? $row->{$col} : '';
                                
                                // Chuyển đổi object/array thành string nếu cần
                                if (is_array($value) || (is_object($value) && !is_string($value))) {
                                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                                }
                                
                                // Chuyển đổi null thành chuỗi rỗng
                                if ($value === null) {
                                    $value = '';
                                }
                                
                                $line[] = $value;
                            }
                            fputcsv($handle, $line);
                        }
                        
                        // Flush output để đảm bảo dữ liệu được gửi ngay
                        if (ob_get_level() > 0) {
                            ob_flush();
                        }
                        flush();
                    });
                    
                    // Nếu không có dữ liệu, chỉ có header
                    if (!$hasData) {
                        // File vẫn được tạo với header, điều này là OK
                    }
                } catch (\Exception $e) {
                    fclose($handle);
                    throw $e;
                }

                fclose($handle);
            }, $fileName, $headers);

        } catch (\Exception $e) {
            \Log::error('Export Error: ' . $e->getMessage(), [
                'type' => $type ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi khi xuất dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }
}


