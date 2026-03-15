<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pangkat', function (Blueprint $table) {
            $table->id('pangkat_id');
            $table->string('kode_pangkat', 20)->unique();
            $table->string('nama_pangkat', 50);
            $table->enum('golongan', ['Perwira Tinggi', 'Perwira Menengah', 'Perwira Pertama', 'Bintara', 'Tamtama']);
            $table->integer('urutan_pangkat');
            $table->string('korps', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pangkat');
    }
};
