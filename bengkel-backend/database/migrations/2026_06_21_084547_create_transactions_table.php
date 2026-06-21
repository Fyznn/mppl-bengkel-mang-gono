<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('no_nota')->unique();
            $table->string('metode_pembayaran')->default('Cash'); // Tambahkan baris ini
            $table->string('nama_pelanggan')->nullable();
            $table->string('plat_nomor')->nullable();
            $table->decimal('total_harga', 12, 2);
            $table->decimal('uang_bayar', 12, 2);
            $table->decimal('kembalian', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
