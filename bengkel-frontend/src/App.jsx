import { useState } from 'react';
import InventoryList from './components/InventoryList';
import Cashier from './components/Cashier';
import ServiceHistory from './components/ServiceHistory';
import FinancialReport from './components/FinancialReport'; // Import komponen laporan

function App() {
  const [activeTab, setActiveTab] = useState('kasir');

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar Atas */}
      <nav className="bg-white shadow-sm p-4 px-8 flex gap-6 items-center border-b border-gray-200 overflow-x-auto">
        <h1 className="font-black text-xl text-blue-700 mr-4 italic whitespace-nowrap">MANG GONO POS</h1>
        <button onClick={() => setActiveTab('kasir')} className={`font-bold pb-1 whitespace-nowrap transition ${activeTab === 'kasir' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Sistem Kasir</button>
        <button onClick={() => setActiveTab('inventori')} className={`font-bold pb-1 whitespace-nowrap transition ${activeTab === 'inventori' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Manajemen Inventori</button>
        <button onClick={() => setActiveTab('riwayat')} className={`font-bold pb-1 whitespace-nowrap transition ${activeTab === 'riwayat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Riwayat Servis</button>
        <button onClick={() => setActiveTab('laporan')} className={`font-bold pb-1 whitespace-nowrap transition ${activeTab === 'laporan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Laporan Keuangan</button>
      </nav>

      {/* Konten Halaman */}
      <main>
        {activeTab === 'kasir' && <Cashier />}
        {activeTab === 'inventori' && <InventoryList />}
        {activeTab === 'riwayat' && <ServiceHistory />}
        {activeTab === 'laporan' && <FinancialReport />}
      </main>
    </div>
  );
}

export default App;