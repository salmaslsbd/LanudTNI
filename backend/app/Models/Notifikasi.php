<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Notifikasi extends Model {
    protected $table = 'notifikasi'; protected $primaryKey = 'notif_id';
    protected $fillable = ['admin_id','judul','isi_notifikasi','is_dibaca','created_at'];
    public function admin() { return $this->belongsTo(AdminUser::class, 'admin_id', 'admin_id'); }
}
