<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class DokumenSertifikasi extends Model {
    protected $table = 'dokumen_sertifikasi'; protected $primaryKey = 'dokumen_id';
    protected $fillable = ['personel_id','nama_dokumen','jenis_dokumen','tanggal_upload','diupload_oleh','file_url','status_verifikasi'];
    public function personel()     { return $this->belongsTo(Personel::class, 'personel_id', 'personel_id'); }
    public function diuploadOleh() { return $this->belongsTo(AdminUser::class, 'diupload_oleh', 'admin_id'); }
}
