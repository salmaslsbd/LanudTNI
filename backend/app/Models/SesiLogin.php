<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SesiLogin extends Model {
    protected $table = 'sesi_login'; protected $primaryKey = 'sesi_id';
    protected $fillable = ['admin_id','browser_os','ip_address','waktu_login','waktu_logout','status_sesi','token_hash'];
    public function admin() { return $this->belongsTo(AdminUser::class, 'admin_id', 'admin_id'); }
}
