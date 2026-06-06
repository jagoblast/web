import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const wishlistQuery = await db.prepare(`
    SELECT p.id, p.name, p.price, p.slug, p.images_json, w.id as wishlist_id
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).bind(user.id).all()

  const wishlists = wishlistQuery.results || []

  return c.render(
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR AKUN PROPORSIONAL */}
        <aside className="w-full lg:w-1/4 flex-shrink-0">
          <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm sticky top-24">
            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{user.name}</h2>
            <p className="text-xs text-gray-500 mb-6 truncate">{user.email}</p>
            
            <nav className="space-y-1.5">
              <a href="/account" className="block text-sm font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-sm">Dasbor Akun</a>
              <a href="/account/orders" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-sm transition-colors">Riwayat Pesanan</a>
              <a href="/account/settings" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-sm transition-colors">Pengaturan Profil</a>
              <a href="/seller" className="block text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-sm mt-4 transition-colors">Area Vendor Saya</a>
              <form action="/logout" method="POST" className="pt-4 mt-4 border-t border-gray-100">
                <button type="submit" className="text-sm font-bold text-red-500 hover:text-red-700 w-full text-left px-4 py-2">Keluar (Logout)</button>
              </form>
            </nav>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <main className="w-full lg:w-3/4">
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-sm shadow-sm min-h-[500px]">
            <h3 className="text-xl font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-wider">
              Wishlist Saya <span className="text-gray-400 text-sm ml-2">({wishlists.length})</span>
            </h3>
            
            {wishlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <p className="text-sm font-medium">Belum ada produk yang disimpan.</p>
                <a href="/products" className="mt-4 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-gray-800">Mulai Belanja</a>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {wishlists.map((item: any) => {
                   let imgUrl = 'https://via.placeholder.com/300'
                   try {
                     const imgs = JSON.parse(item.images_json)
                     if (imgs.length > 0) imgUrl = imgs[0]
                   } catch(e) {}

                   return (
                     <div key={item.id} className="group relative border border-gray-100 rounded-sm hover:shadow-lg transition-all duration-300 bg-white">
                        <a href={`/products/${item.slug}`} className="block relative w-full aspect-square bg-gray-50 overflow-hidden">
                           <img src={imgUrl} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </a>
                        <div className="p-4">
                           <h4 className="text-xs font-medium text-gray-800 line-clamp-2 min-h-[32px]">{item.name}</h4>
                           <p className="text-sm font-bold text-red-600 mt-2">Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button 
                           onClick={`fetch('/api/wishlist/toggle', {method: 'POST', body: JSON.stringify({product_id: '${item.id}'}), headers: {'Content-Type': 'application/json'}}).then(()=>window.location.reload())`}
                           className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-red-500 hover:bg-red-50"
                           title="Hapus"
                        >
                           <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                     </div>
                   )
                })}
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
})
