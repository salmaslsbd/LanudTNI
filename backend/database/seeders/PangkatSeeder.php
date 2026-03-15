<?php

namespace Database\Seeders;

use App\Models\Pangkat;
use Illuminate\Database\Seeder;

class PangkatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            // --- PERWIRA TINGGI ---
            ['kode_pangkat' => 'MARSKAL',  'nama_pangkat' => 'Marsekal',          'golongan' => 'Perwira Tinggi', 'urutan_pangkat' => 1,  'korps' => null],
            ['kode_pangkat' => 'MARSMAD',  'nama_pangkat' => 'Marsekal Madya',    'golongan' => 'Perwira Tinggi', 'urutan_pangkat' => 2,  'korps' => null],
            ['kode_pangkat' => 'MARSMUD',  'nama_pangkat' => 'Marsekal Muda',     'golongan' => 'Perwira Tinggi', 'urutan_pangkat' => 3,  'korps' => null],
            ['kode_pangkat' => 'MARSPERT', 'nama_pangkat' => 'Marsekal Pertama',  'golongan' => 'Perwira Tinggi', 'urutan_pangkat' => 4,  'korps' => null],

            // --- PERWIRA MENENGAH ---
            ['kode_pangkat' => 'KOLONEL',  'nama_pangkat' => 'Kolonel',           'golongan' => 'Perwira Menengah', 'urutan_pangkat' => 5, 'korps' => null],
            ['kode_pangkat' => 'LETKOL',   'nama_pangkat' => 'Letnan Kolonel',    'golongan' => 'Perwira Menengah', 'urutan_pangkat' => 6, 'korps' => null],
            ['kode_pangkat' => 'MAYOR',    'nama_pangkat' => 'Mayor',             'golongan' => 'Perwira Menengah', 'urutan_pangkat' => 7, 'korps' => null],

            // --- PERWIRA PERTAMA ---
            ['kode_pangkat' => 'KAPTEN',   'nama_pangkat' => 'Kapten',            'golongan' => 'Perwira Pertama', 'urutan_pangkat' => 8, 'korps' => null],
            ['kode_pangkat' => 'LETTU',    'nama_pangkat' => 'Letnan Satu',       'golongan' => 'Perwira Pertama', 'urutan_pangkat' => 9, 'korps' => null],
            ['kode_pangkat' => 'LETDA',    'nama_pangkat' => 'Letnan Dua',        'golongan' => 'Perwira Pertama', 'urutan_pangkat' => 10, 'korps' => null],

            // --- BINTARA ---
            ['kode_pangkat' => 'PELTU',    'nama_pangkat' => 'Pembantu Letnan Satu', 'golongan' => 'Bintara', 'urutan_pangkat' => 11, 'korps' => null],
            ['kode_pangkat' => 'PELDA',    'nama_pangkat' => 'Pembantu Letnan Dua',  'golongan' => 'Bintara', 'urutan_pangkat' => 12, 'korps' => null],
            ['kode_pangkat' => 'SERMA',    'nama_pangkat' => 'Sersan Mayor',         'golongan' => 'Bintara', 'urutan_pangkat' => 13, 'korps' => null],
            ['kode_pangkat' => 'SERKA',    'nama_pangkat' => 'Sersan Kepala',        'golongan' => 'Bintara', 'urutan_pangkat' => 14, 'korps' => null],
            ['kode_pangkat' => 'SERTU',    'nama_pangkat' => 'Sersan Satu',          'golongan' => 'Bintara', 'urutan_pangkat' => 15, 'korps' => null],
            ['kode_pangkat' => 'SERDA',    'nama_pangkat' => 'Sersan Dua',           'golongan' => 'Bintara', 'urutan_pangkat' => 16, 'korps' => null],

            // --- TAMTAMA ---
            ['kode_pangkat' => 'KOPKA',    'nama_pangkat' => 'Kopral Kepala',       'golongan' => 'Tamtama', 'urutan_pangkat' => 17, 'korps' => null],
            ['kode_pangkat' => 'KOPTU',    'nama_pangkat' => 'Kopral Satu',         'golongan' => 'Tamtama', 'urutan_pangkat' => 18, 'korps' => null],
            ['kode_pangkat' => 'KOPDA',    'nama_pangkat' => 'Kopral Dua',          'golongan' => 'Tamtama', 'urutan_pangkat' => 19, 'korps' => null],
            ['kode_pangkat' => 'PRAKA',    'nama_pangkat' => 'Prajurit Kepala',     'golongan' => 'Tamtama', 'urutan_pangkat' => 20, 'korps' => null],
            ['kode_pangkat' => 'PRATU',    'nama_pangkat' => 'Prajurit Satu',       'golongan' => 'Tamtama', 'urutan_pangkat' => 21, 'korps' => null],
            ['kode_pangkat' => 'PRADA',    'nama_pangkat' => 'Prajurit Dua',        'golongan' => 'Tamtama', 'urutan_pangkat' => 22, 'korps' => null],

            // --- PNS GOLONGAN IV ---
            ['kode_pangkat' => 'IV/e', 'nama_pangkat' => 'Pembina Utama',         'golongan' => 'PNS', 'urutan_pangkat' => 23, 'korps' => null],
            ['kode_pangkat' => 'IV/d', 'nama_pangkat' => 'Pembina Utama Madya',   'golongan' => 'PNS', 'urutan_pangkat' => 24, 'korps' => null],
            ['kode_pangkat' => 'IV/c', 'nama_pangkat' => 'Pembina Utama Muda',    'golongan' => 'PNS', 'urutan_pangkat' => 25, 'korps' => null],
            ['kode_pangkat' => 'IV/b', 'nama_pangkat' => 'Pembina Tingkat I',     'golongan' => 'PNS', 'urutan_pangkat' => 26, 'korps' => null],
            ['kode_pangkat' => 'IV/a', 'nama_pangkat' => 'Pembina',               'golongan' => 'PNS', 'urutan_pangkat' => 27, 'korps' => null],

            // --- PNS GOLONGAN III ---
            ['kode_pangkat' => 'III/d', 'nama_pangkat' => 'Penata Tingkat I',      'golongan' => 'PNS', 'urutan_pangkat' => 28, 'korps' => null],
            ['kode_pangkat' => 'III/c', 'nama_pangkat' => 'Penata',                'golongan' => 'PNS', 'urutan_pangkat' => 29, 'korps' => null],
            ['kode_pangkat' => 'III/b', 'nama_pangkat' => 'Penata Muda Tingkat I', 'golongan' => 'PNS', 'urutan_pangkat' => 30, 'korps' => null],
            ['kode_pangkat' => 'III/a', 'nama_pangkat' => 'Penata Muda',           'golongan' => 'PNS', 'urutan_pangkat' => 31, 'korps' => null],

            // --- PNS GOLONGAN II ---
            ['kode_pangkat' => 'II/d', 'nama_pangkat' => 'Pengatur Tingkat I',      'golongan' => 'PNS', 'urutan_pangkat' => 32, 'korps' => null],
            ['kode_pangkat' => 'II/c', 'nama_pangkat' => 'Pengatur',                'golongan' => 'PNS', 'urutan_pangkat' => 33, 'korps' => null],
            ['kode_pangkat' => 'II/b', 'nama_pangkat' => 'Pengatur Muda Tingkat I', 'golongan' => 'PNS', 'urutan_pangkat' => 34, 'korps' => null],
            ['kode_pangkat' => 'II/a', 'nama_pangkat' => 'Pengatur Muda',           'golongan' => 'PNS', 'urutan_pangkat' => 35, 'korps' => null],

            // --- PNS GOLONGAN I ---
            ['kode_pangkat' => 'I/d', 'nama_pangkat' => 'Juru Tingkat I',          'golongan' => 'PNS', 'urutan_pangkat' => 36, 'korps' => null],
            ['kode_pangkat' => 'I/c', 'nama_pangkat' => 'Juru',                    'golongan' => 'PNS', 'urutan_pangkat' => 37, 'korps' => null],
            ['kode_pangkat' => 'I/b', 'nama_pangkat' => 'Juru Muda Tingkat I',     'golongan' => 'PNS', 'urutan_pangkat' => 38, 'korps' => null],
            ['kode_pangkat' => 'I/a', 'nama_pangkat' => 'Juru Muda',               'golongan' => 'PNS', 'urutan_pangkat' => 39, 'korps' => null],
        ];

        foreach ($data as $d) {
            Pangkat::updateOrCreate(
                ['kode_pangkat' => $d['kode_pangkat']], // Cek berdasarkan kode_pangkat
                [
                    'nama_pangkat'   => $d['nama_pangkat'],
                    'golongan'       => $d['golongan'],
                    'urutan_pangkat' => $d['urutan_pangkat'],
                    'korps'          => $d['korps'],
                ]
            );
        }
    }
}