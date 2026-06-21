<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    protected $guarded = [];

    // Relasi ke master data spare part
    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
}
