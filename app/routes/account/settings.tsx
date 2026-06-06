import { createRoute } from 'honox/factory'
import { getAuthUser, hashPassword } from '../../utils/auth'

// --- LOGIKA BACKEND: PROSES UPDATE PROFIL & PASSWORD MANDIRI ---
export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const formData = await c.req.formData()
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const oldPassword = formData.get('old_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  try {
    // 1. Update Informasi Dasar Profil Terlebih Dahulu
    await db.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(name, phone, address, user.id).run()

    // 2. Jika Kolom Password Baru Diisi, Jalankan Validasi Perubahan Password
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return c.redirect('/account/settings?err=missing_fields')
      }

      if (newPassword !== confirmPassword) {
        return c.redirect('/account/settings?err=password_mismatch')
      }

      // Ambil hash password lama dari database untuk dicocokkan
      const userData = await db.prepare("SELECT password_hash FROM users WHERE id = ?").bind(user.id).first()
      const oldPasswordHash = await hashPassword(oldPassword)

      if (userData.password_hash !== oldPasswordHash) {
        return c.redirect('/account/settings?err=wrong_old_password')
      }

      // Validasi lolos, enkripsi password baru dan simpan
      const newPasswordHash = await hashPassword(newPassword)
      await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newPasswordHash, user.id).run()
    }

    return c.redirect('/account/settings?success=1')
  } catch (error) {
    return c.redirect('/account/settings?err=system_error')
  }
})

// --- LOGIKA FRONTEND: TAMPILAN FORM PENGATURAN AKUN ---
export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  // Ambil data profil terbaru dari database
  const account = await db.prepare("SELECT name, email, phone, address FROM users WHERE id = ?").bind(user.id).first()

  const success = c.req.query('success')
  const error = c.req.query('err')

  return c.render(
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR AKUN */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              {account.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{account.name}</h2>
            <p className="text-sm text-gray-500 mb-6">{account.email}</p>
            <nav className="space-y-2">
              <a href="/account" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded-sm">Dasbor Akun</a>
              <a href="/account/orders" className="block text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded-sm">Riwayat Pesanan</a>
              <a href="/account/settings" className="block text-sm font-bold text-red-600 bg-red-50 p-2 rounded-sm">Pengaturan Profil</a>
              <form action="/logout" method="POST" className="pt-4 mt-4 border-t border-gray-100">
                <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-700 w-full text-left p-2">Keluar (Logout)</button>
              </form>
            </nav>
          </div>
        </div>

        {/* UTAMA FORM */}
        <div className="w-full md:w-3/4">
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-sm shadow-sm space-y-6">
            <h3 className="text-xl font-black mb-6 border-b pb-4 uppercase tracking-wider">Pengaturan Profil & Keamanan</h3>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 text-sm font-medium rounded-sm">
                ✓ Perubahan profil dan kata sandi berhasil diperbarui.
              </div>
            )}
            {error === 'missing_fields' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-medium rounded-sm">
                ⚠ Gagal mengubah password. Semua kolom password wajib diisi!
              </div>
            )}
            {error === 'password_mismatch' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-medium rounded-sm">
                ⚠ Password baru dan konfirmasi password tidak cocok!
              </div>
            )}
            {error === 'wrong_old_password' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-medium rounded-sm">
                ⚠ Password lama yang Anda masukkan tidak sesuai!
              </div>
            )}

            <form action="/account/settings" method="POST" className="space-y-8">
              
              {/* SEKSI INFORMASI DASAR */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Informasi Pribadi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nama Lengkap</label>
                    <input type="text" name="name" required defaultValue={account.name} className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-black focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nomor Telepon</label>
                    <input type="text" name="phone" defaultValue={account.phone || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="Contoh: 08123456789" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Alamat Lengkap Pengiriman</label>
                    <textarea name="address" rows={3} defaultValue={account.address || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="Tulis alamat rumah lengkap Anda..."></textarea>
                  </div>
                </div>
              </div>

              {/* SEKSI GANTI PASSWORD */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Ubah Kata Sandi (Kosongkan jika tidak ingin diubah)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Password Lama</label>
                    <input type="password" name="old_password" className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-black focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Password Baru</label>
                    <input type="password" name="new_password" className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-black focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Konfirmasi Password Baru</label>
                    <input type="password" name="confirm_password" className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-black focus:border-black" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors shadow-sm">
                  Simpan Semua Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
})
