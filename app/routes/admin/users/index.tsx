import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Ambil semua daftar pengguna, urutkan dari yang terbaru
  const { results: users } = await db.prepare(`
    SELECT id, name, email, role, phone, created_at 
    FROM users 
    ORDER BY created_at DESC
  `).all()

  return c.render(
    <div className="py-8 px-6 md:px-10 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-widest">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua akun pembeli, penjual, dan admin di platform Anda.</p>
        </div>
      </div>

      {/* TABEL PENGGUNA */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                <th className="p-4 font-bold">Nama / Email</th>
                <th className="p-4 font-bold">Telepon</th>
                <th className="p-4 font-bold">Peran (Role)</th>
                <th className="p-4 font-bold">Tanggal Daftar</th>
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{u.email}</div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {u.phone || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                        u.role === 'vendor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                         day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {/* Link mengarah ke file reset-password.tsx yang sudah ada di folder Anda */}
                      <a href={`/admin/users/reset-password?id=${u.id}`} className="text-blue-500 hover:text-blue-800 text-[10px] font-bold uppercase tracking-widest transition-colors">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
})
