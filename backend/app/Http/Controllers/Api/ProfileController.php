<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\SesiLogin;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /** GET /api/profile */
    public function show(Request $request)
    {
        $admin = $request->user();

        $fotoBase64 = null;
        if ($admin->foto_url) {
            // convert stored image to data URI so frontend can embed without CORS
            $relative = str_replace(asset('storage/'), '', $admin->foto_url);
            $fullPath = storage_path('app/public/' . $relative);
            if (file_exists($fullPath)) {
                $type = pathinfo($fullPath, PATHINFO_EXTENSION);
                $data = file_get_contents($fullPath);
                $fotoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'admin_id'          => $admin->admin_id,
                'nrp'               => $admin->nrp,
                'nama_lengkap'      => $admin->nama_lengkap,
                'email_dinas'       => $admin->email_dinas,
                'nomor_telepon'     => $admin->nomor_telepon,
                'pangkat'           => $admin->pangkat,
                'satuan_kerja'      => $admin->satuan_kerja,
                'jabatan_struktural'=> $admin->jabatan_struktural,
                'role_sistem'       => $admin->role_sistem,
                'status_verifikasi' => $admin->status_verifikasi,
                'is_2fa_aktif'      => $admin->is_2fa_aktif,
                'foto_url'          => $admin->foto_url,
                'foto_base64'       => $fotoBase64,
                'terakhir_aktif'    => $admin->terakhir_aktif,
            ],
        ]);
    }

    /** PUT /api/profile */
    public function update(Request $request)
    {
        $admin = $request->user();
        $request->validate([
            'nama_lengkap'       => 'sometimes|string|max:100',
            'email_dinas'        => 'sometimes|email|max:100',
            'nomor_telepon'      => 'sometimes|string|max:20',
            'jabatan_struktural' => 'sometimes|string|max:100',
            'is_2fa_aktif'       => 'sometimes|boolean',
        ]);

        $before = $admin->only(['nama_lengkap', 'email_dinas', 'nomor_telepon', 'jabatan_struktural', 'is_2fa_aktif']);
        $admin->update($request->only(['nama_lengkap', 'email_dinas', 'nomor_telepon', 'jabatan_struktural', 'is_2fa_aktif']));

        LogAktivitas::create([
            'admin_id'        => $admin->admin_id,
            'jenis_aksi'      => 'UPDATE',
            'tabel_terdampak' => 'admin_users',
            'deskripsi_aksi'  => "{$admin->nama_lengkap} memperbarui profil akun",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
            'data_sebelum'    => $before,
            'data_sesudah'    => $admin->only(['nama_lengkap', 'email_dinas', 'nomor_telepon', 'jabatan_struktural', 'is_2fa_aktif']),
        ]);

        return response()->json(['success' => true, 'message' => 'Profil berhasil diperbarui.', 'data' => $admin]);
    }

    /** POST /api/profile/foto (FITUR UNGGAH FOTO FINAL) */
    public function uploadFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:2048', // Max 2MB - 'image' rule checks JPEG, PNG, GIF, WebP, etc secara otomatis
        ]);

        try {
            $admin = $request->user();

            if ($request->hasFile('foto')) {
                // 1. Hapus foto lama jika ada di storage
                if ($admin->foto_url) {
                    // Ambil path asli dari URL (menghapus domain/storage/)
                    $oldPath = str_replace(asset('storage/'), '', $admin->foto_url);
                    Storage::disk('public')->delete($oldPath);
                }

                // 2. Simpan foto baru dengan nama unik
                $file = $request->file('foto');
                $filename = 'admin_' . $admin->admin_id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('foto_profile', $filename, 'public');

                // 3. Update URL di database
                $fullUrl = asset('storage/' . $path);
                $admin->update(['foto_url' => $fullUrl]);

                // 4. Catat Log
                LogAktivitas::create([
                    'admin_id'        => $admin->admin_id,
                    'jenis_aksi'      => 'UPDATE',
                    'tabel_terdampak' => 'admin_users',
                    'deskripsi_aksi'  => "{$admin->nama_lengkap} memperbarui foto profil",
                    'timestamp'       => now(),
                    'ip_address'      => $request->ip(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Foto profil berhasil diperbarui.',
                    'foto_url' => $fullUrl
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal mengunggah foto: ' . $e->getMessage()
            ], 500);
        }
    }

    /** POST /api/profile/ganti-password */
    public function gantiPassword(Request $request)
    {
        $request->validate([
            'password_lama' => 'required|string',
            'password_baru' => 'required|string|min:8|confirmed',
        ]);

        $admin = $request->user();
        if (!Hash::check($request->password_lama, $admin->password_hash)) {
            return response()->json(['success' => false, 'message' => 'Kata sandi lama tidak sesuai.'], 422);
        }

        $admin->update(['password_hash' => Hash::make($request->password_baru)]);

        LogAktivitas::create([
            'admin_id'        => $admin->admin_id,
            'jenis_aksi'      => 'UPDATE',
            'tabel_terdampak' => 'admin_users',
            'deskripsi_aksi'  => "{$admin->nama_lengkap} mengganti kata sandi",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
        ]);

        return response()->json(['success' => true, 'message' => 'Kata sandi berhasil diperbarui.']);
    }

    /** GET /api/profile/sesi */
    public function sesi(Request $request)
    {
        $admin = $request->user();
        $bearerToken = $request->bearerToken(); 
        $currentHash = $bearerToken ? hash('sha256', explode('|', $bearerToken)[1] ?? $bearerToken) : null;

        $sesi = SesiLogin::where('admin_id', $admin->admin_id)
            ->latest('waktu_login')
            ->take(10)
            ->get()
            ->map(function ($s) use ($admin, $currentHash) {
                $isCurrent = false;
                if ($currentHash && $s->token_hash && $s->status_sesi === 'Aktif') {
                    $isCurrent = hash_equals($s->token_hash, $currentHash);
                }

                return [
                    'sesi_id'     => $s->sesi_id,
                    'browser_os'  => $s->browser_os,
                    'ip_address'  => $s->ip_address,
                    'lokasi'      => $admin->satuan_kerja ?? 'Tidak diketahui',
                    'waktu_login' => $s->waktu_login,
                    'waktu_logout'=> $s->waktu_logout,
                    'status_sesi' => $s->status_sesi,
                    'is_current'  => $isCurrent,
                ];
            });

        return response()->json(['success' => true, 'data' => $sesi]);
    }

    /** DELETE /api/profile/sesi/{id} */
    public function putusSesi(Request $request, $id)
    {
        $admin = $request->user();
        $sesi = SesiLogin::where('sesi_id', $id)
            ->where('admin_id', $admin->admin_id)
            ->first();

        if (!$sesi) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak ditemukan.'], 404);
        }

        // Putus koneksi token di Sanctum jika sesi masih aktif
        if ($sesi->status_sesi === 'Aktif' && $sesi->token_hash) {
            DB::table('personal_access_tokens')
                ->where('tokenable_id', $admin->admin_id)
                ->get()
                ->each(function ($token) use ($sesi) {
                    if (hash('sha256', $token->token) === $sesi->token_hash) {
                        DB::table('personal_access_tokens')->where('id', $token->id)->delete();
                    }
                });
        }

        $sesi->update([
            'status_sesi' => 'Selesai',
            'waktu_logout'=> now(),
        ]);

        LogAktivitas::create([
            'admin_id'        => $admin->admin_id,
            'jenis_aksi'      => 'UPDATE',
            'tabel_terdampak' => 'sesi_login',
            'deskripsi_aksi'  => "{$admin->nama_lengkap} memutus sesi login (ID: {$id})",
            'timestamp'       => now(),
            'ip_address'      => $request->ip(),
        ]);

        return response()->json(['success' => true, 'message' => 'Sesi berhasil diputus.']);
    }
}