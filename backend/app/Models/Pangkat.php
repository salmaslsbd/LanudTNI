<?php
// ── app/Models/Pangkat.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Pangkat extends Model {
    protected $table = 'pangkat'; protected $primaryKey = 'pangkat_id';
    protected $fillable = ['kode_pangkat','nama_pangkat','golongan','urutan_pangkat','korps'];
    public function personel() { return $this->hasMany(Personel::class, 'pangkat_id', 'pangkat_id'); }
}
