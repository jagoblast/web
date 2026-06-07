import { createRoute } from 'honox/factory'
import { getAuthUser } from '../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  
  const { results: widgets } = await db.prepare(
    "SELECT * FROM frontpage_widgets WHERE is_active = 1 AND page_id = 'home' ORDER BY display_order ASC"
  ).all()
  
  const renderWidget = async (widget: any) => {
    const content = JSON.parse((widget.content_json as string) || '{}')

    if (widget.widget_type === 'hero_slider') {
      const slides = content.slides || []
      if (slides.length === 0) return null
      
      return (
        <section key={widget.id} className="w-full bg-gray-100 relative group overflow-hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {slides.map((slide: any, idx: number) => (
              <a key={idx} href={slide.link} className="flex-none w-full snap-center relative block">
                <div className="w-full h-[300px] md:h-[500px] lg:h-[600px] bg-gray-200">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" loading={idx === 0 ? "eager" : "lazy"} />
                </div>
              </a>
            ))}
          </div>
        </section>
      )
    }

    if (widget.widget_type === 'icon_nav') {
      const items = content.items || []
      if (items.length === 0) return null

      return (
        <section key={widget.id} className="w-full bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 md:justify-center min-w-max pb-2">
              {items.map((item: any, idx: number) => (
                <a key={idx} href={item.link} className="flex flex-col items-center group w-20 md:w-24">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white overflow-hidden border border-gray-200 group-hover:border-black group-hover:shadow-md transition-all p-3">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-gray-800 mt-3 text-center uppercase tracking-wider group-hover:text-black">
                    {item.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    }

    if (widget.widget_type === 'promo_banner') {
      const promos = content.promos || []
      if (promos.length === 0) return null

      return (
        <section key={widget.id} className="w-full bg-white py-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map((promo: any, idx: number) => (
              <a key={idx} href={promo.link} className="group relative block overflow-hidden bg-gray-100 rounded-sm">
                <div className="aspect-[16/9] md:aspect-[4/3] w-full">
                  <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all flex flex-col items-center justify-center text-white p-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2 drop-shadow-md">{promo.title}</h3>
                  {promo.subtitle && <p className="text-sm font-medium mb-4 drop-shadow-md">{promo.subtitle}</p>}
                  <span className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest group-hover:bg-gray-200 transition-colors">
                    {promo.button_text || 'Belanja Sekarang'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )
    }

    if (widget.widget_type === 'featured_products' || widget.widget_type === 'new_arrivals') {
      const productIds = content.product_ids || []
      if (productIds.length === 0) return null

      const placeholders = productIds.map(() => '?').join(',')
      let products = []
      
      if (user) {
        const { results } = await db.prepare(`
          SELECT p.id, p.slug, p.name, p.price, p.images_json, p.brand, 
                 CASE WHEN w.product_id IS NOT NULL THEN 1 ELSE 0 END as is_wishlisted
          FROM products p
          LEFT JOIN wishlists w ON p.id = w.product_id AND w.user_id = ?
          WHERE p.id IN (${placeholders})
        `).bind(user.id, ...productIds).all()
        products = results
      } else {
        const { results } = await db.prepare(`
          SELECT id, slug, name, price, images_json, brand, 0 as is_wishlisted
          FROM products 
          WHERE id IN (${placeholders})
        `).bind(...productIds).all()
        products = results
      }

      return (
        <section key={widget.id} className="w-full bg-[#f4f7fc] py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">{widget.title}</h2>
              <a href="/products" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors uppercase tracking-widest">Lihat Semua</a>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((product: any) => {
                const images = JSON.parse((product.images_json as string) || '[]')
                const mainImage = images[0] || '/placeholder.jpg'

                return (
                  <a 
                    key={product.id} 
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-gray-100 relative"
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); fetch(`/api/wishlist/toggle?product_id=${product.id}`, {method: 'POST'}) }} 
                        className="p-1.5 bg-white/80 rounded-full hover:bg-white shadow-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={product.is_wishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-5 h-5 ${product.is_wishlisted ? 'text-red-500' : 'text-gray-400'}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                      </button>
                    </div>

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
                      <div className="flex text-amber-400 text-[10px] md:text-xs mb-2">★★★★★</div>
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

  const widgetElements = await Promise.all(widgets.map(w => renderWidget(w)))

  return c.render(
    <div className="bg-white min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
      {widgetElements}
    </div>
  )
})
