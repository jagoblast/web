import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const store = await db.prepare("SELECT id FROM stores WHERE user_id = ?").bind(user.id).first()
  if (!store) return c.redirect('/seller/register')

  const formData = await c.req.formData()
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const avatar_url = formData.get('avatar_url') as string
  const banner_url = formData.get('banner_url') as string

  try {
    await db.prepare(`
      UPDATE stores 
      SET description = ?, location = ?, avatar_url = ?, banner_url = ? 
      WHERE id = ?
    `).bind(description, location, avatar_url, banner_url, store.id).run()

    return c.redirect('/seller/settings?success=1')
  } catch (err) {
    return c.redirect('/seller/settings?err=1')
  }
})

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const store = await db.prepare("SELECT * FROM stores WHERE user_id = ?").bind(user.id).first()
  if (!store) return c.redirect('/seller/register')

  const success = c.req.query('success')

  return c.render(
    <div className="w-full bg-[#f4f7fc] min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Pengaturan Boutique</h1>
             <p className="text-sm text-gray-500">Sesuaikan tampilan toko publik Anda.</p>
          </div>
          <a href="/seller" className="text-sm font-bold text-gray-500 hover:text-black">← Kembali ke Dasbor</a>
        </div>

        {success === '1' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-sm shadow-sm">
            <p className="text-sm text-green-700 font-medium">Profil toko berhasil diperbarui!</p>
          </div>
        )}

        <form action="/seller/settings" method="POST" className="bg-white p-8 rounded-sm shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">URL Foto Profil (Avatar)</label>
              <input type="url" name="avatar_url" defaultValue={store.avatar_url as string || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">URL Gambar Banner</label>
              <input type="url" name="banner_url" defaultValue={store.banner_url as string || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Lokasi Pengiriman (Kota)</label>
              <input type="text" name="location" required defaultValue={store.location as string || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Deskripsi Toko</label>
              <textarea name="description" rows={4} required defaultValue={store.description as string || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="Ceritakan keunikan barang yang Anda jual..."></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-md">
              Simpan Pengaturan
            </button>
          </div>
        </form>

      </div>
    </div>
  )
})
