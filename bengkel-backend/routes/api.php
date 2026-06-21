<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SparePartController;
use App\Http\Controllers\TransactionController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Endpoint untuk mengambil data (Read)
Route::get('/spare-parts', [SparePartController::class, 'index']);

// Endpoint untuk menyimpan data baru (Create)
Route::post('/spare-parts', [SparePartController::class, 'store']);

// Endpoint untuk mengubah data (Update)
Route::put('/spare-parts/{id}', [SparePartController::class, 'update']);

// Endpoint untuk menghapus data (Delete)
Route::delete('/spare-parts/{id}', [SparePartController::class, 'destroy']);
// Endpoint untuk memproses kasir (Checkout)
Route::post('/checkout', [TransactionController::class, 'store']);

Route::post('/get-snap-token', [TransactionController::class, 'getSnapToken']);

// Endpoint untuk mencari riwayat servis via plat nomor
Route::get('/history/{plat_nomor}', [TransactionController::class, 'history']);

// Endpoint untuk Dashboard Laporan Keuangan
Route::get('/report', [TransactionController::class, 'report']);