import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'
import { generateId } from '../../utils/admin_utils'

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const formData = await c.req.formData()
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string

  // Membuat URL ramah SEO (Slug) dari Nama Toko
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6)

  try {
    const storeId = 'STR-' + generateId().substring(0, 8).toUpperCase()
    
    await db.prepare(`
      INSERT INTO stores (id, user_id, slug, name, description, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(storeId, user.id, slug, name, description, location).run()

    return c.redirect('/seller')
  } catch (error) {
    return c.redirect('/seller/register?err=gagal')
  }
})

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  // Cek apakah pengguna sudah punya toko
  const existingStore = await db.prepare("SELECT id FROM stores WHERE user_id = ?").bind(user.id).first()
  if (existingStore) return c.redirect('/seller')

  return c.render(
    <div className="min-h-[80vh] bg-[#f4f7fc] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white p-8 md:p-10 rounded-sm shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter mb-2 uppercase">Buka Boutique Anda</h1>
          <p className="text-sm text-gray-500">Mulai berjualan barang mewah Anda di komunitas ShopinId.</p>
        </div>

        <form action="/seller/register" method="POST" className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Boutique / Toko</label>
            <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="Contoh: Vintage Paradiso" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Lokasi (Kota / Negara)</label>
            <input type="text" name="location" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="Contoh: Jakarta, Indonesia" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Deskripsi Singkat</label>
            <textarea name="description" rows={4} required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="Ceritakan tentang koleksi yang Anda jual..."></textarea>
          </div>
          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm">
            Buat Boutique Sekarang
          </button>
        </form>
      </div>
    </div>
  )
})
