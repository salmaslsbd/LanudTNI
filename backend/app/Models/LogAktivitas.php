<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LogAktivitas extends Model {
    protected $table = 'log_aktivitas'; protected $primaryKey = 'log_id';
    protected $fillable = ['admin_id','personel_id','jenis_aksi','tabel_terdampak','deskripsi_aksi','timestamp','ip_address','data_sebelum','data_sesudah'];
    protected $casts   = ['data_sebelum' => 'array', 'data_sesudah' => 'array'];
    public function admin()    { return $this->belongsTo(AdminUser::class, 'admin_id', 'admin_id'); }
    public function personel() { return $this->belongsTo(Personel::class, 'personel_id', 'personel_id'); }
}
