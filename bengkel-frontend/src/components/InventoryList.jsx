import { useState, useEffect } from 'react';

const InventoryList = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori: 'Motor',
    harga_jual: '',
    stok: ''
  });

  // State Modal Notifikasi & Konfirmasi
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, nama_barang: '' });

  const fetchSpareParts = () => {
    fetch('api/spare-parts')
      .then((response) => response.json())
      .then((result) => {
        setSpareParts(result.data);
        setIsLoading(false);
      })
      .catch((error) => console.error('Error fetching:', error));
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ kode_barang: '', nama_barang: '', kategori: 'Motor', harga_jual: '', stok: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      harga_jual: item.harga_jual,
      stok: item.stok
    });
    setIsModalOpen(true);
  };

  // Fungsi untuk memunculkan pop-up notifikasi
  const showNotification = (title, message, type = 'success') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editId ? `api/spare-parts/${editId}` : 'api/spare-parts';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        setIsModalOpen(false);
        showNotification('Berhasil!', data.message, 'success');
        fetchSpareParts();
      } else {
        showNotification('Gagal!', 'Gagal menyimpan barang. Cek kembali datanya.', 'error');
      }
    })
    .catch(error => {
      console.error('Error saving data:', error);
      showNotification('Error!', 'Terjadi kesalahan pada server.', 'error');
    });
  };

  // Menampilkan pop-up konfirmasi hapus (bukan hapus langsung)
  const handleDeleteClick = (id, nama_barang) => {
    setDeleteConfirm({ isOpen: true, id, nama_barang });
  };

  // Mengeksekusi penghapusan jika tombol "Ya, Hapus" diklik
  const executeDelete = () => {
    fetch(`api/spare-parts/${deleteConfirm.id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        setDeleteConfirm({ isOpen: false, id: null, nama_barang: '' });
        showNotification('Terhapus!', 'Barang berhasil dihapus dari sistem.', 'success');
        fetchSpareParts();
      }
    })
    .catch(error => console.error('Error deleting data:', error));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📦 Inventori Stok Mang Gono</h1>
            <p className="text-gray-500 mt-1">Pantau ketersediaan spare part secara real-time</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition cursor-pointer"
          >
            + Tambah Barang
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Sedang memuat data dari database...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <th className="p-4 font-semibold">Kode</th>
                  <th className="p-4 font-semibold">Nama Barang</th>
                  <th className="p-4 font-semibold">Kategori</th>
                  <th className="p-4 font-semibold">Harga</th>
                  <th className="p-4 font-semibold text-center">Stok</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {spareParts.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 font-medium">{item.kode_barang}</td>
                    <td className="p-4 text-gray-800 font-medium">{item.nama_barang}</td>
                    <td className="p-4 text-gray-600">{item.kategori}</td>
                    <td className="p-4 text-gray-800">Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</td>
                    <td className="p-4 font-bold text-center text-gray-700">{item.stok}</td>
                    <td className="p-4 text-center">
                      {item.stok <= item.batas_minimum_stok ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">KRITIS</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">AMAN</span>
                      )}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => openEditModal(item)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium transition cursor-pointer">Edit</button>
                      <button onClick={() => handleDeleteClick(item.id, item.nama_barang)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition cursor-pointer">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL FORM (TAMBAH/EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editId ? 'Edit Spare Part' : 'Tambah Spare Part Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 font-bold cursor-pointer">X</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang</label>
                <input required type="text" name="kode_barang" value={formData.kode_barang} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input required type="text" name="nama_barang" value={formData.nama_barang} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Motor">Motor</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input required type="number" name="stok" value={formData.stok} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input required type="number" name="harga_jual" value={formData.harga_jual} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition cursor-pointer">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mb-6">
              Yakin ingin menghapus <span className="font-bold text-gray-800">{deleteConfirm.nama_barang}</span>? Data yang dihapus tidak bisa dikembalikan.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm({ isOpen: false, id: null, nama_barang: '' })} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium cursor-pointer transition">
                Batal
              </button>
              <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium cursor-pointer transition">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL NOTIFIKASI SUKSES/ERROR --- */}
      {notification.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {notification.type === 'success' ? (
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{notification.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{notification.message}</p>
            <button 
              onClick={() => setNotification({ isOpen: false, title: '', message: '', type: 'success' })} 
              className={`px-6 py-2 text-white rounded-lg font-medium w-full cursor-pointer transition ${notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Oke, Paham
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;