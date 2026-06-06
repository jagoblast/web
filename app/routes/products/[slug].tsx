import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const slug = c.req.param('slug')
  
  const product = await db.prepare("SELECT * FROM products WHERE slug = ?").bind(slug).first()
  if (!product) return c.redirect('/products')

  const images = JSON.parse((product.images_json as string) || '[]')
  const mainImage = images[0] || '/placeholder.jpg'

  return c.render(
    <div className="w-full bg-[#f4f7fc] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Kolom Atas: Gambar dan Aksi */}
        <div className="bg-white p-6 md:p-10 rounded-sm shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Kiri: Gambar Produk Utama */}
          <div className="bg-gray-50 flex items-center justify-center p-4 border border-gray-100 relative aspect-square">
            <img src={mainImage} alt={product.name as string} className="object-contain w-full h-full max-h-[500px]" />
          </div>

          {/* Kanan: Detail & Aksi */}
          <div className="flex flex-col pt-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>
            <div className="flex text-amber-400 text-sm mb-4">
              ★★★★★ <span className="text-gray-400 ml-2 text-xs">(120 Ulasan)</span>
            </div>

            <div className="border-t border-b py-4 my-4 border-gray-100">
              <span className="text-sm text-gray-500 mr-4">Dijual oleh:</span>
              <span className="bg-pink-100 text-pink-700 px-3 py-1 text-xs rounded-full font-bold">ShopinId Official</span>
            </div>

            <div className="mb-6 flex items-end">
              <span className="text-sm text-gray-500 mr-6 mb-1">Harga:</span>
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                Rp {(product.price as number).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center mb-8">
               <span className="text-sm text-gray-500 mr-6">Kuantitas:</span>
               <div className="flex items-center border border-gray-300 rounded-md">
                 <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600">-</button>
                 <input type="text" value="1" readOnly className="w-12 text-center text-sm font-bold border-l border-r border-gray-300 py-1" />
                 <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600">+</button>
               </div>
               <span className="text-xs text-gray-400 ml-4">({product.stock} Tersedia)</span>
            </div>

            <div className="flex space-x-4 mt-auto">
              {/* Note: Logic tambah ke cart JS perlu diimplementasikan di client.ts */}
              <button 
                data-id={product.id}
                data-price={product.price}
                data-name={product.name}
                className="add-to-cart-btn flex-1 bg-pink-100 text-pink-700 font-bold py-3 px-4 rounded hover:bg-pink-200 transition-colors border border-pink-200"
              >
                Tambah ke Keranjang
              </button>
              <button className="flex-1 bg-black text-white font-bold py-3 px-4 rounded hover:bg-gray-800 transition-colors uppercase tracking-wide">
                Beli Sekarang
              </button>
            </div>
            
            <div className="mt-8 border-t border-gray-100 pt-4 flex flex-col space-y-2">
              <p className="text-xs text-gray-500 flex items-center">
                <span className="text-green-500 mr-2">🛡️</span> Pengembalian Dana: 30 Days Cash Back Guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Tab Deskripsi Bawah */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            <button className="px-8 py-4 font-bold text-black border-b-2 border-black">Deskripsi</button>
            <button className="px-8 py-4 font-medium text-gray-500 hover:text-black">Ulasan</button>
          </div>
          <div className="p-8 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || "Belum ada deskripsi untuk produk ini."}
          </div>
        </div>

      </div>
    </div>
  )
})
