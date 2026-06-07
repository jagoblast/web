import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} | Admin ShopinId` : 'Admin Dashboard - ShopinId Marketplace'}</title>
        
        {/* Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-100 min-h-screen font-sans flex text-gray-900">
        
        {/* === SIDEBAR MENU ADMIN (DIPERBARUI UNTUK MARKETPLACE) === */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col flex-shrink-0 sticky top-0 h-screen">
          <div className="p-6 text-center border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-tight text-white">SHOPIN<span className="text-red-500">ID</span></h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Marketplace Admin</p>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Utama</p>
            <a href="/admin" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Dashboard Utama</a>
            <a href="/admin/orders" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Semua Pesanan</a>
            
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Manajemen Entitas</p>
            <a href="/admin/users" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Kelola Pengguna</a>
            <a href="/admin/stores" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Kelola Toko (Vendor)</a>
            <a href="/admin/finance" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Keuangan & Saldo</a>

            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Katalog Global</p>
            <a href="/admin/products" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Daftar Produk</a>
            <a href="/admin/categories" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Kategori Produk</a>
            
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Tampilan & Sistem</p>
            <a href="/admin/page-builder" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Page Builder (Widget)</a>
            <a href="/admin/pages" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Halaman Statis</a>
            <a href="/admin/media" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Media Library</a>
            <a href="/admin/settings" className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Pengaturan Platform</a>
            
          </nav>

          <div className="p-4 border-t border-gray-800">
            <a href="/" target="_blank" className="block w-full text-center px-4 py-2 bg-gray-800 rounded text-sm font-bold text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              Lihat Website ↗
            </a>
          </div>
        </aside>

        {/* === MAIN CONTENT AREA === */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          
          {/* Header Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10 sticky top-0">
            <h2 className="text-xl font-bold text-gray-800">{title || 'Dashboard'}</h2>
            <div className="flex items-center space-x-4">
               <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Super Admin</span>
               <form action="/logout" method="POST" className="m-0 p-0">
                  <button type="submit" className="text-sm font-medium text-gray-500 hover:text-black">Keluar</button>
               </form>
            </div>
          </header>
          
          {/* Area Konten dengan Pembatasan Lebar Seragam */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>

        </main>

        <style dangerouslySetInnerHTML={{__html: `
          /* Opsional: Membuat scrollbar sidebar lebih tipis dan elegan */
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #4B5563; }
        `}} />

      </body>
    </html>
  )
})
