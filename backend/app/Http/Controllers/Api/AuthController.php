<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\SesiLogin;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'nrp'      => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = AdminUser::where('nrp', $request->nrp)->first();

        if (!$admin || !Hash::check($request->password, $admin->password_hash)) {
            return response()->json(['success' => false, 'message' => 'NRP atau kata sandi salah.'], 401);
        }

        // Update terakhir aktif
        $admin->update(['terakhir_aktif' => now()]);

        // Buat token Sanctum
        $token = $admin->createToken('auth_token')->plainTextToken;

        // Catat sesi login
        $sesi = SesiLogin::create([
            'admin_id'    => $admin->admin_id,
            'browser_os'  => $this->detectBrowserOs($request->userAgent()),
            'ip_address'  => $request->ip(),
            'waktu_login' => now(),
            'status_sesi' => 'Aktif',
            'token_hash'  => hash('sha256', $token),
        ]);

        // Catat log aktivitas
        LogAktivitas::create([
            'admin_id'       => $admin->admin_id,
            'jenis_aksi'     => 'LOGIN',
            'deskripsi_aksi' => "{$admin->nama_lengkap} login ke sistem",
            'timestamp'      => now(),
            'ip_address'     => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data'    => [
                'token'      => $token,
                'token_type' => 'Bearer',
                'admin'      => [
                    'admin_id'          => $admin->admin_id,
                    'nrp'               => $admin->nrp,
                    'nama_lengkap'      => $admin->nama_lengkap,
                    'pangkat'           => $admin->pangkat,
                    'satuan_kerja'      => $admin->satuan_kerja,
                    'jabatan_struktural'=> $admin->jabatan_struktural,
                    'role_sistem'       => $admin->role_sistem,
                    'status_verifikasi' => $admin->status_verifikasi,
                    'is_2fa_aktif'      => $admin->is_2fa_aktif,
                    'foto_url'          => $admin->foto_url,
                    'terakhir_aktif'    => $admin->terakhir_aktif,
                ],
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $admin = $request->user();

        // Update status sesi
        SesiLogin::where('admin_id', $admin->admin_id)
            ->where('status_sesi', 'Aktif')
            ->latest('waktu_login')
            ->first()
            ?->update(['waktu_logout' => now(), 'status_sesi' => 'Selesai']);

        // Log aktivitas
        LogAktivitas::create([
            'admin_id'       => $admin->admin_id,
            'jenis_aksi'     => 'LOGOUT',
            'deskripsi_aksi' => "{$admin->nama_lengkap} logout dari sistem",
            'timestamp'      => now(),
            'ip_address'     => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true, 'message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        $admin = $request->user();
        return response()->json([
            'success' => true,
            'data'    => [
                'admin_id'          => $admin->admin_id,
                'nrp'               => $admin->nrp,
                'nama_lengkap'      => $admin->nama_lengkap,
                'pangkat'           => $admin->pangkat,
                'satuan_kerja'      => $admin->satuan_kerja,
                'jabatan_struktural'=> $admin->jabatan_struktural,
                'email_dinas'       => $admin->email_dinas,
                'nomor_telepon'     => $admin->nomor_telepon,
                'role_sistem'       => $admin->role_sistem,
                'status_verifikasi' => $admin->status_verifikasi,
                'is_2fa_aktif'      => $admin->is_2fa_aktif,
                'foto_url'          => $admin->foto_url,
                'terakhir_aktif'    => $admin->terakhir_aktif,
            ],
        ]);
    }

    private function detectBrowserOs($userAgent)
    {
        $browser = 'Unknown Browser';
        $os      = 'Unknown OS';
        if (str_contains($userAgent, 'Firefox'))       $browser = 'Firefox';
        elseif (str_contains($userAgent, 'Chrome'))    $browser = 'Chrome';
        elseif (str_contains($userAgent, 'Safari'))    $browser = 'Safari';
        elseif (str_contains($userAgent, 'Edge'))      $browser = 'Edge';
        if (str_contains($userAgent, 'Windows NT 10')) $os = 'Windows 11/10';
        elseif (str_contains($userAgent, 'Windows'))   $os = 'Windows';
        elseif (str_contains($userAgent, 'Mac OS'))    $os = 'macOS';
        elseif (str_contains($userAgent, 'Linux'))     $os = 'Linux';
        return "$browser / $os";
    }
}
