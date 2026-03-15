<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('personel', function (Blueprint $table) {
            $table->id('personel_id');
            $table->string('nrp', 20)->unique();
            $table->string('nama_lengkap', 100);
            $table->enum('jenis_personel', ['Prajurit Karier', 'PNS'])->default('Prajurit Karier');
            $table->foreignId('pangkat_id')->constrained('pangkat', 'pangkat_id')->onDelete('restrict');
            $table->foreignId('satker_id')->constrained('satuan_kerja', 'satker_id')->onDelete('restrict');
            $table->string('jabatan_sekarang', 100)->nullable();
            $table->enum('status_personel', ['Aktif', 'Cuti', 'Mutasi', 'Pendidikan', 'Pensiun'])->default('Aktif');
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('agama', 20)->nullable();
            $table->enum('status_marital', ['Belum Kawin', 'Kawin', 'Cerai'])->nullable();
            $table->string('jenis_kelamin', 10)->nullable();
            $table->string('suku', 50)->nullable();
            $table->string('tinggi_badan', 10)->nullable();
            $table->string('berat_badan', 10)->nullable();
            $table->text('alamat_domisili')->nullable();
            $table->string('nik_ktp', 20)->nullable();
            $table->string('npwp', 30)->nullable();
            $table->string('foto_url')->nullable();
            $table->date('tmt_pangkat_terakhir')->nullable();
            $table->string('asal_masuk_dikma', 50)->nullable();
            $table->string('angkatan_dikma', 10)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personel');
    }
};
