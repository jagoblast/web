import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} | ShopinId` : 'ShopinId - Belanja Barang Mewah Autentik'}</title>
        
        {/* Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#f4f7fc] min-h-screen flex flex-col font-sans text-gray-800">
        
        {/* === TOPBAR === */}
        <div className="bg-[#f8f8f8] w-full border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8 text-[11px] md:text-xs text-gray-500">
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-800">
              <span className="text-red-600 font-bold">ID</span>
              <span>Bahasa Indonesia</span>
            </div>
            <div className="flex space-x-4 font-medium">
              <a href="/login" className="hover:text-black">Masuk</a>
              <a href="/register" className="hover:text-black">Daftar</a>
            </div>
          </div>
        </div>

        {/* === HEADER UTAMA & NAVIGASI === */}
        <header className="bg-black w-full text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between">
            
            {/* Logo & Mobile Menu Button */}
            <div className="flex justify-between items-center w-full md:w-auto mb-4 md:mb-0">
              <a href="/" className="flex-shrink-0 text-2xl font-black tracking-tighter md:mr-10">
                SHOPIN<span className="text-red-600">ID</span>
              </a>
            </div>

            {/* Menu Navigasi Kategori (Terlihat di Desktop) */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold mr-6 flex-shrink-0">
              <a href="/products" className="hover:text-gray-300 transition-colors">Semua Produk</a>
              <a href="/products?category=bags" className="hover:text-gray-300 transition-colors">Tas</a>
              <a href="/products?category=shoes" className="hover:text-gray-300 transition-colors">Sepatu</a>
              <a href="/products?category=accessories" className="hover:text-gray-300 transition-colors">Aksesoris</a>
            </nav>
            
            {/* Bar Pencarian */}
            <div className="flex-grow max-w-xl relative hidden md:block">
              <form action="/products" method="GET">
                <input 
                  type="text" 
                  name="q"
                  placeholder="Saya Mencari..." 
                  className="w-full rounded-sm py-2 px-4 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="absolute right-3 top-2 text-gray-500 hover:text-black">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </form>
            </div>

            {/* Ikon Aksi Kanan (Akun & Keranjang) */}
            <div className="flex items-center space-x-6 ml-8 hidden md:flex text-sm font-medium">
              <a href="/account" className="flex items-center hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Akun Saya
              </a>
              <a href="/checkout" className="flex items-center hover:text-gray-300 transition-colors bg-white/10 px-3 py-1.5 rounded-sm">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Keranjang
              </a>
            </div>
          </div>

          {/* Navigasi Mobile Bawah (Muncul hanya di layar kecil) */}
          <div className="md:hidden flex justify-between px-4 pb-4">
            <div className="relative w-full mr-2">
              <form action="/products" method="GET">
                <input 
                  type="text" 
                  name="q"
                  placeholder="Cari..." 
                  className="w-full rounded-sm py-2 px-3 text-black text-sm focus:outline-none"
                />
              </form>
            </div>
            <a href="/checkout" className="bg-white text-black p-2 rounded-sm flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </a>
          </div>
        </header>

        {/* === KONTEN HALAMAN === */}
        <main className="flex-grow w-full flex flex-col">
          {children}
        </main>

        {/* === FOOTER === */}
        <footer className="bg-black text-white py-12 mt-auto w-full border-t-4 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-black tracking-tighter mb-4">SHOPIN<span className="text-red-600">ID</span></div>
              <p className="text-xs text-gray-400 mb-6">Belanja cerdas, gaya tanpa batas. Solusi e-commerce terpercaya Anda.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Informasi Kontak</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong>Alamat:</strong><br/>
                Intiland Tower Jl.Raya Darmo No.88<br/>
                Surabaya, Jawa Timur 60226, Indonesia<br/><br/>
                <strong>Email:</strong> cs@shopinid.com
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Metode Pembayaran</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white h-8 rounded-sm text-black flex items-center justify-center text-[10px] font-bold">BCA</div>
                <div className="bg-white h-8 rounded-sm text-black flex items-center justify-center text-[10px] font-bold">MANDIRI</div>
                <div className="bg-white h-8 rounded-sm text-black flex items-center justify-center text-[10px] font-bold">BNI</div>
                <div className="bg-white h-8 rounded-sm text-black flex items-center justify-center text-[10px] font-bold">QRIS</div>
                <div className="bg-white h-8 rounded-sm text-black flex items-center justify-center text-[10px] font-bold">OVO</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Jelajahi</h4>
              <ul className="text-xs text-gray-400 space-y-2">
                <li><a href="/login" className="hover:text-white transition-colors">Masuk Akun</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Daftar Pengguna Baru</a></li>
                <li><a href="/account" className="hover:text-white transition-colors">Riwayat & Lacak Pesanan</a></li>
                <li><a href="/products" className="hover:text-white transition-colors">Katalog Produk</a></li>
              </ul>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
})
