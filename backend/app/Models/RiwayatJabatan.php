<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RiwayatJabatan extends Model {
    protected $table = 'riwayat_jabatan'; protected $primaryKey = 'jabatan_id';
    protected $fillable = ['personel_id','nama_jabatan','satker_id','pangkat_saat_itu','tmt_mulai','tmt_selesai','is_jabatan_aktif'];
    public function personel() { return $this->belongsTo(Personel::class, 'personel_id', 'personel_id'); }
    public function satker()   { return $this->belongsTo(SatuanKerja::class, 'satker_id', 'satker_id'); }
}
