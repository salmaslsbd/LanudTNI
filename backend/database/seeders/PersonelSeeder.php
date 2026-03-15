<?php

namespace Database\Seeders;

use App\Models\Personel;
use App\Models\Pangkat;
use App\Models\SatuanKerja;
use App\Models\RiwayatPendidikan;
use App\Models\RiwayatJabatan;
use App\Models\LogAktivitas;
use Illuminate\Database\Seeder;

class PersonelSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil ID pangkat dan satker
        $pangkat = Pangkat::pluck('pangkat_id', 'kode_pangkat');
        $satker  = SatuanKerja::pluck('satker_id', 'kode_satker');
        $admin1  = \App\Models\AdminUser::where('nrp', '512345')->first();

        // Data dari Excel dosen (Lanud Adi Soemarmo)
        $personelData = [
            [
                'nrp' => '11919605549936', 'nama_lengkap' => 'Andika Dewata Kusuma, S.Tr.(Han)',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'KAPTEN', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Ps Kasubsidikpers Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Bandung',
                'tanggal_lahir' => '1996-05-28', 'asal_masuk_dikma' => 'AAU', 'angkatan_dikma' => '2019',
                'tmt_pangkat_terakhir' => '2025-10-01',
                'alamat_domisili' => 'Beran Lor, RT06, Rw022, Sleman',
            ],
            [
                'nrp' => '523456', 'nama_lengkap' => 'Bambang Sugeng, S.T.',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'MAYOR', 'satker_kode' => 'DISINFO',
                'jabatan_sekarang' => 'Kasi Sistem Informasi Disinfolahtau',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '1985-05-12', 'asal_masuk_dikma' => 'AAU', 'angkatan_dikma' => '2007',
                'tmt_pangkat_terakhir' => '2021-04-01', 'golongan_darah' => 'O+',
                'status_marital' => 'Kawin', 'suku' => 'Jawa', 'jenis_kelamin' => 'Laki-Laki',
                'tinggi_badan' => '170 cm', 'berat_badan' => '68 kg',
                'alamat_domisili' => 'Jl. Merpati No. 12, Komplek TNI AU Halim Perdanakusuma, Jakarta Timur',
            ],
            [
                'nrp' => '543210', 'nama_lengkap' => 'Gondo Prabowo',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'LETTU', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Kaurdikpers Subsidikpers Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Wonogiri',
                'tanggal_lahir' => '1979-02-08', 'asal_masuk_dikma' => 'Setukpa', 'angkatan_dikma' => '2001',
                'tmt_pangkat_terakhir' => '2024-04-01',
                'alamat_domisili' => 'Desa Ngranda RT 01 RW 1 Gunungsari Jatisrono Wonogiri',
            ],
            [
                'nrp' => '543211', 'nama_lengkap' => 'Ari Herwanto',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'LETTU', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Kaurtipers Subsidati Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Magetan',
                'tanggal_lahir' => '1979-01-02', 'tmt_pangkat_terakhir' => '2022-01-01',
                'alamat_domisili' => 'Jl. Karya Bakti No 19 Rt 02 Rw.01, Kel. Kawedanan, Kab. Magetan',
                'npwp' => '79.149.646.2.646.000',
            ],
            [
                'nrp' => '543212', 'nama_lengkap' => 'Sugeng Sutrisno',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'PELTU', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Ba Adminpers Urminjurit Subsijurit Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Ponorogo',
                'tanggal_lahir' => '1975-01-01', 'asal_masuk_dikma' => 'Susbamenjur Adm Pers',
                'angkatan_dikma' => '2013', 'tmt_pangkat_terakhir' => '2021-07-05',
                'alamat_domisili' => 'Perum Asabri C 48 Jl. Rajawali Rt 6/Rw 13 Gagaksipat Byl',
                'npwp' => '24.834.406.1.647.000',
            ],
            [
                'nrp' => '543213', 'nama_lengkap' => 'Handriyani',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'PELDA', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Ba Adminpers Urminjurit Subsijurit Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Solo',
                'tanggal_lahir' => '1977-01-01', 'tmt_pangkat_terakhir' => '2020-08-01',
                'alamat_domisili' => 'Dalatan Rt02 Rw11 Gawanan Colomadu Karanganyar',
                'npwp' => '59.730.710.7.528.000',
            ],
            [
                'nrp' => '543214', 'nama_lengkap' => 'Elisabet Shelvy P.',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'SERMA', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Ba Operator Komputer Urminjurit Subsijurit Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Kristen', 'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '1986-02-02', 'asal_masuk_dikma' => 'Semaba PK',
                'angkatan_dikma' => '2006', 'tmt_pangkat_terakhir' => '2023-04-01',
                'alamat_domisili' => 'Komplek Rajawali No. 9 Lanud Smo',
                'npwp' => '58.478.647.9-621.000', 'jenis_kelamin' => 'Perempuan',
            ],
            [
                'nrp' => '543215', 'nama_lengkap' => 'Giyono',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'SERMA', 'satker_kode' => 'DISPERS',
                'jabatan_sekarang' => 'Ba Adminpers Urdik Subsidikpers Sibinpers Dispers Lanud Smo',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Sragen',
                'tanggal_lahir' => '1980-01-01', 'asal_masuk_dikma' => 'Semata PK',
                'angkatan_dikma' => '2007', 'tmt_pangkat_terakhir' => '2024-04-19',
                'alamat_domisili' => 'Sragen',
            ],
            [
                'nrp' => '543216', 'nama_lengkap' => 'Lettu Pnb Sari Dewi',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'LETDA', 'satker_kode' => 'LANUD-ABD',
                'jabatan_sekarang' => 'Perwira Muda Penerbang',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Makassar',
                'tanggal_lahir' => '1997-08-30', 'jenis_kelamin' => 'Perempuan',
                'tmt_pangkat_terakhir' => '2022-10-01',
            ],
            [
                'nrp' => '543217', 'nama_lengkap' => 'Kapten Nav Dewi Lestari',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'KAPTEN', 'satker_kode' => 'SKATEK-021',
                'jabatan_sekarang' => 'Kasi Navigasi',
                'status_personel' => 'Cuti', 'agama' => 'Katolik', 'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '1984-09-17', 'jenis_kelamin' => 'Perempuan',
                'tmt_pangkat_terakhir' => '2018-03-01',
            ],
            [
                'nrp' => '543218', 'nama_lengkap' => 'Mayor Pnb Hendra Wijaya',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'MAYOR', 'satker_kode' => 'SKD-3',
                'jabatan_sekarang' => 'Komandan Regu Penerbang',
                'status_personel' => 'Mutasi', 'agama' => 'Islam', 'tempat_lahir' => 'Bandung',
                'tanggal_lahir' => '1981-07-22', 'tmt_pangkat_terakhir' => '2019-04-01',
            ],
            [
                'nrp' => '543219', 'nama_lengkap' => 'Lettu Kal Putri Handayani',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'LETTU', 'satker_kode' => 'DISKUM',
                'jabatan_sekarang' => 'Perwira Hukum',
                'status_personel' => 'Pendidikan', 'agama' => 'Kristen', 'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '1992-03-18', 'jenis_kelamin' => 'Perempuan',
                'tmt_pangkat_terakhir' => '2021-01-01',
            ],
            [
                'nrp' => '543220', 'nama_lengkap' => 'Kolonel Pnb Ahmad Fauzi',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'KOLEN', 'satker_kode' => 'MABESAU',
                'jabatan_sekarang' => 'Kepala Dinas',
                'status_personel' => 'Aktif', 'agama' => 'Islam', 'tempat_lahir' => 'Palembang',
                'tanggal_lahir' => '1972-01-08', 'tmt_pangkat_terakhir' => '2015-01-01',
            ],
            [
                'nrp' => '543221', 'nama_lengkap' => 'Letkol Kal Satria Yudha',
                'jenis_personel' => 'Prajurit Karier', 'pangkat_kode' => 'LETKOL', 'satker_kode' => 'LANUD-HLM',
                'jabatan_sekarang' => 'Kasie Operasi',
                'status_personel' => 'Mutasi', 'agama' => 'Islam', 'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '1978-11-03', 'tmt_pangkat_terakhir' => '2017-04-01',
            ],
        ];

        foreach ($personelData as $d) {
            $pangkatId = $pangkat[$d['pangkat_kode']] ?? null;
            $satkerId  = $satker[$d['satker_kode']] ?? null;
            if (!$pangkatId || !$satkerId) continue;

            $p = Personel::firstOrCreate(['nrp' => $d['nrp']], [
                'nama_lengkap'       => $d['nama_lengkap'],
                'jenis_personel'     => $d['jenis_personel'],
                'pangkat_id'         => $pangkatId,
                'satker_id'          => $satkerId,
                'jabatan_sekarang'   => $d['jabatan_sekarang'],
                'status_personel'    => $d['status_personel'],
                'agama'              => $d['agama'] ?? null,
                'tempat_lahir'       => $d['tempat_lahir'] ?? null,
                'tanggal_lahir'      => $d['tanggal_lahir'] ?? null,
                'golongan_darah'     => $d['golongan_darah'] ?? null,
                'status_marital'     => $d['status_marital'] ?? null,
                'jenis_kelamin'      => $d['jenis_kelamin'] ?? null,
                'suku'               => $d['suku'] ?? null,
                'tinggi_badan'       => $d['tinggi_badan'] ?? null,
                'berat_badan'        => $d['berat_badan'] ?? null,
                'alamat_domisili'    => $d['alamat_domisili'] ?? null,
                'nik_ktp'            => $d['nik_ktp'] ?? null,
                'npwp'               => $d['npwp'] ?? null,
                'tmt_pangkat_terakhir' => $d['tmt_pangkat_terakhir'] ?? null,
                'asal_masuk_dikma'   => $d['asal_masuk_dikma'] ?? null,
                'angkatan_dikma'     => $d['angkatan_dikma'] ?? null,
            ]);

            // Tambah riwayat pendidikan untuk Bambang Sugeng
            if ($d['nrp'] === '523456') {
                $pendidikan = [
                    ['tahun' => '2007', 'nama_institusi' => 'Akademi Angkatan Udara (AAU)',         'jenis_pendidikan' => 'Militer'],
                    ['tahun' => '2008', 'nama_institusi' => 'Sekolah Dasar Kecabangan Adm',          'jenis_pendidikan' => 'Spesialisasi'],
                    ['tahun' => '2015', 'nama_institusi' => 'Sekolah Komando Kesatuan AU (Sekkau)',  'jenis_pendidikan' => 'Militer'],
                    ['tahun' => '2020', 'nama_institusi' => 'Sarjana Teknik Informatika - Unhan',    'jenis_pendidikan' => 'Umum', 'gelar' => 'S.T.'],
                ];
                foreach ($pendidikan as $pend) {
                    RiwayatPendidikan::firstOrCreate(
                        ['personel_id' => $p->personel_id, 'tahun' => $pend['tahun']],
                        array_merge($pend, ['personel_id' => $p->personel_id])
                    );
                }

                $jabatan = [
                    ['nama_jabatan' => 'Perwira Pertama Lanud Iswahjudi', 'satker_kode' => 'LANUD-HLM', 'pangkat_saat_itu' => 'Letda - Lettu', 'tmt_mulai' => '2007-01-01', 'tmt_selesai' => '2012-12-31', 'is_jabatan_aktif' => false],
                    ['nama_jabatan' => 'Kaur Data Disinfolahtau',         'satker_kode' => 'DISINFO',   'pangkat_saat_itu' => 'Lettu - Kapten', 'tmt_mulai' => '2012-01-01', 'tmt_selesai' => '2018-12-31', 'is_jabatan_aktif' => false],
                    ['nama_jabatan' => 'Kasi Sistem Informasi Disinfolahtau', 'satker_kode' => 'DISINFO','pangkat_saat_itu' => 'Mayor', 'tmt_mulai' => '2018-01-01', 'tmt_selesai' => null, 'is_jabatan_aktif' => true],
                ];
                foreach ($jabatan as $jab) {
                    $sid = $satker[$jab['satker_kode']] ?? null;
                    if (!$sid) continue;
                    RiwayatJabatan::firstOrCreate(
                        ['personel_id' => $p->personel_id, 'nama_jabatan' => $jab['nama_jabatan']],
                        ['personel_id' => $p->personel_id, 'satker_id' => $sid, 'pangkat_saat_itu' => $jab['pangkat_saat_itu'], 'tmt_mulai' => $jab['tmt_mulai'], 'tmt_selesai' => $jab['tmt_selesai'], 'is_jabatan_aktif' => $jab['is_jabatan_aktif']]
                    );
                }

                // Log aktivitas untuk dashboard
                if ($admin1) {
                    $logs = [
                        ['deskripsi' => 'Bambang Sugeng memperbarui riwayat kesehatan',   'jenis' => 'UPDATE', 'created' => now()->subMinutes(10)],
                        ['deskripsi' => 'Sertu Adm Maya mengunggah dokumen sertifikasi',  'jenis' => 'UPLOAD', 'created' => now()->subMinutes(25)],
                        ['deskripsi' => 'Kapten Tek Budi merubah unit penempatan',        'jenis' => 'UPDATE', 'created' => now()->subHour()],
                        ['deskripsi' => 'Letkol Kal Satria menghapus data log lama',      'jenis' => 'DELETE', 'created' => now()->subHours(3)],
                        ['deskripsi' => 'Mayor Sus Rina memperbarui pangkat fungsional',  'jenis' => 'UPDATE', 'created' => now()->subHours(5)],
                    ];
                    foreach ($logs as $log) {
                        LogAktivitas::create([
                            'admin_id'       => $admin1->admin_id,
                            'personel_id'    => $p->personel_id,
                            'jenis_aksi'     => $log['jenis'],
                            'tabel_terdampak'=> 'personel',
                            'deskripsi_aksi' => $log['deskripsi'],
                            'timestamp'      => $log['created'],
                            'ip_address'     => '127.0.0.1',
                            'created_at'     => $log['created'],
                            'updated_at'     => $log['created'],
                        ]);
                    }
                }
            }
        }

        // Update total_personel di satuan_kerja
        SatuanKerja::all()->each(function ($s) {
            $s->update(['total_personel' => Personel::where('satker_id', $s->satker_id)->count()]);
        });
    }
}
