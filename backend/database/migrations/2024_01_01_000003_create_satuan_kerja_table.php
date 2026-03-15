<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('satuan_kerja', function (Blueprint $table) {
            $table->id('satker_id');
            $table->string('kode_satker', 20)->unique();
            $table->string('nama_satker', 100);
            $table->string('lokasi', 100)->nullable();
            $table->enum('tipe_satker', ['Mabes', 'Lanud', 'Satker', 'Skadron', 'Dinas'])->default('Satker');
            $table->enum('kanal_otentikasi', ['Secure', 'Standard'])->default('Secure');
            $table->integer('total_personel')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('satuan_kerja');
    }
};
