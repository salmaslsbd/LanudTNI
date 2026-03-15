<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personel extends Model
{
    protected $table      = 'personel';
    protected $primaryKey = 'personel_id';

    protected $fillable = [
        'nrp', 'nama_lengkap', 'jenis_personel', 'pangkat_id', 'satker_id',
        'jabatan_sekarang', 'status_personel', 'tempat_lahir', 'tanggal_lahir',
        'golongan_darah', 'agama', 'status_marital', 'jenis_kelamin', 'suku',
        'tinggi_badan', 'berat_badan', 'alamat_domisili', 'nik_ktp', 'npwp',
        'foto_url', 'tmt_pangkat_terakhir', 'asal_masuk_dikma', 'angkatan_dikma',
    ];

    public function pangkat()             { return $this->belongsTo(Pangkat::class, 'pangkat_id', 'pangkat_id'); }
    public function satker()              { return $this->belongsTo(SatuanKerja::class, 'satker_id', 'satker_id'); }
    public function riwayatPendidikan()   { return $this->hasMany(RiwayatPendidikan::class, 'personel_id', 'personel_id')->orderBy('tahun'); }
    public function riwayatJabatan()      { return $this->hasMany(RiwayatJabatan::class, 'personel_id', 'personel_id')->orderBy('tmt_mulai'); }
    public function riwayatKesehatan()    { return $this->hasMany(RiwayatKesehatan::class, 'personel_id', 'personel_id')->latest('tanggal_pembaruan'); }
    public function dokumenSertifikasi()  { return $this->hasMany(DokumenSertifikasi::class, 'personel_id', 'personel_id')->latest('tanggal_upload'); }
    public function logAktivitas()        { return $this->hasMany(LogAktivitas::class, 'personel_id', 'personel_id')->latest('timestamp'); }
}
