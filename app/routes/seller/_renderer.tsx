import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f4f7fc]">
      {/* SIDEBAR SELLER */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black tracking-widest uppercase">Seller Area</h2>
        </div>
        <nav className="p-4 space-y-1">
          <a href="/seller" className="block py-3 px-4 rounded-sm text-xs font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors">Dasbor Utama</a>
          <a href="/seller/products" className="block py-3 px-4 rounded-sm text-xs font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors">Produk Saya</a>
          <a href="/seller/orders" className="block py-3 px-4 rounded-sm text-xs font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors">Pesanan</a>
          <a href="/seller/wallet" className="block py-3 px-4 rounded-sm text-xs font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors">Dompet Vendor</a>
          <a href="/seller/settings" className="block py-3 px-4 rounded-sm text-xs font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors">Pengaturan Toko</a>
          
          <div className="pt-6 mt-6 border-t border-gray-100">
             <a href="/" className="block py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black">← Kembali ke Mall</a>
          </div>
        </nav>
      </aside>

      {/* KONTEN HALAMAN */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
})
