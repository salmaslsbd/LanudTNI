<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'nrp'               => '512345',
                'nama_lengkap'      => 'Administrator Sistem',
                'email_dinas'       => 'admin@disinfolahtau.mil.id',
                'nomor_telepon'     => '+62 812-0001-0001',
                'password_hash'     => Hash::make('password123'),
                'role_sistem'       => 'super_admin',
                'satuan_kerja'      => 'DISINFOLAHTAU',
                'pangkat'           => 'Kolonel',
                'jabatan_struktural'=> 'Kepala DISINFOLAHTAU',
                'status_verifikasi' => 'terverifikasi',
                'is_2fa_aktif'      => false,
            ],
            [
                'nrp'               => '623456',
                'nama_lengkap'      => 'Budi Setiawan, S.T.',
                'email_dinas'       => 'budi.setiawan@disinfolahtau.mil.id',
                'nomor_telepon'     => '+62 812-3456-7890',
                'password_hash'     => Hash::make('password123'),
                'role_sistem'       => 'admin',
                'satuan_kerja'      => 'DISINFOLAHTAU',
                'pangkat'           => 'Mayor Adm',
                'jabatan_struktural'=> 'Kasubdis Pengolahan Data',
                'status_verifikasi' => 'terverifikasi',
                'is_2fa_aktif'      => true,
            ],
            [
                'nrp'               => '734567',
                'nama_lengkap'      => 'Operator Sistem',
                'email_dinas'       => 'operator@disinfolahtau.mil.id',
                'nomor_telepon'     => '+62 812-0003-0003',
                'password_hash'     => Hash::make('password123'),
                'role_sistem'       => 'operator',
                'satuan_kerja'      => 'DISINFOLAHTAU',
                'pangkat'           => 'Kapten',
                'jabatan_struktural'=> 'Staf Pengolah Data',
                'status_verifikasi' => 'belum_terverifikasi',
                'is_2fa_aktif'      => false,
            ],
        ];

        foreach ($admins as $a) {
            AdminUser::firstOrCreate(['nrp' => $a['nrp']], $a);
        }
    }
}
