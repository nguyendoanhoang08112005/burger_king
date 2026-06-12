<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'product_id',
        'product_name',
        'issue_type',
        'note',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
