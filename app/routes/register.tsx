import { createRoute } from 'honox/factory'
import { generateId } from '../utils/admin_utils'
import { hashPassword, createToken, setAuthCookie } from '../utils/auth'

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string || ''

  try {
    const userId = 'USR-' + generateId().substring(0, 8).toUpperCase()
    const hashed = await hashPassword(password)

    // Simpan pengguna baru ke database
    await db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone)
      VALUES (?, ?, ?, ?, 'customer', ?)
    `).bind(userId, name, email, hashed, phone).run()

    // Langsung loginkan pengguna setelah berhasil daftar
    const token = await createToken(c, { id: userId, role: 'customer', name: name })
    setAuthCookie(c, token)
    
    return c.redirect('/account?welcome=1')
  } catch (error) {
    // Menangkap error (misal: email sudah terdaftar/UNIQUE constraint failed)
    return c.redirect('/register?err=email_terdaftar')
  }
})

export default createRoute(async (c) => {
  const err = c.req.query('err')

  return c.render(
    <div className="w-full min-h-[70vh] bg-[#f4f7fc] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-sm shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter mb-2 uppercase">Gabung Shopin<span className="text-red-600">Id</span></h1>
          <p className="text-sm text-gray-500">Buat akun untuk melacak pesanan dan checkout lebih cepat.</p>
        </div>

        {err === 'email_terdaftar' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">Email ini sudah digunakan. Silakan gunakan email lain atau masuk.</p>
          </div>
        )}

        <form method="POST" action="/register" className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Alamat Email</label>
            <input type="email" name="email" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="nama@email.com" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nomor Telepon (Opsional)</label>
            <input type="text" name="phone" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="0812xxxxxx" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kata Sandi</label>
            <input type="password" name="password" required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black" placeholder="Minimal 6 karakter" />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm mt-4">
            Daftar Sekarang
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Sudah punya akun? <a href="/login" className="font-bold text-black hover:underline">Masuk di sini</a>
          </p>
        </div>
        
      </div>
    </div>
  )
})
