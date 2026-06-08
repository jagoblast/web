import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../../utils/auth'
import { generateId } from '../../../utils/admin_utils'

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  
  const admin = await getAuthUser(c)
  if (!admin || admin.role !== 'admin') return c.redirect('/login')

  const formData = await c.req.formData()
  const targetUserId = formData.get('user_id') as string
  const storeName = formData.get('name') as string
  const location = formData.get('location') as string

  // Defensif: Menambahkan kolom status ke tabel stores jika belum ada
  try { await db.prepare("ALTER TABLE stores ADD COLUMN status TEXT DEFAULT 'active'").run() } catch(e) {}

  const storeId = 'STR-' + generateId().substring(0, 8).toUpperCase()
  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6)

  try {
    // 1. Buat Entitas Toko untuk pengguna tersebut
    await db.prepare(`
      INSERT INTO stores (id, user_id, slug, name, location, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).bind(storeId, targetUserId, slug, storeName, location).run()

    // 2. Buat Dompet Vendor & SUNTIK BONUS Rp 13.000
    const walletId = 'WAL-' + generateId().substring(0, 8).toUpperCase()
    const bonusAmount = 13000

    await db.prepare(`
      INSERT INTO vendor_wallets (id, store_id, pending_balance, available_balance)
      VALUES (?, ?, 0, ?)
    `).bind(walletId, storeId, bonusAmount).run()

    // 3. Catat ke Riwayat Transaksi Dompet (Penting untuk mutasi)
    await db.prepare(`
      INSERT INTO wallet_transactions (id, wallet_id, type, amount, description)
      VALUES (?, ?, 'bonus', ?, 'Bonus Pendaftaran Vendor via Admin')
    `).bind(generateId(), walletId, bonusAmount).run()

    return c.redirect('/admin/stores?success=created')
  } catch (err) {
    return c.redirect('/admin/stores/new?err=failed')
  }
})

export default createRoute(async (c) => {
  const db = c.env.DB
  const admin = await getAuthUser(c)
  if (!admin || admin.role !== 'admin') return c.redirect('/login')

  // Ambil daftar pengguna (Customer) yang belum memiliki toko untuk dipilih di Dropdown
  const { results: availableUsers } = await db.prepare(`
    SELECT id, name, email FROM users 
    WHERE id NOT IN (SELECT user_id FROM stores)
    ORDER BY created_at DESC
  `).all()

  return c.render(
    <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200 max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Registrasi Vendor Baru</h2>
           <p className="text-sm text-gray-500 mt-1">Buat toko secara manual dan berikan bonus saldo awal.</p>
        </div>
        <a href="/admin/stores" className="text-sm font-bold text-gray-500 hover:text-black">← Batal</a>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 rounded-sm mb-6 flex items-start space-x-3">
         <span className="text-xl">💰</span>
         <div>
            <p className="text-sm font-bold text-green-800 uppercase tracking-widest">Sistem Bonus Aktif</p>
            <p className="text-xs text-green-700 mt-1">Dompet vendor akan otomatis dibuat dan diisi saldo sebesar <strong>Rp 13.000</strong> saat formulir ini disimpan.</p>
         </div>
      </div>

      <form action="/admin/stores/new" method="POST" className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pilih Akun Pengguna</label>
          <select name="user_id" required className="w-full border-gray-300 rounded-sm shadow-sm p-3 border focus:ring-black bg-white">
             <option value="">-- Pilih Pengguna --</option>
             {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
             ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">Hanya pengguna yang belum memiliki toko yang tampil di sini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Boutique / Toko</label>
              <input type="text" name="name" required className="w-full border-gray-300 rounded-sm shadow-sm p-3 border focus:ring-black" placeholder="Contoh: Vintage Paradiso" />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Lokasi (Kota)</label>
              <input type="text" name="location" required className="w-full border-gray-300 rounded-sm shadow-sm p-3 border focus:ring-black" placeholder="Contoh: Jakarta" />
           </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
           <button type="submit" className="bg-black text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-gray-800 shadow-md">
              Buat Toko & Cairkan Bonus
           </button>
        </div>
      </form>
    </div>
  )
})
