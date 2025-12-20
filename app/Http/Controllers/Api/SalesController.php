<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        // Biểu thức tính GMV
        $amountExprSql = 'COALESCE(transactions.LineTotal, transactions.Quantity * transactions.UnitPrice)';

        // Lấy ngày từ request, mặc định 2 năm gần nhất để bao phủ dữ liệu cũ
        $fromDate = $request->input('from') 
            ? Carbon::parse($request->input('from'))->startOfDay() 
            : Carbon::now()->subYears(2)->startOfDay();
        $toDate = $request->input('to') 
            ? Carbon::parse($request->input('to'))->endOfDay() 
            : Carbon::now()->endOfDay();

        // ============================================================
        // 1. TỔNG DOANH THU & ĐƠN HÀNG THEO NGÀY (cho popup chart)
        // ============================================================
        $dailyData = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$fromDate, $toDate])
            ->selectRaw("CONVERT(DATE, transactions.DATE) as date")
            ->selectRaw("SUM($amountExprSql) as revenue")
            ->selectRaw("COUNT(DISTINCT transactions.InvoiceID) as orders")
            ->groupBy(DB::raw("CONVERT(DATE, transactions.DATE)"))
            ->orderBy(DB::raw("CONVERT(DATE, transactions.DATE)"))
            ->get();

        $totalRevenue = $dailyData->sum('revenue');
        $totalOrders = $dailyData->sum('orders');
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calculate Active Stores
        $activeStores = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$fromDate, $toDate])
            ->distinct('StoreID')
            ->count('StoreID');

        // Prepare chart_data for frontend
        $chartData = $dailyData->map(function($item) {
            return [
                'date' => $item->date,
                'revenue' => (float) $item->revenue,
                'total_orders' => (int) $item->orders
            ];
        });

        // ============================================================
        // 2. GROWTH YoY - So sánh với cùng kỳ năm trước
        // ============================================================
        $prevYearFrom = $fromDate->copy()->subYear();
        $prevYearTo = $toDate->copy()->subYear();

        $prevYearRevenue = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$prevYearFrom, $prevYearTo])
            ->selectRaw("SUM($amountExprSql) as revenue")
            ->value('revenue') ?? 0;

        $growthYoY = $prevYearRevenue > 0 
            ? round((($totalRevenue - $prevYearRevenue) / $prevYearRevenue) * 100, 1) 
            : 0;

        // ============================================================
        // 3. SALE BY CHANNEL - Biểu đồ tròn theo PaymentMethod
        // ============================================================
        $channels = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$fromDate, $toDate])
            ->select('PaymentMethod', DB::raw("SUM($amountExprSql) as revenue"))
            ->groupBy('PaymentMethod')
            ->orderByDesc('revenue')
            ->get();

        $channelLabels = [];
        $channelValues = [];
        $channelColors = ['#647acb', '#48bb78', '#f6ad55', '#f56565', '#9f7aea', '#ed64a6', '#38b2ac'];
        $totalChannelRevenue = $channels->sum('revenue');

        foreach ($channels as $idx => $ch) {
            $channelLabels[] = $ch->PaymentMethod ?: 'Unknown';
            $percent = $totalChannelRevenue > 0 ? round(($ch->revenue / $totalChannelRevenue) * 100, 1) : 0;
            $channelValues[] = $percent;
        }

        // ============================================================
        // 4. TOP 10 BEST-SELLING PRODUCTS (theo SubCategory)
        // ============================================================
        $topProducts = DB::table('transactions')
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->whereBetween('transactions.DATE', [$fromDate, $toDate])
            ->select(
                'products.SubCategory',
                DB::raw("SUM(transactions.Quantity) as total_qty"),
                DB::raw("SUM($amountExprSql) as total_revenue")
            )
            ->groupBy('products.SubCategory')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        $topProductLabels = [];
        $topProductValues = [];
        foreach ($topProducts as $p) {
            $topProductLabels[] = $p->SubCategory ?: 'Unknown';
            $topProductValues[] = (int) $p->total_qty;
        }

        // ============================================================
        // 5. SALE TREND - 30 ngày trước ngày B
        // ============================================================
        $trendFrom = $toDate->copy()->subDays(30)->startOfDay();
        $trendTo = $toDate->copy()->endOfDay();

        $trendData = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$trendFrom, $trendTo])
            ->selectRaw("CONVERT(DATE, transactions.DATE) as date")
            ->selectRaw("SUM($amountExprSql) as revenue")
            ->groupBy(DB::raw("CONVERT(DATE, transactions.DATE)"))
            ->orderBy(DB::raw("CONVERT(DATE, transactions.DATE)"))
            ->get();

        $trendLabels = [];
        $trendValues = [];
        foreach ($trendData as $t) {
            $trendLabels[] = Carbon::parse($t->date)->format('d/m');
            $trendValues[] = (float) $t->revenue;
        }

        // ============================================================
        // 6. TOP 10 PROVINCES BY REVENUE (dựa trên Store City)
        // ============================================================
        $topProvinces = DB::table('transactions')
            ->join('stores', 'transactions.StoreID', '=', 'stores.StoreID')
            ->whereBetween('transactions.DATE', [$fromDate, $toDate])
            ->select(
                'stores.City',
                DB::raw("SUM($amountExprSql) as revenue")
            )
            ->groupBy('stores.City')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $provinces = [];
        foreach ($topProvinces as $idx => $p) {
            $percent = $totalRevenue > 0 ? round(($p->revenue / $totalRevenue) * 100, 1) : 0;
            $provinces[] = [
                'rank' => $idx + 1,
                'city' => $p->City ?: 'Unknown',
                'revenue' => (float) $p->revenue,
                'percent' => $percent
            ];
        }

        // ============================================================
        // 7. TOP 10 SALES REPRESENTATIVES (Employees)
        // ============================================================
        $topEmployees = DB::table('transactions')
            ->join('employees', 'transactions.EmployeeID', '=', 'employees.EmployeeID')
            ->whereBetween('transactions.DATE', [$fromDate, $toDate])
            ->select(
                'employees.EmployeeID',
                'employees.Name',
                DB::raw("SUM($amountExprSql) as revenue"),
                DB::raw("COUNT(DISTINCT transactions.InvoiceID) as orders")
            )
            ->groupBy('employees.EmployeeID', 'employees.Name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $employees = [];
        foreach ($topEmployees as $idx => $e) {
            $aov = $e->orders > 0 ? $e->revenue / $e->orders : 0;
            $employees[] = [
                'rank' => $idx + 1,
                'name' => $e->Name ?: 'Unknown',
                'revenue' => (float) $e->revenue,
                'orders' => (int) $e->orders,
                'aov' => round($aov, 0)
            ];
        }

        // ============================================================
        // RESPONSE
        // ============================================================
        return response()->json([
            'status' => 'success',
            'filter' => [
                'from' => $fromDate->format('Y-m-d'),
                'to' => $toDate->format('Y-m-d')
            ],
            // Summary Cards
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => (int) $totalOrders,
                'active_stores' => (int) $activeStores,
                'avg_order_value' => round($avgOrderValue, 0),
                'growth_yoy' => $growthYoY,
            ],
            // Chart Data for Frontend
            'chart_data' => $chartData,
            // Daily Data cho popup charts
            'daily_data' => [
                'labels' => $dailyData->pluck('date')->map(fn($d) => Carbon::parse($d)->format('d/m'))->toArray(),
                'revenue' => $dailyData->pluck('revenue')->map(fn($v) => (float) $v)->toArray(),
                'orders' => $dailyData->pluck('orders')->map(fn($v) => (int) $v)->toArray(),
            ],
            // Sale by Channel (Pie chart)
            'channels' => [
                'labels' => $channelLabels,
                'values' => $channelValues,
                'colors' => array_slice($channelColors, 0, count($channelLabels)),
            ],
            // Top 10 SubCategories (Bar chart)
            'top_products' => [
                'labels' => $topProductLabels,
                'values' => $topProductValues,
            ],
            // Sale Trend 30 days (Line chart)
            'trend' => [
                'labels' => $trendLabels,
                'values' => $trendValues,
            ],
            // Tables
            'top_provinces' => $provinces,
            'top_employees' => $employees,
        ]);
    }
}
