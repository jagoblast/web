import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../../utils/auth'
import { generateId } from '../../../utils/admin_utils'

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const admin = await getAuthUser(c)
  if (!admin || admin.role !== 'admin') return c.text('Unauthorized', 401)

  const formData = await c.req.formData()
  const action = formData.get('action') as string

  if (action === 'create') {
    const name = formData.get('level_name') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const bonus = parseFloat(formData.get('bonus') as string) || 0
    const benefit = formData.get('benefit') as string
    const id = 'LVL-' + generateId().substring(0, 6).toUpperCase()

    await db.prepare(`
      INSERT INTO membership_levels (id, level_name, price, bonus, benefit)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, name, price, bonus, benefit).run()
  } 
  else if (action === 'update') {
    const id = formData.get('id') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const bonus = parseFloat(formData.get('bonus') as string) || 0
    const benefit = formData.get('benefit') as string

    await db.prepare(`
      UPDATE membership_levels 
      SET price = ?, bonus = ?, benefit = ? 
      WHERE id = ?
    `).bind(price, bonus, benefit, id).run()
  }

  return c.redirect('/admin/membership-levels?success=1')
})

export default createRoute(async (c) => {
  const db = c.env.DB
  const admin = await getAuthUser(c)
  if (!admin || admin.role !== 'admin') return c.redirect('/login')

  const { results: levels } = await db.prepare("SELECT * FROM membership_levels ORDER BY created_at ASC").all()
  const success = c.req.query('success')

  return c.render(
    <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Level Membership Vendor</h2>
          <p className="text-sm text-gray-500 mt-1">Atur harga komitmen pendaftaran, bonus saldo, dan keuntungan fitur toko.</p>
        </div>
        {/* FORM INLINE TAMBAH LEVEL BARU */}
        <form action="/admin/membership-levels" method="POST" className="flex flex-wrap gap-2 items-center bg-gray-50 p-4 border border-gray-200 rounded-sm w-full md:w-auto">
          <input type="hidden" name="action" value="create" />
          <input type="text" name="level_name" placeholder="Nama Level (Misal: LVL2)" required className="border border-gray-300 px-3 py-2 text-xs rounded-sm focus:ring-black w-28 font-bold" />
          <input type="number" name="price" placeholder="Harga Jual" required className="border border-gray-300 px-3 py-2 text-xs rounded-sm focus:ring-black w-28" />
          <input type="number" name="bonus" placeholder="Bonus Saldo" required className="border border-gray-300 px-3 py-2 text-xs rounded-sm focus:ring-black w-24" />
          <input type="text" name="benefit" placeholder="Manfaat singkat..." required className="border border-gray-300 px-3 py-2 text-xs rounded-sm focus:ring-black w-40" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 text-xs font-bold rounded-sm hover:bg-green-700 uppercase tracking-wider">
             + Tambah Level
          </button>
        </form>
      </div>

      {success && <div className="bg-green-50 text-green-700 border border-green-200 p-4 text-sm font-bold mb-6">✓ Perubahan tingkatan keanggotaan berhasil disimpan!</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold">Nama Level</th>
              <th className="p-4 font-bold">Harga Pendaftaran (Rp)</th>
              <th className="p-4 font-bold">Bonus Saldo Awal (Rp)</th>
              <th className="p-4 font-bold">Keuntungan / Deskripsi Benefit</th>
              <th className="p-4 font-bold text-right">Aksi Simpan</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {levels.map((lvl: any) => (
              <tr key={lvl.id} className="border-b border-gray-100 hover:bg-gray-50">
                <form action="/admin/membership-levels" method="POST" className="m-0">
                  <input type="hidden" name="action" value="update" />
                  <input type="hidden" name="id" value={lvl.id} />
                  <td className="p-4 font-black text-gray-900">{lvl.level_name}</td>
                  <td className="p-4">
                     <input type="number" name="price" defaultValue={lvl.price} className="border border-gray-300 px-2 py-1 text-xs rounded-sm focus:ring-black font-bold w-32" />
                  </td>
                  <td className="p-4">
                     <input type="number" name="bonus" defaultValue={lvl.bonus} className="border border-gray-300 px-2 py-1 text-xs rounded-sm focus:ring-black font-bold w-28 text-green-600" />
                  </td>
                  <td className="p-4">
                     <input type="text" name="benefit" defaultValue={lvl.benefit || ''} className="border border-gray-300 px-2 py-1 text-xs rounded-sm focus:ring-black w-full min-w-[200px]" />
                  </td>
                  <td className="p-4 text-right">
                     <button type="submit" className="bg-black text-white px-4 py-1.5 rounded-sm text-xs font-bold uppercase hover:bg-gray-800 transition-colors">
                        Simpan
                     </button>
                  </td>
                </form>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
