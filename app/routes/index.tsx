import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // PERBAIKAN 1: Menggunakan 'display_order' sesuai skema tabel frontpage_widgets
  // Sekalian kita filter hanya untuk widget yang aktif (is_active = 1) di halaman utama ('home')
  const { results: widgets } = await db.prepare(
    "SELECT * FROM frontpage_widgets WHERE is_active = 1 AND page_id = 'home' ORDER BY display_order ASC"
  ).all()
  
  // Fungsi Pembangun Komponen Widget
  const renderWidget = async (widget: any) => {
    if (widget.widget_type === 'featured_products' || widget.widget_type === 'new_arrivals') {
      
      // PERBAIKAN 2: Mengambil ID produk dari dalam objek content_json
      const content = JSON.parse((widget.content_json as string) || '{}')
      const productIds = content.product_ids || []
      
      if (productIds.length === 0) return null

      // Ambil detail produk berdasarkan ID yang ada di widget
      const placeholders = productIds.map(() => '?').join(',')
      const { results: products } = await db.prepare(
        `SELECT id, slug, name, price, images_json, brand FROM products WHERE id IN (${placeholders})`
      ).bind(...productIds).all()

      return (
        <section key={widget.id} className="w-full bg-[#f4f7fc] py-12 px-4 md:px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">{widget.title}</h2>
              <a href="/products" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Lihat Semua &gt;</a>
            </div>
            
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
                        alt={product.name as string} 
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
                          {product.brand as string}
                        </span>
                      )}
                      <h3 className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-tight">
                        {product.name as string}
                      </h3>
                    </div>
                  </a>
                )
              })}
            </div>
            
          </div>
        </section>
      )
    }
    
    return null;
  }

  // Render seluruh widget berurutan
  const widgetElements = await Promise.all(widgets.map(w => renderWidget(w)))

  return c.render(
    <div className="bg-white min-h-screen">
      {widgetElements}
    </div>
  )
})
