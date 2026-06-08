import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Keamanan: Hanya Super Admin
  const admin = await getAuthUser(c)
  if (!admin || admin.role !== 'admin') return c.redirect('/login')

  // Defensif: Pastikan tabel riwayat transaksi dompet tersedia untuk kalkulasi
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id TEXT PRIMARY KEY,
        wallet_id TEXT,
        type TEXT,
        amount REAL,
        description TEXT,
        reference_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
  } catch (e) {}

  // Menghitung keempat metrik secara paralel (Batch Query)
  const stats = await db.batch([
    // 1. Total Deposit (Uang Hasil Penjualan yang cair ke dompet member dari Escrow)
    db.prepare("SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'escrow_release'"),
    // 2. Total Penarikan (Uang hasil penjualan yang sudah ditarik member ke rekeningnya)
    db.prepare("SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'withdrawal'"),
    // 3. Total Bonus Deposit (Bonus Rp 60k/13k yang disuntikkan admin saat daftar toko)
    db.prepare("SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'bonus'"),
    // 4. Total Bonus Penarikan (Uang bonus yang dicairkan oleh member)
    db.prepare("SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'bonus_withdrawal'")
  ])

  // Ekstrak hasil kalkulasi, berikan nilai 0 jika masih kosong
  const totalDeposit = stats[0].results[0]?.total || 0
  const totalWithdrawal = stats[1].results[0]?.total || 0
  const totalBonusDeposit = stats[2].results[0]?.total || 0
  const totalBonusWithdrawal = stats[3].results[0]?.total || 0

  // Ikon SVG Uang/Dompet yang seragam
  const MoneyIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return c.render(
    <div className="bg-transparent min-h-screen pb-10">
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan sirkulasi keuangan dan bonus Marketplace ShopinId.</p>
      </div>

      {/* GRID 4 KARTU STATISTIK (Sesuai Referensi Gambar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KARTU 1: Total Deposit (Penjualan) */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center space-x-5 transition-transform hover:-translate-y-1 duration-300">
           <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
             <MoneyIcon />
           </div>
           <div className="flex flex-col">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Deposit</span>
             <span className="text-2xl font-black text-gray-900 leading-none">Rp {(totalDeposit as number).toLocaleString('id-ID')}</span>
           </div>
        </div>

        {/* KARTU 2: Total Penarikan (Penjualan) */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center space-x-5 transition-transform hover:-translate-y-1 duration-300">
           <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
             <MoneyIcon />
           </div>
           <div className="flex flex-col">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Penarikan</span>
             <span className="text-2xl font-black text-gray-900 leading-none">Rp {(totalWithdrawal as number).toLocaleString('id-ID')}</span>
           </div>
        </div>

        {/* KARTU 3: Total Bonus Deposit */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center space-x-5 transition-transform hover:-translate-y-1 duration-300">
           <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
             <MoneyIcon />
           </div>
           <div className="flex flex-col">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Bonus Deposit</span>
             <span className="text-2xl font-black text-gray-900 leading-none">Rp {(totalBonusDeposit as number).toLocaleString('id-ID')}</span>
           </div>
        </div>

        {/* KARTU 4: Total Bonus Penarikan */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center space-x-5 transition-transform hover:-translate-y-1 duration-300">
           <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
             <MoneyIcon />
           </div>
           <div className="flex flex-col">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Bonus Penarikan</span>
             <span className="text-2xl font-black text-gray-900 leading-none">Rp {(totalBonusWithdrawal as number).toLocaleString('id-ID')}</span>
           </div>
        </div>

      </div>

      {/* Area Opsional untuk Konten Dasbor Lainnya di Masa Depan */}
      <div className="mt-10 bg-white p-8 rounded-md shadow-sm border border-gray-100 text-center">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pantauan Sistem Berjalan Normal</h3>
         <p className="text-xs text-gray-400 mt-2">Seluruh transaksi dompet dicatat secara *real-time* ke dalam buku besar (ledger) D1.</p>
      </div>

    </div>
  )
})
