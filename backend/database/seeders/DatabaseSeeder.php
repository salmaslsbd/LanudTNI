<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PangkatSeeder::class,
            SatuanKerjaSeeder::class,
            AdminUserSeeder::class,
            PersonelSeeder::class,
            NotifikasiSeeder::class,
        ]);
    }
}
