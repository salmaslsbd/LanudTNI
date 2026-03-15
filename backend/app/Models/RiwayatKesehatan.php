<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RiwayatKesehatan extends Model {
    protected $table = 'riwayat_kesehatan'; protected $primaryKey = 'kesehatan_id';
    protected $fillable = ['personel_id','tanggal_pembaruan','jenis_rekam','catatan','diinput_oleh','dokumen_url'];
    public function personel()    { return $this->belongsTo(Personel::class, 'personel_id', 'personel_id'); }
    public function diinputOleh() { return $this->belongsTo(AdminUser::class, 'diinput_oleh', 'admin_id'); }
}
