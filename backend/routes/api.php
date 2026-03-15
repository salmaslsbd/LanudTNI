<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PersonelController;

// ── Public ──────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

// ── Protected ───────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::get('/auth/me',       [AuthController::class, 'me']);

    // Profile
    Route::get('/profile',                    [ProfileController::class, 'show']);
    Route::put('/profile',                    [ProfileController::class, 'update']);
    Route::post('/profile/ganti-password',    [ProfileController::class, 'gantiPassword']);
    Route::get('/profile/sesi',               [ProfileController::class, 'sesi']);
    Route::delete('/profile/sesi/{id}',       [ProfileController::class, 'putusSesi']);
    Route::post('/profile/foto',              [ProfileController::class, 'uploadFoto']);

    // Dashboard
    Route::get('/dashboard/stats',                    [DashboardController::class, 'stats']);
    Route::get('/dashboard/aktivitas',                [DashboardController::class, 'aktivitas']);
    Route::get('/dashboard/notifikasi',               [DashboardController::class, 'notifikasi']);
    Route::post('/dashboard/notifikasi/{id}/baca',    [DashboardController::class, 'tandaiBaca']);

    // Dropdown
    Route::get('/dropdown/pangkat', [PersonelController::class, 'dropdownPangkat']);
    Route::get('/dropdown/satker',  [PersonelController::class, 'dropdownSatker']);

    // Personel — urutan PENTING: route spesifik harus di atas {nrp}
    Route::get('/personel/stats',    [PersonelController::class, 'stats']);
    Route::get('/personel',          [PersonelController::class, 'index']);
    Route::post('/personel',         [PersonelController::class, 'store']);
    Route::get('/personel/{nrp}',    [PersonelController::class, 'show']);

    // Update: terima POST (dengan _method=PUT dari FormData) DAN PUT langsung
    Route::post('/personel/{nrp}',   [PersonelController::class, 'update']);
    Route::put('/personel/{nrp}',    [PersonelController::class, 'update']);

    Route::delete('/personel/{nrp}', [PersonelController::class, 'destroy']);
});
