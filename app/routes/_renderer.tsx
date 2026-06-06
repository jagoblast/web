import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title ? `${title} | ShopinId` : 'ShopinId - Belanja Barang Mewah Autentik'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      {/* Tambahan pb-20 mutlak agar layar mobile bisa di-scroll sampai ujung tanpa tertutup menu */}
      <body className="bg-[#f4f7fc] min-h-screen flex flex-col font-sans text-gray-800 pb-20 md:pb-0 relative">
        
        {/* === HEADER DESKTOP & MOBILE === */}
        <header className="bg-black w-full text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex justify-between items-center w-full md:w-auto">
              <a href="/" className="flex-shrink-0 text-2xl font-black tracking-tighter md:mr-10">
                SHOPIN<span className="text-red-600">ID</span>
              </a>
            </div>
            
            <div className="flex-grow max-w-xl relative hidden md:block">
              <form action="/products" method="GET">
                <input type="text" name="q" placeholder="Saya Mencari..." className="w-full rounded-sm py-2 px-4 text-black text-sm focus:outline-none" />
              </form>
            </div>

            <div className="flex items-center space-x-6 ml-8 hidden md:flex text-sm font-medium">
              <a href="/account" className="hover:text-gray-300">Akun Saya</a>
              <a href="/checkout" className="hover:text-gray-300 bg-white/10 px-3 py-1.5 rounded-sm">Keranjang</a>
            </div>
          </div>
          
          <div className="md:hidden w-full px-4 pb-3 pt-2">
            <form action="/products" method="GET" className="relative">
              <input type="text" name="q" placeholder="Cari produk impian..." className="w-full rounded-sm py-2.5 px-4 text-black text-sm focus:outline-none" />
            </form>
          </div>
        </header>

        {/* === KONTEN HALAMAN === */}
        <main className="flex-grow w-full flex flex-col">
          {children}
        </main>

        {/* === STICKY MOBILE BOTTOM NAVIGATION (FIXED) === */}
        {/* z-[9999] memastikan menu ini selalu berada di lapisan paling atas */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[9999] flex justify-between items-center px-6 py-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <a href="/" className="flex flex-col items-center text-gray-500 hover:text-black">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] font-bold">Beranda</span>
          </a>
          <a href="/products" className="flex flex-col items-center text-gray-500 hover:text-black">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            <span className="text-[10px] font-bold">Katalog</span>
          </a>
          
          <a href="/seller" className="flex flex-col items-center text-red-600">
            <div className="bg-red-50 p-3 rounded-full -mt-8 border border-red-100 shadow-md bg-white">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <span className="text-[10px] font-bold mt-1">Vendor</span>
          </a>
          
          <a href="/checkout" className="flex flex-col items-center text-gray-500 hover:text-black relative">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="text-[10px] font-bold">Cart</span>
          </a>
          <a href="/account" className="flex flex-col items-center text-gray-500 hover:text-black">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] font-bold">Akun</span>
          </a>
        </div>

      </body>
    </html>
  )
})
