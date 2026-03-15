<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personel;
use App\Models\SatuanKerja;
use App\Models\LogAktivitas;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** GET /api/dashboard/stats */
    public function stats()
    {
        $total  = Personel::count();
        $aktif  = Personel::where('status_personel', 'Aktif')->count();
        $persen = $total > 0 ? round(($aktif / $total) * 100) : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'total_personel'  => $total,
                'personel_aktif'  => $aktif,
                'persen_aktif'    => $persen,
                'total_satker'    => SatuanKerja::count(),
                'cuti'            => Personel::where('status_personel', 'Cuti')->count(),
                'mutasi'          => Personel::where('status_personel', 'Mutasi')->count(),
                'pendidikan'      => Personel::where('status_personel', 'Pendidikan')->count(),
            ],
        ]);
    }

    /** GET /api/dashboard/aktivitas */
    public function aktivitas()
    {
        $logs = LogAktivitas::with(['admin', 'personel'])
            ->whereIn('jenis_aksi', ['CREATE', 'UPDATE', 'DELETE', 'UPLOAD'])
            ->latest('timestamp')
            ->take(10)
            ->get()
            ->map(fn($l) => [
                'log_id'         => $l->log_id,
                'nama_admin'     => $l->admin?->nama_lengkap ?? 'Sistem',
                'foto_admin'     => $l->admin?->foto_url,
                'deskripsi_aksi' => $l->deskripsi_aksi,
                'jenis_aksi'     => $l->jenis_aksi,
                'timestamp'      => $l->timestamp,
            ]);

        return response()->json(['success' => true, 'data' => $logs]);
    }

    /** GET /api/dashboard/notifikasi */
    public function notifikasi(Request $request)
    {
        $notifs = Notifikasi::where('admin_id', $request->user()->admin_id)
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(fn($n) => [
                'notif_id'       => $n->notif_id,
                'judul'          => $n->judul,
                'isi_notifikasi' => $n->isi_notifikasi,
                'is_dibaca'      => $n->is_dibaca,
                'created_at'     => $n->created_at,
            ]);

        return response()->json([
            'success'      => true,
            'data'         => $notifs,
            'unread_count' => Notifikasi::where('admin_id', $request->user()->admin_id)->where('is_dibaca', false)->count(),
        ]);
    }

    /** POST /api/dashboard/notifikasi/{id}/baca */
    public function tandaiBaca(Request $request, $id)
    {
        Notifikasi::where('notif_id', $id)
            ->where('admin_id', $request->user()->admin_id)
            ->update(['is_dibaca' => true]);

        return response()->json(['success' => true, 'message' => 'Notifikasi ditandai dibaca.']);
    }
}
