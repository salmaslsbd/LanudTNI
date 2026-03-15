<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Log Aktivitas
        Schema::create('log_aktivitas', function (Blueprint $table) {
            $table->id('log_id');
            $table->foreignId('admin_id')->constrained('admin_users', 'admin_id')->onDelete('cascade');
            $table->foreignId('personel_id')->nullable()->constrained('personel', 'personel_id')->onDelete('set null');
            $table->enum('jenis_aksi', ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'UPLOAD', 'LOGIN', 'LOGOUT']);
            $table->string('tabel_terdampak', 50)->nullable();
            $table->text('deskripsi_aksi');
            $table->datetime('timestamp');
            $table->string('ip_address', 45)->nullable();
            $table->json('data_sebelum')->nullable();
            $table->json('data_sesudah')->nullable();
            $table->timestamps();
        });

        // Sesi Login
        Schema::create('sesi_login', function (Blueprint $table) {
            $table->id('sesi_id');
            $table->foreignId('admin_id')->constrained('admin_users', 'admin_id')->onDelete('cascade');
            $table->string('browser_os', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->datetime('waktu_login');
            $table->datetime('waktu_logout')->nullable();
            $table->enum('status_sesi', ['Aktif', 'Selesai', 'Kadaluarsa'])->default('Aktif');
            $table->text('token_hash')->nullable();
            $table->timestamps();
        });

        // Notifikasi
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id('notif_id');
            $table->foreignId('admin_id')->constrained('admin_users', 'admin_id')->onDelete('cascade');
            $table->string('judul', 200);
            $table->text('isi_notifikasi');
            $table->boolean('is_dibaca')->default(false);
            $table->datetime('created_at');
            $table->datetime('updated_at')->nullable();
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('notifikasi');
        Schema::dropIfExists('sesi_login');
        Schema::dropIfExists('log_aktivitas');
    }
};
