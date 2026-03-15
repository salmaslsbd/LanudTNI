<?php

namespace Database\Seeders;

use App\Models\SatuanKerja;
use Illuminate\Database\Seeder;

class SatuanKerjaSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['kode_satker' => 'MABESAU',    'nama_satker' => 'Markas Besar TNI AU',              'lokasi' => 'Jakarta',          'tipe_satker' => 'Mabes'],
            ['kode_satker' => 'DISINFO',    'nama_satker' => 'DISINFOLAHTAU',                    'lokasi' => 'Jakarta',          'tipe_satker' => 'Dinas'],
            ['kode_satker' => 'DISPERS',    'nama_satker' => 'Dinas Personel TNI AU',            'lokasi' => 'Jakarta',          'tipe_satker' => 'Dinas'],
            ['kode_satker' => 'DISMIN',     'nama_satker' => 'Disminpersau',                     'lokasi' => 'Jakarta',          'tipe_satker' => 'Dinas'],
            ['kode_satker' => 'DISKUM',     'nama_satker' => 'Diskumau',                         'lokasi' => 'Jakarta',          'tipe_satker' => 'Dinas'],
            ['kode_satker' => 'LANUD-HLM',  'nama_satker' => 'Lanud Halim Perdanakusuma',        'lokasi' => 'Jakarta Timur',    'tipe_satker' => 'Lanud'],
            ['kode_satker' => 'LANUD-SMO',  'nama_satker' => 'Lanud Adi Soemarmo',               'lokasi' => 'Boyolali',         'tipe_satker' => 'Lanud'],
            ['kode_satker' => 'LANUD-ADI',  'nama_satker' => 'Lanud Adisutjipto',                'lokasi' => 'Yogyakarta',       'tipe_satker' => 'Lanud'],
            ['kode_satker' => 'LANUD-ABD',  'nama_satker' => 'Lanud Abdul Rachman Saleh',        'lokasi' => 'Malang',           'tipe_satker' => 'Lanud'],
            ['kode_satker' => 'LANUD-JND',  'nama_satker' => 'Lanud Juanda',                     'lokasi' => 'Surabaya',         'tipe_satker' => 'Lanud'],
            ['kode_satker' => 'LANUD-HSN',  'nama_satker' => 'Lanud Sultan Hasanuddin',          'lokasi' => 'Makassar',         'tipe_satker' => 'Lanud'],
            ['kode_satker' => 'SKD-1',      'nama_satker' => 'Skadron Udara 1',                  'lokasi' => 'Halim PK',         'tipe_satker' => 'Skadron'],
            ['kode_satker' => 'SKD-2',      'nama_satker' => 'Skadron Udara 2',                  'lokasi' => 'Halim PK',         'tipe_satker' => 'Skadron'],
            ['kode_satker' => 'SKD-3',      'nama_satker' => 'Skadron Udara 3',                  'lokasi' => 'Malang',           'tipe_satker' => 'Skadron'],
            ['kode_satker' => 'SKATEK-021', 'nama_satker' => 'Skatek 021',                       'lokasi' => 'Yogyakarta',       'tipe_satker' => 'Skadron'],
            ['kode_satker' => 'SKATEK-042', 'nama_satker' => 'Skatek 042',                       'lokasi' => 'Surabaya',         'tipe_satker' => 'Skadron'],
        ];

        foreach ($data as $d) {
            SatuanKerja::firstOrCreate(['kode_satker' => $d['kode_satker']], $d);
        }
    }
}
