<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Riwayat Pendidikan
        Schema::create('riwayat_pendidikan', function (Blueprint $table) {
            $table->id('pendidikan_id');
            $table->foreignId('personel_id')->constrained('personel', 'personel_id')->onDelete('cascade');
            $table->year('tahun');
            $table->string('nama_institusi', 150);
            $table->enum('jenis_pendidikan', ['Militer', 'Spesialisasi', 'Umum', 'Kejuruan']);
            $table->string('gelar', 30)->nullable();
            $table->text('dokumen_url')->nullable();
            $table->boolean('is_terverifikasi')->default(false);
            $table->timestamps();
        });

        // Riwayat Jabatan
        Schema::create('riwayat_jabatan', function (Blueprint $table) {
            $table->id('jabatan_id');
            $table->foreignId('personel_id')->constrained('personel', 'personel_id')->onDelete('cascade');
            $table->string('nama_jabatan', 100);
            $table->foreignId('satker_id')->constrained('satuan_kerja', 'satker_id')->onDelete('restrict');
            $table->string('pangkat_saat_itu', 30)->nullable();
            $table->date('tmt_mulai')->nullable();
            $table->date('tmt_selesai')->nullable();
            $table->boolean('is_jabatan_aktif')->default(false);
            $table->timestamps();
        });

        // Riwayat Kesehatan
        Schema::create('riwayat_kesehatan', function (Blueprint $table) {
            $table->id('kesehatan_id');
            $table->foreignId('personel_id')->constrained('personel', 'personel_id')->onDelete('cascade');
            $table->date('tanggal_pembaruan');
            $table->enum('jenis_rekam', ['Pemeriksaan Rutin', 'Rawat Inap', 'Rawat Jalan', 'Vaksinasi', 'Lainnya']);
            $table->text('catatan')->nullable();
            $table->foreignId('diinput_oleh')->constrained('admin_users', 'admin_id')->onDelete('restrict');
            $table->text('dokumen_url')->nullable();
            $table->timestamps();
        });

        // Dokumen Sertifikasi
        Schema::create('dokumen_sertifikasi', function (Blueprint $table) {
            $table->id('dokumen_id');
            $table->foreignId('personel_id')->constrained('personel', 'personel_id')->onDelete('cascade');
            $table->string('nama_dokumen', 150);
            $table->enum('jenis_dokumen', ['Sertifikat', 'Ijazah', 'SK', 'Piagam', 'Lainnya']);
            $table->datetime('tanggal_upload');
            $table->foreignId('diupload_oleh')->constrained('admin_users', 'admin_id')->onDelete('restrict');
            $table->text('file_url');
            $table->enum('status_verifikasi', ['Terverifikasi', 'Pending', 'Ditolak'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_sertifikasi');
        Schema::dropIfExists('riwayat_kesehatan');
        Schema::dropIfExists('riwayat_jabatan');
        Schema::dropIfExists('riwayat_pendidikan');
    }
};
