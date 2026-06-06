import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  // Ambil daftar pesanan dari tabel store_orders yang terhubung ke pembeli ini
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
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR AKUN PROPORSIONAL */}
        <aside className="w-full lg:w-1/4 flex-shrink-0">
          <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{user.name}</h2>
            <p className="text-xs text-gray-500 mb-6 truncate">{user.email}</p>
            <nav className="space-y-1.5">
              <a href="/account" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-sm transition-colors">Dasbor Akun</a>
              <a href="/account/orders" className="block text-sm font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-sm">Riwayat Pesanan</a>
              <a href="/account/settings" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-sm transition-colors">Pengaturan Profil</a>
            </nav>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <main className="w-full lg:w-3/4">
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-sm shadow-sm min-h-[500px]">
            <h3 className="text-xl font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-wider">
              Riwayat Pesanan
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Anda belum pernah melakukan pesanan.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.store_order_id} className="border border-gray-200 rounded-sm p-5 hover:border-gray-300 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Penjual</span>
                        <h4 className="text-sm font-bold text-gray-900">{order.store_name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Order ID: {order.store_order_id}</p>
                      </div>
                      <div className="mt-3 md:mt-0 text-left md:text-right">
                        <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase rounded-sm ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'disputed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-sm">
                      <p><strong>Kurir:</strong> {order.shipping_courier || '-'}</p>
                      <p><strong>Resi:</strong> {order.tracking_number || 'Belum diupdate'}</p>
                    </div>

                    {/* Tombol Aksi jika pesanan sedang dikirim (shipped/delivered) */}
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-100">
                        <button 
                          onClick={`if(confirm('Pesanan sudah sesuai? Uang akan diteruskan ke penjual.')){ fetch('/api/orders/action', {method: 'POST', body: JSON.stringify({store_order_id: '${order.store_order_id}', action: 'accept'}), headers: {'Content-Type': 'application/json'}}).then(()=>window.location.reload()) }`}
                          className="bg-black text-white px-4 py-2 text-xs font-bold uppercase rounded-sm hover:bg-gray-800"
                        >
                          Pesanan Diterima
                        </button>
                        <button 
                          onClick={`let r = prompt('Alasan komplain/refund?'); if(r){ fetch('/api/orders/action', {method: 'POST', body: JSON.stringify({store_order_id: '${order.store_order_id}', action: 'refund', reason: r}), headers: {'Content-Type': 'application/json'}}).then(()=>window.location.reload()) }`}
                          className="border border-red-600 text-red-600 px-4 py-2 text-xs font-bold uppercase rounded-sm hover:bg-red-50"
                        >
                          Komplain / Refund
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
})
