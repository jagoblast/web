import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Ambil daftar toko beserta informasi pemiliknya dari tabel users
  const { results: stores } = await db.prepare(`
    SELECT s.id, s.name, s.slug, s.location, s.rating, s.followers_count, s.created_at,
           u.name as owner_name, u.email as owner_email
    FROM stores s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
  `).all()

  return c.render(
    <div className="py-8 px-6 md:px-10 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-widest">Manajemen Toko</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau seluruh toko (vendor) yang beroperasi di platform ini.</p>
        </div>
      </div>

      {/* TABEL TOKO */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                <th className="p-4 font-bold">Nama Toko / Slug</th>
                <th className="p-4 font-bold">Pemilik (Owner)</th>
                <th className="p-4 font-bold">Lokasi</th>
                <th className="p-4 font-bold">Statistik</th>
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                    Belum ada toko yang terdaftar.
                  </td>
                </tr>
              ) : (
                stores.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <a href={`/store/${s.slug}`} target="_blank" className="text-[10px] text-blue-500 hover:underline mt-0.5 inline-block">/{s.slug} ↗</a>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{s.owner_name}</div>
                      <div className="text-[10px] text-gray-500">{s.owner_email}</div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {s.location || '-'}
                    </td>
                    <td className="p-4">
                      <div className="text-[11px] font-bold text-amber-500">⭐ {(s.rating as number).toFixed(1)}</div>
                      <div className="text-[10px] text-gray-500">{s.followers_count} Followers</div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {/* Form aksi hapus (pastikan endpoint delete dibuat jika fitur ini digunakan) */}
                      <form method="POST" action={`/admin/stores/delete/${s.id}`} className="inline" onsubmit="return confirm('Yakin ingin menghapus toko ini secara permanen? Semua produk dan pesanannya akan ikut terhapus karena aturan CASCADE!')">
                        <button type="submit" className="text-red-500 hover:text-red-800 text-[10px] font-bold uppercase tracking-widest transition-colors">
                          Hapus Toko
                        </button>
                      </form>
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
