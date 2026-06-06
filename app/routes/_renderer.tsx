import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} | ShopinId` : 'ShopinId - E-Commerce'}</title>
        {/* Pastikan Tailwind CSS sudah ter-build dan di-link di sini */}
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body className="bg-[#f4f7fc] min-h-screen flex flex-col font-sans text-gray-800">
        
        {/* Topbar Terang (Bahasa & Auth) */}
        <div className="bg-[#f8f8f8] w-full border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8 text-[11px] md:text-xs text-gray-500">
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-800">
              <span className="text-red-600 font-bold">ID</span>
              <span>Bahasa Indonesia v</span>
            </div>
            <div className="flex space-x-3">
              <a href="/login" className="hover:text-black">Masuk</a>
              <a href="/register" className="hover:text-black">Daftar</a>
            </div>
          </div>
        </div>

        {/* Header Hitam Utama (Identitas ShopinId) */}
        <header className="bg-black w-full text-white">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* Logo ShopinId */}
            <a href="/" className="flex-shrink-0 text-2xl font-black tracking-tighter mr-8">
              SHOPIN<span className="text-red-600">ID</span>
            </a>

            {/* Navigasi & Pencarian */}
            <div className="flex-grow flex items-center">
              <div className="hidden md:flex items-center text-sm font-semibold mr-6 cursor-pointer hover:text-gray-300">
                Kategori <span className="ml-1 text-xs">v</span>
              </div>
              
              {/* Bar Pencarian */}
              <div className="flex-grow max-w-2xl relative">
                <input 
                  type="text" 
                  placeholder="Saya Mencari..." 
                  className="w-full rounded-full py-2 px-5 text-black text-sm focus:outline-none"
                />
                <button className="absolute right-3 top-1.5 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>

            {/* Ikon Aksi Kanan */}
            <div className="flex items-center space-x-6 ml-8 hidden md:flex text-sm">
              <a href="/account" className="flex items-center hover:text-gray-300">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Akun Saya
              </a>
              <a href="/checkout" className="flex items-center hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </a>
              <a href="#" className="flex items-center hover:text-gray-300">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Layanan
              </a>
            </div>
            
          </div>
        </header>

        {/* Konten Utama Halaman (Diinjeksi di sini) */}
        <main className="flex-grow flex flex-col items-center w-full">
          {children}
        </main>

        {/* Footer Hitam Ala ASOS */}
        <footer className="bg-black text-white py-12 mt-12 w-full">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-black tracking-tighter mb-4">SHOPIN<span className="text-red-600">ID</span></div>
              <p className="text-xs text-gray-400">Belanja cerdas, gaya tanpa batas.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Informasi Kontak</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Alamat:<br/>
                Intiland Tower Jl.Raya Darmo No.88<br/>
                Surabaya, Jawa Timur 60226, Indonesia<br/><br/>
                Email: cs@shopinid.com
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Metode Pembayaran</h4>
              {/* Simulasi Logo Bank */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white h-6 rounded-sm"></div>
                <div className="bg-white h-6 rounded-sm"></div>
                <div className="bg-white h-6 rounded-sm"></div>
                <div className="bg-white h-6 rounded-sm"></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Akun Saya</h4>
              <ul className="text-xs text-gray-400 space-y-2">
                <li><a href="/login" className="hover:text-white">Masuk</a></li>
                <li><a href="#" className="hover:text-white">Daftar Keinginan Saya</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
})
