import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title ? `${title} | Seller Center ShopinId` : 'Seller Center - ShopinId'}</title>
        
        {/* Tailwind CDN - Wajib ada karena ini override renderer utama */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#f4f7fc] font-sans text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          
          {/* MOBILE HEADER (Tampil hanya di HP) */}
          <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <h2 className="text-lg font-black tracking-widest uppercase">Seller Area</h2>
            <a href="/" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200 px-3 py-1.5 rounded-sm">
              Ke Mall
            </a>
          </div>

          {/* SIDEBAR SELLER (Desktop) */}
          <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block sticky top-0 h-screen overflow-y-auto">
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

          {/* KONTEN HALAMAN SELLER */}
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  )
})
