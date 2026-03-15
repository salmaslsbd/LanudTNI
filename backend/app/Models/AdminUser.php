<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class AdminUser extends Authenticatable
{
    use HasApiTokens;

    protected $table      = 'admin_users';
    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'nrp', 'nama_lengkap', 'email_dinas', 'nomor_telepon',
        'password_hash', 'role_sistem', 'satuan_kerja', 'pangkat',
        'jabatan_struktural', 'is_2fa_aktif', 'status_verifikasi',
        'terakhir_aktif', 'foto_url',
    ];

    protected $hidden = ['password_hash'];

    // Sanctum pakai kolom password_hash
    public function getAuthPassword() { return $this->password_hash; }

    public function sesiLogin()    { return $this->hasMany(SesiLogin::class, 'admin_id', 'admin_id'); }
    public function notifikasi()   { return $this->hasMany(Notifikasi::class, 'admin_id', 'admin_id'); }
    public function logAktivitas() { return $this->hasMany(LogAktivitas::class, 'admin_id', 'admin_id'); }
}
