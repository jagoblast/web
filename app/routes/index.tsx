import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  // Ambil parameter halaman aktif untuk paginasi widget (default halaman 1)
  const currentPage = parseInt(c.req.query('page') || '1', 10)

  // Mengambil semua widget aktif khusus halaman beranda
  const { results: widgets } = await db.prepare(
    "SELECT * FROM frontpage_widgets WHERE is_active = 1 AND page_id = 'home' ORDER BY display_order ASC"
  ).all()
  
  // Fungsi Pembangun Komponen Widget Dinamis
  const renderWidget = async (widget: any) => {
    const content = JSON.parse((widget.content_json as string) || '{}')

    // ==========================================
    // 1. WIDGET BARU: ALL PRODUCTS GRID (DENGAN PAGINASI BULAT)
    // ==========================================
    if (widget.widget_type === 'all_products_grid') {
      const perPage = content.per_page || 10 // Jumlah produk per halaman (bisa diatur dari json)
      const offset = (currentPage - 1) * perPage

      // Hitung total seluruh produk aktif untuk kalkulasi jumlah bulatan halaman
      const totalRow = await db.prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1").first()
      const totalProducts = (totalRow?.count as number) || 0
      const totalPages = Math.ceil(totalProducts / perPage)

      // Ambil data produk secara paginasi teratur
      const { results: products } = await db.prepare(`
        SELECT p.id, p.slug, p.name, p.price, p.images_json, p.brand, s.name as store_name
        FROM products p
        LEFT JOIN stores s ON p.store_id = s.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `).bind(perPage, offset).all()

      if (products.length === 0) return null

      return (
        <section key={widget.id} className="w-full bg-white py-12 md:py-16 px-4 md:px-8 border-b border-gray-50">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Widget */}
            <div className="flex flex-col items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-widest mb-2 text-center">
                {widget.title || 'Semua Produk Kami'}
              </h2>
              {content.description && (
                <p className="text-sm text-gray-500 text-center max-w-2xl">{content.description}</p>
              )}
            </div>

            {/* Grid Produk Tanpa Frame Premium */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
              {products.map((product: any) => {
                let images = []
                try { images = JSON.parse(product.images_json || '[]') } catch(e) {}
                const mainImage = images[0] || '/placeholder.jpg'

                return (
                  <a key={product.id} href={`/products/${product.slug}`} className="group flex flex-col">
                    <div className="w-full aspect-[3/4] bg-gray-100 relative overflow-hidden mb-3">
                      <img src={mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      <div className="absolute top-2 left-2 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-widest text-black shadow-sm">
                        {product.brand}
                      </div>
                    </div>
                    <div className="flex flex-col px-1">
                      <span className="text-[11px] font-black text-gray-900 mb-1 uppercase tracking-widest line-clamp-1">
                        {product.store_name || 'SHOPINID DIRECT'}
                      </span>
                      <h3 className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2 h-8">
                        {product.name}
                      </h3>
                      <span className="text-sm font-bold text-gray-900 tracking-tight">
                        Rp {(product.price as number).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* KOMPONEN PAGINASI BULAT ALA HALAMAN PRODUCTS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-16">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1
                  const isCurrent = pageNum === currentPage

                  return (
                    <a
                      key={pageNum}
                      href={`/?page=${pageNum}`}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        isCurrent 
                          ? 'bg-black text-white border-black shadow-md scale-105' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
                      }`}
                    >
                      {pageNum}
                    </a>
                  )
                })}
              </div>
            )}
            
          </div>
        </section>
      )
    }

    // 2. WIDGET: HERO SLIDER
    if (widget.widget_type === 'hero_slider') {
      const slides = content.slides || []
      if (slides.length === 0) return null
      return (
        <section key={widget.id} className="w-full bg-gray-100 relative overflow-hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {slides.map((slide: any, idx: number) => (
              <a key={idx} href={slide.link} className="flex-none w-full snap-center relative block">
                <div className="w-full h-[400px] md:h-[500px] lg:h-[650px] bg-gray-200">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" loading={idx === 0 ? "eager" : "lazy"} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-widest drop-shadow-lg text-center px-4">
                      {slide.title}
                   </h2>
                </div>
              </a>
            ))}
          </div>
        </section>
      )
    }

    // 3. WIDGET: ICON NAV
    if (widget.widget_type === 'icon_nav') {
      const items = content.items || []
      if (items.length === 0) return null
      return (
        <section key={widget.id} className="w-full bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 md:justify-center min-w-max pb-2">
              {items.map((item: any, idx: number) => (
                <a key={idx} href={item.link} className="flex flex-col items-center group w-20 md:w-28">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-50 overflow-hidden border border-gray-200 group-hover:border-black transition-all p-4">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-gray-800 mt-3 text-center uppercase tracking-wider">
                    {item.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    }

    // 4. WIDGET: PROMO BANNER
    if (widget.widget_type === 'promo_banner') {
      const promos = content.promos || []
      if (promos.length === 0) return null
      return (
        <section key={widget.id} className="w-full bg-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {promos.map((promo: any, idx: number) => (
              <a key={idx} href={promo.link} className="group relative block overflow-hidden bg-gray-100 rounded-sm">
                <div className="aspect-[4/5] md:aspect-[4/3] w-full">
                  <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3">{promo.title}</h3>
                  {promo.subtitle && <p className="text-sm font-medium mb-6 max-w-sm">{promo.subtitle}</p>}
                  <span className="bg-white text-black px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm">
                    {promo.button_text || 'SHOP NOW'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )
    }

    // 5. WIDGET: FEATURED PRODUCTS
    if (widget.widget_type === 'featured_products' || widget.widget_type === 'new_arrivals') {
      const productIds = content.product_ids || []
      if (productIds.length === 0) return null
      const placeholders = productIds.map(() => '?').join(',')
      
      const { results: products } = await db.prepare(
        `SELECT p.id, p.slug, p.name, p.price, p.images_json, p.brand, s.name as store_name
         FROM products p
         LEFT JOIN stores s ON p.store_id = s.id
         WHERE p.id IN (${placeholders})`
      ).bind(...productIds).all()

      return (
        <section key={widget.id} className="w-full bg-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-widest mb-3">{widget.title}</h2>
              <a href="/products" className="text-xs font-bold text-gray-900 border-b-2 border-black pb-1 uppercase tracking-widest">
                {content.button_text || 'Lihat Semua Koleksi'}
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
              {products.map((product: any) => {
                let images = []
                try { images = JSON.parse(product.images_json || '[]') } catch(e) {}
                const mainImage = images[0] || '/placeholder.jpg'
                return (
                  <a key={product.id} href={`/products/${product.slug}`} className="group flex flex-col">
                    <div className="w-full aspect-[3/4] bg-gray-100 relative overflow-hidden mb-3">
                      <img src={mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex flex-col px-1">
                      <span className="text-[11px] font-black text-gray-900 mb-1 uppercase tracking-widest">{product.store_name || 'SHOPINID DIRECT'}</span>
                      <h3 className="text-xs text-gray-500 line-clamp-2 mb-2 h-8">{product.name}</h3>
                      <span className="text-sm font-bold text-gray-900">Rp {(product.price as number).toLocaleString('id-ID')}</span>
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

  const widgetElements = await Promise.all(widgets.map(w => renderWidget(w)))

  return c.render(
    <div className="bg-white min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      {widgetElements}
    </div>
  )
})
