<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id('admin_id');
            $table->string('nrp', 20)->unique();
            $table->string('nama_lengkap', 100);
            $table->string('email_dinas', 100)->nullable();
            $table->string('nomor_telepon', 20)->nullable();
            $table->text('password_hash');
            $table->enum('role_sistem', ['super_admin', 'admin', 'operator'])->default('operator');
            $table->string('satuan_kerja', 50)->nullable();
            $table->string('pangkat', 50)->nullable();
            $table->string('jabatan_struktural', 100)->nullable();
            $table->boolean('is_2fa_aktif')->default(false);
            $table->enum('status_verifikasi', ['terverifikasi', 'belum_terverifikasi', 'ditangguhkan'])->default('belum_terverifikasi');
            $table->datetime('terakhir_aktif')->nullable();
            $table->string('foto_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_users');
    }
};
