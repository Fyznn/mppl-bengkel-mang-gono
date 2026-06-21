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
    Schema::create('transaction_details', function (Blueprint $table) {
        $table->id();
        // Relasi ke tabel transactions
        $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
        // Relasi ke tabel spare_parts
        $table->foreignId('spare_part_id')->constrained()->onDelete('restrict');
        $table->integer('jumlah');
        $table->decimal('harga_satuan', 10, 2);
        $table->decimal('subtotal', 12, 2);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_details');
    }
};
