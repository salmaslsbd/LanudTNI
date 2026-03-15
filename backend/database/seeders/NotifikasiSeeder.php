<?php

namespace Database\Seeders;

use App\Models\Notifikasi;
use App\Models\AdminUser;
use Illuminate\Database\Seeder;

class NotifikasiSeeder extends Seeder
{
    public function run(): void
    {
        $admins = AdminUser::all();
        foreach ($admins as $admin) {
            Notifikasi::insert([
                ['admin_id' => $admin->admin_id, 'judul' => 'Selamat Datang di Sistem', 'isi_notifikasi' => 'Sistem DISINFOLAHTAU siap digunakan.', 'is_dibaca' => false, 'created_at' => now(), 'updated_at' => now()],
                ['admin_id' => $admin->admin_id, 'judul' => 'Pemeliharaan Sistem V2.4', 'isi_notifikasi' => 'Sistem akan maintenance Sabtu, 24 Agt 2026 pukul 23:00 WIB.', 'is_dibaca' => false, 'created_at' => now()->subHour(), 'updated_at' => now()],
                ['admin_id' => $admin->admin_id, 'judul' => 'Ekspor Laporan Selesai', 'isi_notifikasi' => 'File PDF laporan kekuatan personel siap diunduh.', 'is_dibaca' => true, 'created_at' => now()->subHours(3), 'updated_at' => now()],
            ]);
        }
    }
}
