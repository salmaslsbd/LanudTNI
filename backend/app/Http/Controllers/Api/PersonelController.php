<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personel;
use App\Models\SatuanKerja;
use App\Models\LogAktivitas;
use App\Models\Pangkat;
use App\Models\RiwayatPendidikan;
use App\Models\RiwayatJabatan;
use Illuminate\Http\Request;

class PersonelController extends Controller
{
    /** GET /api/personel/stats */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total'      => Personel::count(),
                'aktif'      => Personel::where('status_personel', 'Aktif')->count(),
                'total_unit' => SatuanKerja::count(),
                'cuti'       => Personel::where('status_personel', 'Cuti')->count(),
                'mutasi'     => Personel::where('status_personel', 'Mutasi')->count(),
                'pendidikan' => Personel::where('status_personel', 'Pendidikan')->count(),
            ],
        ]);
    }

    /** GET /api/personel */
    public function index(Request $request)
    {
        $query = Personel::with(['pangkat', 'satker']);

        if ($request->search) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('nama_lengkap', 'like', "%$s%")
                  ->orWhere('nrp', 'like', "%$s%")
            );
        }

        if ($request->status && $request->status !== 'Semua') {
            $query->where('status_personel', $request->status);
        }

        if ($request->sort === 'A-Z') {
            $query->orderBy('nama_lengkap');
        } else {
            $query->orderBy('nrp');
        }

        $paginated = $query->paginate($request->per_page ?? 5);

        $data = collect($paginated->items())->map(fn($p) => [
            'personel_id'    => $p->personel_id,
            'nrp'            => $p->nrp,
            'nama_lengkap'   => $p->nama_lengkap,
            'jenis_personel' => $p->jenis_personel,
            'pangkat'        => $p->pangkat?->nama_pangkat,
            'korps'          => $p->pangkat?->korps,
            'satker'         => $p->satker?->nama_satker,
            'kode_satker'    => $p->satker?->kode_satker,
            'jabatan'        => $p->jabatan_sekarang,
            'status'         => $p->status_personel,
            'foto_url'       => $p->foto_url,
            'updated_at'     => $p->updated_at?->format('d M Y'),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
            ],
        ]);
    }

    /** GET /api/personel/{nrp} */
    public function show(Request $request, $nrp)
    {
        $p = Personel::with([
            'pangkat',
            'satker',
            'riwayatPendidikan',
            'riwayatJabatan',
            'logAktivitas.admin',
        ])->where('nrp', $nrp)->firstOrFail();

        // Catat log VIEW
        LogAktivitas::create([
            'admin_id'        => $request->user()->admin_id,
            'personel_id'     => $p->personel_id,
            'jenis_aksi'      => 'VIEW',
            'tabel_terdampak' => 'personel',
            'deskripsi_aksi'  => "{$request->user()->nama_lengkap} melihat data {$p->nama_lengkap}",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'personel_id'          => $p->personel_id,
                'nrp'                  => $p->nrp,
                'nama_lengkap'         => $p->nama_lengkap,
                'jenis_personel'       => $p->jenis_personel,
                'pangkat_id'           => $p->pangkat_id,
                'satker_id'            => $p->satker_id,
                'pangkat'              => $p->pangkat?->nama_pangkat,
                'korps'                => $p->pangkat?->korps,
                'golongan'             => $p->pangkat?->golongan,
                'satker'               => $p->satker?->nama_satker,
                'kode_satker'          => $p->satker?->kode_satker,
                'lokasi_satker'        => $p->satker?->lokasi,
                'jabatan_sekarang'     => $p->jabatan_sekarang,
                'status_personel'      => $p->status_personel,
                'tempat_lahir'         => $p->tempat_lahir,
                'tanggal_lahir'        => $p->tanggal_lahir,
                'golongan_darah'       => $p->golongan_darah,
                'agama'                => $p->agama,
                'status_marital'       => $p->status_marital,
                'jenis_kelamin'        => $p->jenis_kelamin,
                'suku'                 => $p->suku,
                'tinggi_badan'         => $p->tinggi_badan,
                'berat_badan'          => $p->berat_badan,
                'alamat_domisili'      => $p->alamat_domisili,
                'nik_ktp'              => $p->nik_ktp,
                'npwp'                 => $p->npwp,
                'foto_url'             => $p->foto_url,
                'tmt_pangkat_terakhir' => $p->tmt_pangkat_terakhir,
                'asal_masuk_dikma'     => $p->asal_masuk_dikma,
                'angkatan_dikma'       => $p->angkatan_dikma,
                'riwayat_pendidikan'   => $p->riwayatPendidikan,
                'riwayat_jabatan'      => $p->riwayatJabatan->map(fn($j) => [
                    'jabatan_id'       => $j->jabatan_id,
                    'nama_jabatan'     => $j->nama_jabatan,
                    'pangkat_saat_itu' => $j->pangkat_saat_itu,
                    'tmt_mulai'        => $j->tmt_mulai,
                    'tmt_selesai'      => $j->tmt_selesai,
                    'is_jabatan_aktif' => $j->is_jabatan_aktif,
                ]),
                'riwayat_pembaruan'    => $p->logAktivitas->take(8)->map(fn($l) => [
                    'log_id'         => $l->log_id,
                    'jenis_aksi'     => $l->jenis_aksi,
                    'deskripsi_aksi' => $l->deskripsi_aksi,
                    'oleh'           => $l->admin?->nama_lengkap,
                    'timestamp'      => $l->timestamp,
                ]),
            ],
        ]);
    }

    public function dropdownPangkat()
    {
        return response()->json([
            'success' => true,
            'data'    => Pangkat::orderBy('urutan_pangkat')->get(),
        ]);
    }

    public function dropdownSatker()
    {
        return response()->json([
            'success' => true,
            'data'    => SatuanKerja::orderBy('nama_satker')->get(),
        ]);
    }

    /** POST /api/personel */
    public function store(Request $request)
    {
        $request->validate([
            'nrp'                  => 'required|unique:personel,nrp',
            'nama_lengkap'         => 'required',
            'jenis_personel'       => 'required|in:Prajurit Karier,PNS',
            'pangkat_id'           => 'required|exists:pangkat,pangkat_id',
            'satker_id'            => 'required|exists:satuan_kerja,satker_id',
            'jabatan_sekarang'     => 'nullable|string',
            'status_personel'      => 'nullable|string',
            'tempat_lahir'         => 'nullable|string',
            'tanggal_lahir'        => 'nullable|date',
            'golongan_darah'       => 'nullable|string',
            'agama'                => 'nullable|string',
            'status_marital'       => 'nullable|string',
            'jenis_kelamin'        => 'nullable|string',
            'suku'                 => 'nullable|string',
            'tinggi_badan'         => 'nullable|string',
            'berat_badan'          => 'nullable|string',
            'alamat_domisili'      => 'nullable|string',
            'nik_ktp'              => 'nullable|string',
            'npwp'                 => 'nullable|string',
            'tmt_pangkat_terakhir' => 'nullable|date',
            'asal_masuk_dikma'     => 'nullable|string',
            'angkatan_dikma'       => 'nullable|string',
            'foto'                 => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('personel', 'public');
        }

        $personel = Personel::create([
            'nrp'                  => $request->nrp,
            'nama_lengkap'         => $request->nama_lengkap,
            'jenis_personel'       => $request->jenis_personel,
            'pangkat_id'           => $request->pangkat_id,
            'satker_id'            => $request->satker_id,
            'jabatan_sekarang'     => $request->jabatan_sekarang,
            'status_personel'      => $request->status_personel ?? 'Aktif',
            'tempat_lahir'         => $request->tempat_lahir,
            'tanggal_lahir'        => $request->tanggal_lahir,
            'golongan_darah'       => $request->golongan_darah,
            'agama'                => $request->agama,
            'status_marital'       => $request->status_marital,
            'jenis_kelamin'        => $request->jenis_kelamin,
            'suku'                 => $request->suku,
            'tinggi_badan'         => $request->tinggi_badan,
            'berat_badan'          => $request->berat_badan,
            'alamat_domisili'      => $request->alamat_domisili,
            'nik_ktp'              => $request->nik_ktp,
            'npwp'                 => $request->npwp,
            'foto_url'             => $fotoPath,
            'tmt_pangkat_terakhir' => $request->tmt_pangkat_terakhir,
            'asal_masuk_dikma'     => $request->asal_masuk_dikma,
            'angkatan_dikma'       => $request->angkatan_dikma,
        ]);

        // ── Simpan Riwayat Pendidikan ──
        $riwayatPendidikan = json_decode($request->input('riwayat_pendidikan', '[]'), true);
        if (is_array($riwayatPendidikan)) {
            foreach ($riwayatPendidikan as $pend) {
                if (!empty($pend['nama_institusi'])) {
                    RiwayatPendidikan::create([
                        'personel_id'      => $personel->personel_id,
                        'tahun'            => $pend['tahun']            ?? null,
                        'nama_institusi'   => $pend['nama_institusi']   ?? null,
                        'jenis_pendidikan' => $pend['jenis_pendidikan'] ?? 'Umum',
                    ]);
                }
            }
        }

        // ── Simpan Riwayat Jabatan ──
        $riwayatJabatan = json_decode($request->input('riwayat_jabatan', '[]'), true);
        if (is_array($riwayatJabatan)) {
            foreach ($riwayatJabatan as $jab) {
                if (!empty($jab['nama_jabatan'])) {
                    RiwayatJabatan::create([
                        'personel_id'      => $personel->personel_id,
                        'nama_jabatan'     => $jab['nama_jabatan']     ?? null,
                        'pangkat_saat_itu' => $jab['pangkat_saat_itu'] ?? null,
                        'tmt_mulai'        => !empty($jab['tmt_mulai'])    ? $jab['tmt_mulai']    : null,
                        'tmt_selesai'      => !empty($jab['tmt_selesai'])  ? $jab['tmt_selesai']  : null,
                        'is_jabatan_aktif' => empty($jab['tmt_selesai']),
                    ]);
                }
            }
        }

        SatuanKerja::where('satker_id', $request->satker_id)->increment('total_personel');

        // Catat log CREATE
        LogAktivitas::create([
            'admin_id'        => $request->user()->admin_id,
            'personel_id'     => $personel->personel_id,
            'jenis_aksi'      => 'CREATE',
            'tabel_terdampak' => 'personel',
            'deskripsi_aksi'  => "Menambahkan data personel baru: {$personel->nama_lengkap} (NRP: {$personel->nrp})",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Personel berhasil ditambahkan',
            'data'    => $personel,
        ], 201);
    }

    /** PUT /api/personel/{nrp} */
    public function update(Request $request, $nrp)
    {
        $personel = Personel::where('nrp', $nrp)->firstOrFail();

        $request->validate([
            'nama_lengkap'         => 'sometimes|required|string',
            'jenis_personel'       => 'sometimes|required|in:Prajurit Karier,PNS',
            'pangkat_id'           => 'sometimes|required|exists:pangkat,pangkat_id',
            'satker_id'            => 'sometimes|required|exists:satuan_kerja,satker_id',
            'jabatan_sekarang'     => 'nullable|string',
            'status_personel'      => 'nullable|string',
            'tempat_lahir'         => 'nullable|string',
            'tanggal_lahir'        => 'nullable|date',
            'golongan_darah'       => 'nullable|string',
            'agama'                => 'nullable|string',
            'status_marital'       => 'nullable|string',
            'jenis_kelamin'        => 'nullable|string',
            'suku'                 => 'nullable|string',
            'tinggi_badan'         => 'nullable|string',
            'berat_badan'          => 'nullable|string',
            'alamat_domisili'      => 'nullable|string',
            'nik_ktp'              => 'nullable|string',
            'npwp'                 => 'nullable|string',
            'tmt_pangkat_terakhir' => 'nullable|date',
            'asal_masuk_dikma'     => 'nullable|string',
            'angkatan_dikma'       => 'nullable|string',
            'foto'                 => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $dataSebelum = $personel->toArray();
        $updates     = $request->except(['nrp', 'foto', '_method', 'riwayat_pendidikan', 'riwayat_jabatan']);

        if ($request->hasFile('foto')) {
            $updates['foto_url'] = $request->file('foto')->store('personel', 'public');
        }

        // Update satker counter kalau satker berubah
        if (isset($updates['satker_id']) && $updates['satker_id'] != $personel->satker_id) {
            SatuanKerja::where('satker_id', $personel->satker_id)->decrement('total_personel');
            SatuanKerja::where('satker_id', $updates['satker_id'])->increment('total_personel');
        }

        $personel->update($updates);

        // ── Update Riwayat Pendidikan (replace semua) ──
        if ($request->has('riwayat_pendidikan')) {
            $riwayatPendidikan = json_decode($request->input('riwayat_pendidikan', '[]'), true);
            if (is_array($riwayatPendidikan)) {
                RiwayatPendidikan::where('personel_id', $personel->personel_id)->delete();
                foreach ($riwayatPendidikan as $pend) {
                    if (!empty($pend['nama_institusi'])) {
                        RiwayatPendidikan::create([
                            'personel_id'      => $personel->personel_id,
                            'tahun'            => $pend['tahun']            ?? null,
                            'nama_institusi'   => $pend['nama_institusi']   ?? null,
                            'jenis_pendidikan' => $pend['jenis_pendidikan'] ?? 'Umum',
                        ]);
                    }
                }
            }
        }

        // ── Update Riwayat Jabatan (replace semua) ──
        if ($request->has('riwayat_jabatan')) {
            $riwayatJabatan = json_decode($request->input('riwayat_jabatan', '[]'), true);
            if (is_array($riwayatJabatan)) {
                RiwayatJabatan::where('personel_id', $personel->personel_id)->delete();
                foreach ($riwayatJabatan as $jab) {
                    if (!empty($jab['nama_jabatan'])) {
                        RiwayatJabatan::create([
                            'personel_id'      => $personel->personel_id,
                            'nama_jabatan'     => $jab['nama_jabatan']     ?? null,
                            'pangkat_saat_itu' => $jab['pangkat_saat_itu'] ?? null,
                            'tmt_mulai'        => !empty($jab['tmt_mulai'])   ? $jab['tmt_mulai']   : null,
                            'tmt_selesai'      => !empty($jab['tmt_selesai']) ? $jab['tmt_selesai'] : null,
                            'is_jabatan_aktif' => empty($jab['tmt_selesai']),
                        ]);
                    }
                }
            }
        }

        LogAktivitas::create([
            'admin_id'        => $request->user()->admin_id,
            'personel_id'     => $personel->personel_id,
            'jenis_aksi'      => 'UPDATE',
            'tabel_terdampak' => 'personel',
            'deskripsi_aksi'  => "Memperbarui data personel: {$personel->nama_lengkap} (NRP: {$personel->nrp})",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
            'data_sebelum'    => $dataSebelum,
            'data_sesudah'    => $personel->fresh()->toArray(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data personel berhasil diperbarui',
            'data'    => $personel,
        ]);
    }

    /** DELETE /api/personel/{nrp} */
    public function destroy(Request $request, $nrp)
    {
        $personel = Personel::with('satker')->where('nrp', $nrp)->firstOrFail();

        $nama        = $personel->nama_lengkap;
        $dataSebelum = $personel->toArray();

        if ($personel->satker) {
            $personel->satker->decrement('total_personel');
        }

        LogAktivitas::create([
            'admin_id'        => $request->user()->admin_id,
            'jenis_aksi'      => 'DELETE',
            'tabel_terdampak' => 'personel',
            'deskripsi_aksi'  => "Menghapus data personel: {$nama} (NRP: {$nrp})",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
            'data_sebelum'    => $dataSebelum,
        ]);

        $personel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data personel berhasil dihapus',
        ]);
    }
}
