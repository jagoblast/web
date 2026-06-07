// app/routes/seller/_renderer.tsx
import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html>
      <head>
        <title>{title ? `${title} - Seller Center` : 'Seller Center'}</title>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-50 flex">
        {/* Sidebar Navigasi Seller */}
        <aside class="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <div class="mb-8">
            <h2 class="text-xl font-bold">Seller Center</h2>
          </div>
          <nav class="space-y-2">
            <a href="/seller" class="block py-2 px-4 rounded hover:bg-gray-100">Dashboard</a>
            <a href="/seller/products" class="block py-2 px-4 rounded hover:bg-gray-100">Produk Saya</a>
            <a href="/seller/orders" class="block py-2 px-4 rounded hover:bg-gray-100">Pesanan</a>
            <a href="/seller/wallet" class="block py-2 px-4 rounded hover:bg-gray-100">Dompet Vendor</a>
            <a href="/seller/settings" class="block py-2 px-4 rounded hover:bg-gray-100">Pengaturan Toko</a>
            {/* Link kembali ke halaman utama pembeli */}
            <a href="/" class="block mt-8 py-2 px-4 text-sm text-gray-500 hover:text-black">Kembali ke Mall</a>
          </nav>
        </aside>

        {/* Area Konten Utama */}
        <main class="flex-1 p-8">
          {children}
        </main>
      </body>
    </html>
  )
})
