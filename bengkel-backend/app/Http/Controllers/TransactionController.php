<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'metode_pembayaran' => 'required|in:Cash,QRIS',
            'uang_bayar' => 'required_if:metode_pembayaran,Cash|numeric',
            'items' => 'required|array',
            'items.*.spare_part_id' => 'required|exists:spare_parts,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $total_harga = 0;
            $no_nota = 'INV-' . date('Ymd') . '-' . rand(1000, 9999);

            foreach ($request->items as $item) {
                $sparepart = SparePart::find($item['spare_part_id']);
                if ($sparepart->stok < $item['jumlah']) {
                    return response()->json(['success' => false, 'message' => "Stok {$sparepart->nama_barang} tidak mencukupi!"], 400);
                }
                $total_harga += ($sparepart->harga_jual * $item['jumlah']);
            }

            // Jika QRIS, uang bayar otomatis disamakan dengan total harga (pas)
            $uang_bayar = $request->metode_pembayaran === 'QRIS' ? $total_harga : $request->uang_bayar;

            if ($uang_bayar < $total_harga) {
                return response()->json(['success' => false, 'message' => 'Uang pelanggan kurang!'], 400);
            }

            $transaction = Transaction::create([
                'no_nota' => $no_nota,
                'metode_pembayaran' => $request->metode_pembayaran,
                'nama_pelanggan' => $request->nama_pelanggan ?? 'Pelanggan Umum',
                'plat_nomor' => $request->plat_nomor,
                'total_harga' => $total_harga,
                'uang_bayar' => $uang_bayar,
                'kembalian' => $uang_bayar - $total_harga,
            ]);

            foreach ($request->items as $item) {
                $sparepart = SparePart::find($item['spare_part_id']);
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'spare_part_id' => $item['spare_part_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $sparepart->harga_jual,
                    'subtotal' => $sparepart->harga_jual * $item['jumlah'],
                ]);
                $sparepart->decrement('stok', $item['jumlah']);
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Transaksi berhasil dicatat!', 'data' => $transaction], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function getSnapToken(Request $request)
    {
        // Set konfigurasi Midtrans
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $order_id = 'INV-' . date('Ymd') . '-' . rand(1000, 9999);
        $total_harga = $request->total_harga;

        $params = array(
            'transaction_details' => array(
                'order_id' => $order_id,
                'gross_amount' => $total_harga,
            ),
            'customer_details' => array(
                'first_name' => $request->nama_pelanggan ?? 'Pelanggan Bengkel',
            ),
        );

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            return response()->json(['success' => true, 'snap_token' => $snapToken, 'order_id' => $order_id]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    // Fungsi untuk mencari riwayat berdasarkan plat nomor
    public function history($plat_nomor)
    {
        // Ambil transaksi beserta detail barangnya
        $transactions = Transaction::with('details.sparePart')
            ->where('plat_nomor', 'LIKE', "%{$plat_nomor}%")
            ->orderBy('created_at', 'desc') // Urutkan dari yang paling baru
            ->get();

        if ($transactions->isEmpty()) {
            return response()->json([
                'success' => false, 
                'message' => 'Data kendaraan tidak ditemukan atau belum pernah servis.'
            ], 404);
        }

        return response()->json([
            'success' => true, 
            'data' => $transactions
        ]);
    }
    // Fungsi untuk Laporan Keuangan (Dashboard)
    public function report()
    {
        // Gunakan Carbon bawaan Laravel untuk manipulasi waktu
        $today = \Carbon\Carbon::today();
        $thisMonth = \Carbon\Carbon::now()->month;
        $thisYear = \Carbon\Carbon::now()->year;

        // Kalkulasi Total Pendapatan
        $revenue_today = Transaction::whereDate('created_at', $today)->sum('total_harga');
        $revenue_month = Transaction::whereMonth('created_at', $thisMonth)
                                    ->whereYear('created_at', $thisYear)
                                    ->sum('total_harga');
        
        // Hitung jumlah kendaraan yang servis hari ini
        $transactions_today = Transaction::whereDate('created_at', $today)->count();

        // Ambil 10 transaksi terakhir untuk tabel riwayat singkat
        $recent_transactions = Transaction::orderBy('created_at', 'desc')->take(10)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'revenue_today' => $revenue_today,
                'revenue_month' => $revenue_month,
                'transactions_today' => $transactions_today,
                'recent_transactions' => $recent_transactions
            ]
        ]);
    }
}