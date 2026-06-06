import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} | Admin ShopinId` : 'Admin Dashboard - ShopinId'}</title>
        
        {/* Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-100 min-h-screen font-sans flex text-gray-900">
        
        {/* === SIDEBAR MENU ADMIN === */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col flex-shrink-0">
          <div className="p-6 text-center border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-tight text-white">SHOPIN<span className="text-red-500">ID</span></h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Panel</p>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Menu Utama</p>
            <a href="/admin" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Dashboard</a>
            <a href="/admin/orders" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Kelola Pesanan</a>
            
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Katalog</p>
            <a href="/admin/products" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Daftar Produk</a>
            <a href="/admin/categories" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Kategori</a>
            
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Tampilan & Sistem</p>
            <a href="/admin/page-builder" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Page Builder</a>
            <a href="/admin/pages" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Halaman Statis</a>
            <a href="/admin/media" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Media Library</a>
            <a href="/admin/settings" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Pengaturan Toko</a>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <a href="/" target="_blank" className="block w-full text-center px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700 transition-colors">
              Lihat Website ↗
            </a>
          </div>
        </aside>

        {/* === MAIN CONTENT AREA === */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-semibold text-gray-800">{title || 'Dashboard'}</h2>
            <div className="flex items-center space-x-4">
               <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Mode Admin</span>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {children}
          </div>
        </main>

      </body>
    </html>
  )
})
