import { useState, useEffect } from 'react';

const FinancialReport = () => {
  const [reportData, setReportData] = useState({
    revenue_today: 0,
    revenue_month: 0,
    transactions_today: 0,
    recent_transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://bengkelmanggono.freehosting.dev/api/report')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReportData(data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching report:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Memuat data keuangan...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Laporan Keuangan</h1>
          <p className="text-gray-500 mt-1">Ringkasan performa pendapatan Bengkel Mang Gono</p>
        </div>

        {/* --- CARDS METRIK KEUANGAN --- */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Card Pendapatan Hari Ini */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 border-l-4 border-l-green-500">
            <p className="text-sm font-bold text-gray-500 mb-1">Pendapatan Hari Ini</p>
            <h2 className="text-3xl font-black text-gray-800">
              Rp {parseFloat(reportData.revenue_today).toLocaleString('id-ID')}
            </h2>
          </div>

          {/* Card Pendapatan Bulan Ini */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100 border-l-4 border-l-blue-500">
            <p className="text-sm font-bold text-gray-500 mb-1">Pendapatan Bulan Ini</p>
            <h2 className="text-3xl font-black text-gray-800">
              Rp {parseFloat(reportData.revenue_month).toLocaleString('id-ID')}
            </h2>
          </div>

          {/* Card Total Transaksi */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100 border-l-4 border-l-purple-500">
            <p className="text-sm font-bold text-gray-500 mb-1">Pelanggan Hari Ini</p>
            <h2 className="text-3xl font-black text-gray-800">
              {reportData.transactions_today} <span className="text-lg font-medium text-gray-500">Transaksi</span>
            </h2>
          </div>
        </div>

        {/* --- TABEL TRANSAKSI TERAKHIR --- */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">10 Transaksi Terakhir</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <th className="p-4 font-semibold text-sm">Waktu Transaksi</th>
                  <th className="p-4 font-semibold text-sm">No. Nota</th>
                  <th className="p-4 font-semibold text-sm">Pelanggan</th>
                  <th className="p-4 font-semibold text-sm">Plat Nomor</th>
                  <th className="p-4 font-semibold text-sm">Metode</th>
                  <th className="p-4 font-semibold text-sm text-right">Total Nominal</th>
                </tr>
              </thead>
              <tbody>
                {reportData.recent_transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">Belum ada transaksi sama sekali.</td>
                  </tr>
                ) : (
                  reportData.recent_transactions.map(trx => (
                    <tr key={trx.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(trx.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm font-medium text-blue-600">{trx.no_nota}</td>
                      <td className="p-4 text-sm text-gray-800">{trx.nama_pelanggan || 'Umum'}</td>
                      <td className="p-4 text-sm font-bold text-gray-700">{trx.plat_nomor || '-'}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${trx.metode_pembayaran === 'QRIS' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {trx.metode_pembayaran}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 text-right">
                        Rp {parseFloat(trx.total_harga).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialReport;