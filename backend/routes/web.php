<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/clear-cache', function () {
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    return response()->json([
        'message' => 'Application cache cleared successfully.'
    ]);
});

Route::get('/debug-db', function () {
    try {
        $tables = ['users', 'products', 'settings', 'categories', 'branches'];
        $stats = [];
        foreach ($tables as $table) {
            if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                $stats[$table] = \Illuminate\Support\Facades\DB::table($table)->count();
            } else {
                $stats[$table] = 'does not exist';
            }
        }
        return response()->json($stats);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

Route::get('/seed-db', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        return response()->json([
            'message' => 'Database seeded successfully on Render.',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Seeding failed.',
            'message' => $e->getMessage()
        ], 500);
    }
});
