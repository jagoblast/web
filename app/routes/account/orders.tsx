import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const ordersQuery = await db.prepare(`
    SELECT so.id as store_order_id, so.status, so.shipping_courier, so.tracking_number, so.shipping_cost,
           o.created_at, s.name as store_name
    FROM store_orders so
    JOIN orders o ON so.order_id = o.id
    JOIN stores s ON so.store_id = s.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).bind(user.id).all()

  const orders = ordersQuery.results || []

  return c.render(
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* SIDEBAR AKUN (STANDAR KONSISTEN) */}
        <aside className="w-full lg:col-span-1">
          <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-gray-900 truncate">{user.name}</h2>
            <p className="text-xs text-gray-500 mb-6 truncate">{user.email}</p>
            
            <nav className="flex flex-col space-y-1">
              <a href="/account" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-sm transition-colors">Dasbor Akun</a>
              <a href="/account/orders" className="block text-sm font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-sm">Riwayat Pesanan</a>
              <a href="/account/settings" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-sm transition-colors">Pengaturan Profil</a>
              <a href="/seller" className="block text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-sm mt-4 border border-blue-100 transition-colors">Area Toko Saya</a>
              <form action="/logout" method="POST" className="pt-4 mt-4 border-t border-gray-100">
                <button type="submit" className="text-sm font-bold text-red-500 hover:text-red-700 w-full text-left px-4 py-2">Keluar (Logout)</button>
              </form>
            </nav>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <section className="w-full lg:col-span-3">
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-sm shadow-sm min-h-[500px]">
            <h3 className="text-xl font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-wider text-gray-900">
              Riwayat Pesanan Pelanggan
            </h3>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-gray-400">
                <svg className="w-14 h-14 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <p className="text-sm font-medium">Anda belum memiliki riwayat transaksi apapun.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.store_order_id} className="border border-gray-200 rounded-sm p-5 hover:border-slate-300 transition-colors bg-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-100 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Toko Pengirim</span>
                        <h4 className="text-sm font-bold text-gray-900">{order.store_name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">ID Transaksi: <span className="font-mono">{order.store_order_id}</span></p>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-sm ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'disputed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-50 p-4 rounded-sm">
                      <p><strong>Ekspedisi Kurir:</strong> {order.shipping_courier || 'JNE'}</p>
                      <p><strong>Ongkos Kirim:</strong> Rp {order.shipping_cost.toLocaleString('id-ID')}</p>
                      <p className="sm:col-span-2 font-mono"><strong>No. Resi Pengiriman:</strong> {order.tracking_number || 'Sedang dipersiapkan'}</p>
                    </div>

                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100 justify-end">
                        <button 
                          onClick={`if(confirm('Apakah barang yang diterima sudah sesuai? Setelah dikonfirmasi, dana akan diteruskan ke saldo toko penjual.')){ fetch('/api/orders/action', {method: 'POST', body: JSON.stringify({store_order_id: '${order.store_order_id}', action: 'accept'}), headers: {'Content-Type': 'application/json'}}).then(()=>window.location.reload()) }`}
                          className="bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gray-800 transition-colors shadow-sm"
                        >
                          Konfirmasi Terima Barang
                        </button>
                        <button 
                          onClick={`let r = prompt('Masukkan alasan pengajuan komplain / pengembalian dana:'); if(r){ fetch('/api/orders/action', {method: 'POST', body: JSON.stringify({store_order_id: '${order.store_order_id}', action: 'refund', reason: r}), headers: {'Content-Type': 'application/json'}}).then(()=>window.location.reload()) }`}
                          className="border border-red-600 text-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-50 transition-colors"
                        >
                          Ajukan Refund / Komplain
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
})
