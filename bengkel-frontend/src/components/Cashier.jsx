import { useState, useEffect } from 'react';

const Cashier = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ nama_pelanggan: '', plat_nomor: '' });
  
  // State Baru untuk Pembayaran
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [uangBayar, setUangBayar] = useState('');
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const fetchSpareParts = () => {
    fetch('http://bengkelmanggono.freehosting.dev/api/spare-parts')
      .then(res => res.json())
      .then(result => setSpareParts(result.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const filteredParts = spareParts.filter(part => 
    part.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || 
    part.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHarga = cart.reduce((total, item) => total + (item.harga_jual * item.qty), 0);

  const addToCart = (part) => {
    if (part.stok < 1) return alert(`Stok ${part.nama_barang} sedang kosong!`);
    const existingItem = cart.find(item => item.id === part.id);
    if (existingItem) {
      if (existingItem.qty >= part.stok) return alert(`Maksimal pembelian ${part.stok}.`);
      setCart(cart.map(item => item.id === part.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...part, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem.qty === 1) setCart(cart.filter(item => item.id !== id));
    else setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item));
  };

  // Fungsi pra-checkout untuk memunculkan modal QRIS jika dipilih
  const handlePreCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Keranjang masih kosong!');
    
    if (paymentMethod === 'Cash') {
      if (uangBayar < totalHarga) return alert('Uang pelanggan tidak mencukupi!');
      executeCheckout(); // Kalau tunai, langsung simpan ke DB
    } else {
      // Kalau QRIS, panggil Midtrans dulu!
      fetch('http://bengkelmanggono.freehosting.dev/api/get-snap-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          total_harga: totalHarga, 
          nama_pelanggan: customer.nama_pelanggan 
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Buka Pop-up Midtrans
          window.snap.pay(data.snap_token, {
            onSuccess: function(result){
              // JIKA PEMBAYARAN SUKSES DI MIDTRANS, BARU SIMPAN KE DATABASE KITA
            //   alert("Pembayaran QRIS Sukses!");
              executeCheckout(data.order_id); 
            },
            onPending: function(result){
              alert("Menunggu pembayaran Anda!");
            },
            onError: function(result){
              alert("Pembayaran Gagal!");
            },
            onClose: function(){
              alert('Kamu menutup pop-up sebelum menyelesaikan pembayaran');
            }
          })
        } else {
          alert('Gagal mengambil token pembayaran');
        }
      })
      .catch(err => console.error(err));
    }
  };

  // Fungsi Eksekusi Utama ke Laravel API
  const executeCheckout = () => {
    const payload = {
      nama_pelanggan: customer.nama_pelanggan,
      plat_nomor: customer.plat_nomor,
      metode_pembayaran: paymentMethod,
      uang_bayar: paymentMethod === 'QRIS' ? totalHarga : uangBayar,
      items: cart.map(item => ({ spare_part_id: item.id, jumlah: item.qty }))
    };

    fetch('http://bengkelmanggono.freehosting.dev/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setIsQrisModalOpen(false); // Tutup QRIS jika terbuka
        setReceiptData({
          no_nota: data.data.no_nota,
          tanggal: new Date().toLocaleString('id-ID'),
          pelanggan: customer.nama_pelanggan || 'Umum',
          plat_nomor: customer.plat_nomor || '-',
          metode: paymentMethod,
          items: [...cart],
          total: totalHarga,
          bayar: paymentMethod === 'QRIS' ? totalHarga : uangBayar,
          kembalian: data.data.kembalian
        });

        // Reset Kasir
        setCart([]);
        setCustomer({ nama_pelanggan: '', plat_nomor: '' });
        setUangBayar('');
        setPaymentMethod('Cash');
        fetchSpareParts(); 
      } else {
        alert(data.message);
      }
    })
    .catch(err => console.error('Checkout error:', err));
  };

  const handlePrint = () => window.print();
  const closeReceipt = () => setReceiptData(null);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex gap-6 relative">
      
      {/* KIRI: Daftar Barang (Sama seperti sebelumnya) */}
      <div className="w-2/3 bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🛒 Daftar Barang</h2>
        <input type="text" placeholder="Cari nama atau kode barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] pr-2">
          {filteredParts.map(part => (
            <div key={part.id} onClick={() => addToCart(part)} className={`border p-4 rounded-xl cursor-pointer transition ${part.stok > 0 ? 'hover:border-blue-500 hover:shadow-md bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'}`}>
              <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 h-10">{part.nama_barang}</h3>
              <p className="text-xs text-gray-500 mb-3">{part.kode_barang}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600">Rp {parseFloat(part.harga_jual).toLocaleString('id-ID')}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${part.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Stok: {part.stok}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KANAN: Detail Transaksi */}
      <div className="w-1/3 bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-[calc(100vh-3rem)]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">🧾 Detail Transaksi</h2>
        
        {/* List Keranjang */}
        <div className="flex-1 overflow-y-auto mb-4">
          {cart.length === 0 ? <div className="flex h-full items-center justify-center text-gray-400 font-medium">Keranjang Kosong</div> : (
            <div className="flex flex-col gap-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div className="w-1/2">
                    <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.nama_barang}</p>
                    <p className="text-xs text-gray-500">Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200">-</button>
                    <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold hover:bg-blue-200">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Pelanggan & Pembayaran */}
        <div className="border-t pt-4">
          <div className="flex flex-col gap-3 mb-4">
            <input type="text" placeholder="Nama Pelanggan (Opsional)" value={customer.nama_pelanggan} onChange={(e) => setCustomer({...customer, nama_pelanggan: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <input type="text" placeholder="Plat Nomor (Contoh: D 1234 AB)" value={customer.plat_nomor} onChange={(e) => setCustomer({...customer, plat_nomor: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {/* Toggle Metode Pembayaran */}
          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setPaymentMethod('Cash')} 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition ${paymentMethod === 'Cash' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              💵 Tunai / Cash
            </button>
            <button 
              onClick={() => setPaymentMethod('QRIS')} 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition ${paymentMethod === 'QRIS' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📱 QRIS (Sandbox)
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Harga:</span>
            <span className="text-2xl font-bold text-gray-900">Rp {totalHarga.toLocaleString('id-ID')}</span>
          </div>

          {/* Input Uang Bayar HANYA muncul kalau milih Cash */}
          {paymentMethod === 'Cash' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Uang Bayar</label>
              <input type="number" value={uangBayar} onChange={(e) => setUangBayar(e.target.value)} placeholder="0" className="w-full border-2 border-gray-300 rounded-lg p-3 font-bold text-lg focus:border-blue-500 focus:outline-none" />
            </div>
          )}

          <button 
            onClick={handlePreCheckout} 
            disabled={cart.length === 0 || (paymentMethod === 'Cash' && uangBayar < totalHarga)} 
            className={`w-full py-3 rounded-lg font-bold text-white transition cursor-pointer ${cart.length === 0 || (paymentMethod === 'Cash' && uangBayar < totalHarga) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg'}`}
          >
            {paymentMethod === 'QRIS' ? 'TAMPILKAN QRIS' : 'PROSES PEMBAYARAN'}
          </button>
        </div>
      </div>

      {/* --- POP-UP MODAL QRIS SANDBOX --- */}
      {isQrisModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Scan QRIS (Sandbox)</h2>
            <p className="text-sm text-gray-500 mb-6">Mang Gono POS Integration</p>
            
            {/* Pakai public API buat generate barcode dummy */}
            <div className="p-4 border-4 border-blue-600 rounded-xl mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MANG_GONO_POS_PAYMENT_Rp${totalHarga}`} alt="QRIS Sandbox" className="w-48 h-48" />
            </div>

            <div className="w-full bg-blue-50 rounded-lg p-4 text-center mb-6">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Tagihan:</p>
              <p className="text-2xl font-black text-blue-800">Rp {totalHarga.toLocaleString('id-ID')}</p>
            </div>

            <button onClick={executeCheckout} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg mb-3 cursor-pointer">
              Simulasi Pelanggan Selesai Bayar
            </button>
            <button onClick={() => setIsQrisModalOpen(false)} className="text-sm font-bold text-gray-500 hover:text-red-500 transition cursor-pointer">
              Batalkan Transaksi
            </button>
          </div>
        </div>
      )}

      {/* --- POP-UP NOTA (MUNCUL SETELAH BAYAR) --- */}
      {receiptData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg flex flex-col max-w-sm w-full overflow-hidden">
            <div id="printable-receipt" className="p-6 bg-white text-black font-mono text-sm mx-auto w-full max-w-[80mm]">
              <div className="text-center mb-4 border-b-2 border-dashed border-gray-400 pb-4">
                <h2 className="text-xl font-bold uppercase">Bengkel Mang Gono</h2>
                <p className="text-xs">Jl. Otomotif No. 1, Bandung</p>
                <p className="text-xs mt-1">{receiptData.tanggal}</p>
              </div>
              
              <div className="mb-4 text-xs">
                <p>Nota: {receiptData.no_nota}</p>
                <p>Plg : {receiptData.pelanggan}</p>
                <p>Plat: {receiptData.plat_nomor}</p>
                <p>Pembayaran: {receiptData.metode}</p> {/* Tambahan info metode */}
              </div>

              <div className="border-b-2 border-dashed border-gray-400 pb-2 mb-2">
                {receiptData.items.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-bold">{item.nama_barang}</p>
                    <div className="flex justify-between">
                      <span>{item.qty} x {parseFloat(item.harga_jual).toLocaleString('id-ID')}</span>
                      <span>{(item.qty * item.harga_jual).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right font-bold text-sm mb-4">
                <div className="flex justify-between"><span>Total:</span> <span>Rp {receiptData.total.toLocaleString('id-ID')}</span></div>
                {receiptData.metode === 'Cash' ? (
                  <>
                    <div className="flex justify-between"><span>Bayar (Tunai):</span> <span>Rp {parseFloat(receiptData.bayar).toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between mt-1 pt-1 border-t border-dashed border-gray-400">
                      <span>Kembali:</span> <span>Rp {parseFloat(receiptData.kembalian).toLocaleString('id-ID')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-green-600 mt-1 pt-1 border-t border-dashed border-gray-400">
                    <span>LUNAS (QRIS)</span> <span>Rp {receiptData.total.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-xs mt-6">
                <p>Terima Kasih</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 flex gap-3 border-t">
              <button onClick={closeReceipt} className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition cursor-pointer">Tutup</button>
              <button onClick={handlePrint} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition cursor-pointer">Cetak Struk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashier;