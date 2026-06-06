import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  
  // Proteksi Halaman, arahkan ke login jika belum ada sesi
  if (!user) return c.redirect('/login')

  // 1. Mengambil data Wishlist milik pengguna beserta info produknya
  const wishlistQuery = await db.prepare(`
    SELECT p.id, p.name, p.price, p.slug, p.images_json, w.id as wishlist_id
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).bind(user.id).all()

  const wishlists = wishlistQuery.results || []

  // 2. (Opsional) Mengambil pesanan terbaru milik user
  const ordersQuery = await db.prepare(`
    SELECT id, grand_total, status, created_at 
    FROM orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 5
  `).bind(user.id).all()
  
  const orders = ordersQuery.results || []

  return c.render(
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR AKUN */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-6">{user.email}</p>
            
            <nav className="space-y-2">
              <a href="/account" className="block text-sm font-bold text-red-600 bg-red-50 p-2 rounded-sm">Dasbor Akun</a>
              <a href="/account/orders" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded-sm">Riwayat Pesanan</a>
              <a href="/account/settings" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded-sm">Pengaturan Profil</a>
              <a href="/seller" className="block text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-sm mt-4 border border-blue-100">Area Vendor Saya</a>
              <form action="/logout" method="POST" className="pt-4 mt-4 border-t border-gray-100">
                <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-700 w-full text-left p-2">Keluar (Logout)</button>
              </form>
            </nav>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="w-full md:w-3/4 space-y-8">
          
          {/* SEKSI WISHLIST */}
          <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
            <h3 className="text-xl font-black mb-6 border-b pb-4">Wishlist Saya ({wishlists.length})</h3>
            
            {wishlists.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <p>Belum ada produk impian yang disimpan.</p>
                <a href="/products" className="inline-block mt-4 text-sm font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">Mulai Belanja</a>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlists.map((item: any) => {
                   let imgUrl = 'https://via.placeholder.com/300'
                   try {
                     const imgs = JSON.parse(item.images_json)
                     if (imgs.length > 0) imgUrl = imgs[0]
                   } catch(e) {}

                   return (
                     <div key={item.id} className="group relative border border-gray-100 rounded-sm hover:shadow-md transition-shadow bg-white">
                        <a href={`/products/${item.slug}`} className="block relative w-full aspect-square bg-gray-50 overflow-hidden">
                           <img src={imgUrl} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </a>
                        <div className="p-3">
                           <h4 className="text-xs font-medium text-gray-800 line-clamp-2 min-h-[32px]">{item.name}</h4>
                           <p className="text-sm font-bold text-red-600 mt-2">Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                        {/* Tombol Hapus dari Wishlist (Client Side Scripting dibutuhkan untuk fetch API Toggle) */}
                        <button 
                           onClick={`fetch('/api/wishlist/toggle', {method: 'POST', body: JSON.stringify({product_id: '${item.id}'}), headers: {'Content-Type': 'application/json'}}).then(()=>window.location.reload())`}
                           className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600"
                           title="Hapus dari Wishlist"
                        >
                           <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                     </div>
                   )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
})
