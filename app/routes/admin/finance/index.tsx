import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Ambil data dompet dari semua vendor
  const { results: wallets } = await db.prepare(`
    SELECT w.id, w.pending_balance, w.available_balance, w.updated_at, 
           s.name as store_name, s.slug 
    FROM vendor_wallets w
    JOIN stores s ON w.store_id = s.id
    ORDER BY w.available_balance DESC, w.pending_balance DESC
  `).all()

  // Hitung total likuiditas platform
  const totalAvailable = wallets.reduce((sum, w: any) => sum + w.available_balance, 0)
  const totalPending = wallets.reduce((sum, w: any) => sum + w.pending_balance, 0)

  return c.render(
    <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Keuangan & Saldo Vendor</h2>
           <p className="text-sm text-gray-500 mt-1">Awasi likuiditas dan permintaan penarikan dana dari penjual.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-gray-900 text-white p-6 rounded-sm shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Total Saldo Tersedia (Siap Ditarik)</p>
            <h3 className="text-3xl font-black">Rp {(totalAvailable as number).toLocaleString('id-ID')}</h3>
         </div>
         <div className="bg-gray-50 border border-gray-200 text-gray-900 p-6 rounded-sm shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Total Dana Tertahan (Escrow)</p>
            <h3 className="text-3xl font-black">Rp {(totalPending as number).toLocaleString('id-ID')}</h3>
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold">Boutique (Vendor)</th>
              <th className="p-4 font-bold">Saldo Tersedia</th>
              <th className="p-4 font-bold">Dana Tertahan</th>
              <th className="p-4 font-bold">Terakhir Diperbarui</th>
              <th className="p-4 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {wallets.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data dompet aktif.</td></tr>
            ) : (
              wallets.map((w: any) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{w.store_name}</div>
                    <div className="text-[10px] text-gray-400">ID: {w.id}</div>
                  </td>
                  <td className="p-4 font-black text-green-600">Rp {(w.available_balance as number).toLocaleString('id-ID')}</td>
                  <td className="p-4 font-bold text-gray-500">Rp {(w.pending_balance as number).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(w.updated_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-gray-200 border border-gray-200">Riwayat</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})
