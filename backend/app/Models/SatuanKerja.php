<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SatuanKerja extends Model {
    protected $table = 'satuan_kerja'; protected $primaryKey = 'satker_id';
    protected $fillable = ['kode_satker','nama_satker','lokasi','tipe_satker','kanal_otentikasi','total_personel'];
    public function personel() { return $this->hasMany(Personel::class, 'satker_id', 'satker_id'); }
}
