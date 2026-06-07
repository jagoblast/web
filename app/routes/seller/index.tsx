import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const store = await db.prepare("SELECT * FROM stores WHERE user_id = ?").bind(user.id).first()
  if (!store) return c.redirect('/seller/register')

  const { results: products } = await db.prepare("SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC").bind(store.id).all()

  return c.render(
    <div className="py-8 px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Dasbor */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
             <div className="w-16 h-16 bg-gray-200 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xl text-gray-500 overflow-hidden">
                {store.avatar_url ? <img src={store.avatar_url as string} className="w-full h-full object-cover" /> : store.name?.toString().charAt(0)}
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-sm text-gray-500">Dasbor Penjual • <a href={`/store/${store.slug}`} target="_blank" className="text-black hover:underline font-medium">Lihat Toko Publik ↗</a></p>
             </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
             <a href="/seller/products/new" className="bg-black text-white px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm">
                + Tambah Produk
             </a>
          </div>
        </div>

        {/* Statistik Cepat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Total Produk</p>
             <h3 className="text-3xl font-black text-gray-900">{products.length}</h3>
           </div>
           <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Pengikut (Followers)</p>
             <h3 className="text-3xl font-black text-gray-900">{store.followers_count || 0}</h3>
           </div>
           <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Rating Toko</p>
             <h3 className="text-3xl font-black text-amber-500">★ {(store.rating as number).toFixed(1)}</h3>
           </div>
        </div>

        {/* Tabel Etalase Produk */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h2 className="text-lg font-bold text-gray-900">Etalase Produk Saya</h2>
          </div>
          {products.length === 0 ? (
             <div className="p-12 text-center">
                <p className="text-gray-500 mb-4 text-sm">Anda belum menambahkan produk apapun untuk dijual.</p>
                <a href="/seller/products/new" className="text-black text-xs font-bold uppercase tracking-widest border border-black px-6 py-2.5 rounded-sm hover:bg-gray-50 transition-colors">Mulai Jualan</a>
             </div>
          ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                     <th className="p-4 font-bold">Produk</th>
                     <th className="p-4 font-bold">Brand</th>
                     <th className="p-4 font-bold">Harga</th>
                     <th className="p-4 font-bold">Stok</th>
                     <th className="p-4 font-bold">Status</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                   {products.map((p: any) => (
                     <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="p-4 font-medium text-black">
                         <a href={`/products/${p.slug}`} target="_blank" className="hover:underline">{p.name}</a>
                       </td>
                       <td className="p-4 text-gray-500">{p.brand}</td>
                       <td className="p-4 font-bold">Rp {(p.price as number).toLocaleString('id-ID')}</td>
                       <td className="p-4">{p.stock}</td>
                       <td className="p-4">
                          <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {p.is_active ? 'Aktif' : 'Draft'}
                          </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </div>

      </div>
    </div>
  )
})
