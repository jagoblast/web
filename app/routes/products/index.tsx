import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Ambil semua produk (Bisa dikembangkan dengan pagination backend nanti)
  const { results: products } = await db.prepare("SELECT * FROM products ORDER BY created_at DESC").all()

  return c.render(
    <div className="w-full bg-[#f4f7fc] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Semua Produk</h1>
          <p className="text-sm text-gray-500">Menampilkan {products.length} item dari koleksi ShopinId.</p>
        </div>

        {/* Grid Produk Responsif */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product: any) => {
            const images = JSON.parse((product.images_json as string) || '[]')
            const mainImage = images[0] || '/placeholder.jpg'

            return (
              <a 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="group bg-white rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="w-full aspect-square bg-white relative overflow-hidden flex items-center justify-center p-2">
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-4 flex flex-col flex-grow bg-white border-t border-gray-50">
                  <span className="text-[15px] md:text-[17px] font-bold text-gray-900 mb-1 block tracking-tight">
                    Rp {(product.price as number).toLocaleString('id-ID')}
                  </span>
                  <div className="flex text-amber-400 text-[10px] md:text-xs mb-2">
                    ★★★★★
                  </div>
                  {product.brand && (
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      {product.brand}
                    </span>
                  )}
                  <h3 className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </div>
              </a>
            )
          })}
        </div>

        {/* Simulasi Pagination Bawah */}
        <div className="flex justify-center items-center mt-12 space-x-2">
           <button className="w-10 h-10 rounded-full bg-black text-white text-sm font-bold">1</button>
           <button className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-600 text-sm hover:bg-gray-100">2</button>
           <button className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-600 text-sm hover:bg-gray-100">3</button>
           <span className="text-gray-400 px-2">...</span>
           <button className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-600 text-sm hover:bg-gray-100">20</button>
        </div>

      </div>
    </div>
  )
})
