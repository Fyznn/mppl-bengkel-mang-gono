import { useState } from 'react';

const ServiceHistory = () => {
  const [platNomor, setPlatNomor] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!platNomor.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setErrorMsg('');
    setHistoryData([]);

    fetch(`api/history/${platNomor}`)
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if (data.success) {
          setHistoryData(data.data);
        } else {
          setErrorMsg(data.message);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorMsg('Terjadi kesalahan koneksi server.');
        console.error(err);
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">🔍 Cek Riwayat Servis Kendaraan</h1>
          <p className="text-gray-500 mt-1">Lacak penggantian spare part berdasarkan Plat Nomor</p>
        </div>

        {/* Form Pencarian */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-8 justify-center">
          <input 
            type="text" 
            placeholder="Masukkan Plat Nomor (Contoh: D 1234 AB)" 
            value={platNomor}
            onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
            className="w-full max-w-md border-2 border-gray-300 rounded-lg p-3 font-bold text-gray-700 uppercase focus:border-blue-500 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-md cursor-pointer disabled:bg-gray-400"
          >
            {isLoading ? 'MENCARI...' : 'CARI RIWAYAT'}
          </button>
        </form>

        {/* Hasil Pencarian */}
        <div className="mt-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {hasSearched && !isLoading && historyData.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-bold text-gray-700 border-b pb-2">
                Ditemukan {historyData.length} riwayat untuk kendaraan: <span className="text-blue-600">{platNomor}</span>
              </h3>
              
              {historyData.map((trx) => (
                <div key={trx.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-500">Nota: {trx.no_nota} | Pelanggan: {trx.nama_pelanggan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-lg">Rp {parseFloat(trx.total_harga).toLocaleString('id-ID')}</p>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${trx.metode_pembayaran === 'QRIS' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {trx.metode_pembayaran}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm font-bold text-gray-700 mb-2">Detail Penggantian:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {trx.details.map((detail) => (
                        <li key={detail.id}>
                          <span className="font-medium text-gray-800">{detail.spare_part?.nama_barang || 'Barang Dihapus'}</span> ({detail.jumlah} x Rp {parseFloat(detail.harga_satuan).toLocaleString('id-ID')})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceHistory;