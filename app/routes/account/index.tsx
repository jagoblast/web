import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Proteksi Halaman: Hanya pengguna yang login yang bisa masuk
  const user = await getAuthUser(c)
  if (!user) {
    return c.redirect('/login')
  }

  // Ambil data pesanan milik pengguna ini
  const { results: orders } = await db.prepare(`
    SELECT id, status, total_amount, created_at, payment_method 
    FROM orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).bind(user.id).all()

  // Fungsi helper untuk mewarnai badge status
  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return c.render(
    <div className="w-full bg-[#f4f7fc] py-10 px-4 md:px-8 min-h-[70vh]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigasi Akun */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
            <div className="mb-6 pb-6 border-b border-gray-100 text-center md:text-left">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto md:mx-0 mb-3 flex items-center justify-center text-xl font-bold text-gray-500">
                {user.name ? (user.name as string).charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
              <p className="text-xs text-gray-500">Pelanggan ShopinId</p>
            </div>
            
            <nav className="space-y-2">
              <a href="/account" className="block px-4 py-2 text-sm font-bold bg-gray-50 text-black rounded-sm border-l-4 border-black">Riwayat Pesanan</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black rounded-sm">Pengaturan Profil</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black rounded-sm">Alamat Tersimpan</a>
              <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-sm mt-4">Keluar</a>
            </nav>
          </div>
        </div>

        {/* Konten Utama: Riwayat Pesanan */}
        <div className="w-full md:w-3/4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Pesanan Saya</h1>
          
          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-sm shadow-sm border border-gray-100 text-center">
              <div className="text-gray-300 mb-4 flex justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pesanan</h3>
              <p className="text-gray-500 text-sm mb-6">Anda belum pernah melakukan transaksi di ShopinId.</p>
              <a href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800">Mulai Belanja</a>
            </div>
          ) : (
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-bold">ID Pesanan</th>
                      <th className="p-4 font-bold">Tanggal</th>
                      <th className="p-4 font-bold">Total Belanja</th>
                      <th className="p-4 font-bold">Metode</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-black">{order.id}</td>
                        <td className="p-4">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 font-bold">Rp {(order.total_amount as number).toLocaleString('id-ID')}</td>
                        <td className="p-4 text-xs uppercase text-gray-500">{order.payment_method === 'manual' ? 'Transfer Bank' : 'Gateway'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status as string)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
})
