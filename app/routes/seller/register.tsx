import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'
import { generateId } from '../../utils/admin_utils'

// --- LOGIKA BACKEND: PENYIMPANAN PENDAFTARAN TOKO ---
export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const formData = await c.req.formData()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string

  if (!name || !location) return c.redirect('/seller/register?err=empty_fields')

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
  const storeId = generateId()

  try {
    await db.prepare(`
      INSERT INTO stores (id, user_id, slug, name, description, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(storeId, user.id, slug, name, description, location).run()

    // Otomatis buat dompet keuangan untuk toko vendor ini
    await db.prepare(`
      INSERT INTO vendor_wallets (id, store_id, pending_balance, available_balance)
      VALUES (?, ?, 0, 0)
    `).bind(generateId(), storeId).run()

    return c.redirect('/seller?success_register=1')
  } catch (error) {
    return c.redirect('/seller/register?err=system')
  }
})

// --- LOGIKA FRONTEND: TAMPILAN FORM PENDAFTARAN TOKO ---
export default createRoute(async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const err = c.req.query('err')

  return c.render(
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Pendaftaran Toko Vendor</h1>
        <p className="text-sm text-gray-500 mt-2">Mulai kelola produk Anda sendiri dengan mendaftarkan nama toko resmi.</p>
      </div>

      {err === 'empty_fields' && (
        <div className="bg-red-50 text-red-700 p-4 border border-red-200 text-xs font-bold rounded-sm mb-6">
          ⚠ Nama toko dan lokasi pengiriman wajib diisi!
        </div>
      )}
      {err === 'system' && (
        <div className="bg-red-50 text-red-700 p-4 border border-red-200 text-xs font-bold rounded-sm mb-6">
          ⚠ Gagal mendaftar. Anda mungkin telah memiliki toko yang terdaftar sebelumnya.
        </div>
      )}

      <form action="/seller/register" method="POST" className="bg-white border border-gray-200 p-6 md:p-8 rounded-sm shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Toko Resmi</label>
          <input type="text" name="name" required placeholder="Contoh: Toko Luxury Autentik" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kota Asal Pengiriman Toko</label>
          <input type="text" name="location" required placeholder="Contoh: Surabaya" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm" />
          <p className="text-[10px] text-gray-400 mt-1">Isi kota asal pengiriman fisik untuk kebutuhan integrasi multi-origin RajaOngkir.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Deskripsi Toko</label>
          <textarea name="description" rows={4} placeholder="Tulis rincian deskripsi mengenai toko Anda..." className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm"></textarea>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-xs py-4 rounded-sm hover:bg-gray-800 transition-colors shadow-sm">
            Buka Toko Sekarang
          </button>
        </div>
      </form>
    </div>
  )
})
