<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use Illuminate\Http\Request;

class SparePartController extends Controller
{
    public function index()
    {
        // Mengambil semua data dari database
        $spareparts = SparePart::all();

        // Mengembalikan data dalam bentuk JSON
        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Spare Part',
            'data'    => $spareparts
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi data yang dikirim dari React
        $request->validate([
            'kode_barang' => 'required|unique:spare_parts',
            'nama_barang' => 'required',
            'kategori'    => 'required|in:Mobil,Motor,Umum',
            'stok'        => 'required|integer',
            'harga_jual'  => 'required|numeric'
        ]);

        // 2. Simpan ke database
        $sparepart = SparePart::create([
            'kode_barang' => $request->kode_barang,
            'nama_barang' => $request->nama_barang,
            'kategori'    => $request->kategori,
            'stok'        => $request->stok,
            'batas_minimum_stok' => 5, // Set default 5
            'harga_jual'  => $request->harga_jual,
        ]);

        // 3. Kembalikan respons sukses
        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil ditambahkan!',
            'data'    => $sparepart
        ], 201);
    }

    // Fungsi untuk Update/Edit Data
    public function update(Request $request, $id)
    {
        $sparepart = SparePart::find($id);
        
        if (!$sparepart) {
            return response()->json(['success' => false, 'message' => 'Barang tidak ditemukan'], 404);
        }

        $sparepart->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data barang berhasil diperbarui!',
            'data'    => $sparepart
        ]);
    }

    // Fungsi untuk Menghapus Data
    public function destroy($id)
    {
        $sparepart = SparePart::find($id);

        if (!$sparepart) {
            return response()->json(['success' => false, 'message' => 'Barang tidak ditemukan'], 404);
        }

        $sparepart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil dihapus dari sistem!'
        ]);
    }
}