<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'status',
        'type',
        'description',
        'images',
        'desired_resolution',
        'resolution_type',
        'resolution_note',
        'admin_note',
        'resolved_at',
    ];

    protected $casts = [
        'images' => 'json',
        'resolved_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ComplaintItem::class);
    }
}
