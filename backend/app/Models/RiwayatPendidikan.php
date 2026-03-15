<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RiwayatPendidikan extends Model {
    protected $table = 'riwayat_pendidikan'; protected $primaryKey = 'pendidikan_id';
    protected $fillable = ['personel_id','tahun','nama_institusi','jenis_pendidikan','gelar','dokumen_url','is_terverifikasi'];
    public function personel() { return $this->belongsTo(Personel::class, 'personel_id', 'personel_id'); }
}
