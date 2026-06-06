import { jsxRenderer } from 'hono/jsx-renderer';

export default jsxRenderer(async ({ children, title }, c) => {
  let footerData = { layout: '4', columns: [] };
  let headerData = { logo: '', favicon: '', show_search: true, show_cart: true, links: [] };
  
  try {
    // Ambil Global Header & Footer
    const { results } = await c.env.DB.prepare(
      "SELECT widget_type, content_json FROM frontpage_widgets WHERE page_id = 'GLOBAL' AND is_active = 1"
    ).all();
    
    results.forEach((w: any) => {
      if (w.widget_type === 'footer_widget') footerData = JSON.parse(w.content_json || '{"layout":"4","columns":[]}');
      if (w.widget_type === 'header_widget') headerData = JSON.parse(w.content_json || '{"logo":"","favicon":"","show_search":true,"show_cart":true,"links":[]}');
    });
  } catch (e) {
    console.log("Error fetching global widgets.");
  }

  const gridClass = footerData.layout === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Visoe Luxury | Authentic Luxury Goods'}</title>
        
        {/* FAVICON DINAMIS */}
        {headerData.favicon && <link rel="icon" href={headerData.favicon} />}
        
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
          .font-serif { font-family: 'Bodoni Moda', serif; }
          .tracking-widest-extra { letter-spacing: 0.3em; }
          
          .product-thumb-swiper .swiper-slide { width: 80px !important; height: 80px !important; }
          @media (max-width: 768px) { .product-thumb-swiper .swiper-slide { width: 65px !important; height: 65px !important; } }
          .swiper-button-next:after, .swiper-button-prev:after { font-size: 14px !important; font-weight: bold; }
        `}} />
      </head>
      <body class="bg-white text-gray-900 antialiased flex flex-col min-h-screen">
        
        <div class="bg-black text-white text-[9px] tracking-[0.2em] uppercase py-2 text-center font-bold relative z-[60]">
          Authenticity Guaranteed or 100% Money Back
        </div>

        {/* --- GLOBAL HEADER DINAMIS --- */}
        <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div class="max-w-[1200px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between relative">
            
            {/* KIRI: MOBILE MENU BUTTON & DESKTOP LINKS */}
            <div class="flex items-center">
              <button id="mobile-menu-btn" class="lg:hidden p-2 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <nav class="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
                {headerData.links?.map((lnk: any) => (
                  <a href={lnk.url} class="hover:text-neutral-400 transition">{lnk.name}</a>
                ))}
              </nav>
            </div>

            {/* TENGAH: LOGO DINAMIS ATAU TEKS */}
            <div class="flex-1 lg:flex-none text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex justify-center">
              <a href="/">
                {headerData.logo ? (
                  <img src={headerData.logo} alt="Store Logo" class="h-8 md:h-10 object-contain" />
                ) : (
                  <span class="font-serif text-2xl tracking-[0.4em] uppercase italic">Visoe<span class="font-light">Luxury</span></span>
                )}
              </a>
            </div>

            {/* KANAN: SEARCH & CART */}
            <div class="flex items-center gap-2 md:gap-4">
              {headerData.show_search && (
                <button onclick="document.getElementById('search-box').classList.toggle('hidden')" class="p-2 hover:text-neutral-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              )}
              {headerData.show_cart && (
                <button id="cart-toggle-btn" class="relative p-2 hover:text-neutral-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-width="1.2" /></svg>
                  <span id="cart-badge" class="absolute top-1 right-1 bg-black text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center opacity-0 transition-opacity">0</span>
                </button>
              )}
            </div>
          </div>

          {/* SEARCH DROPDOWN BOX */}
          <div id="search-box" class="hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 shadow-lg z-40">
            <form action="/products" method="GET" class="max-w-[800px] mx-auto flex items-center border-b border-black pb-2">
              <input type="text" name="q" placeholder="Search products, brands..." class="w-full text-sm outline-none bg-transparent uppercase tracking-widest placeholder:text-neutral-300" />
              <button type="submit" class="text-[9px] font-bold uppercase tracking-widest ml-4">Search</button>
            </form>
          </div>
        </header>

        {/* MOBILE MENU OVERLAY */}
        <div id="mobile-menu" class="fixed inset-0 bg-white z-[100] hidden flex-col">
          <div class="h-20 border-b border-gray-100 flex items-center justify-between px-4">
            <span class="font-serif text-xl tracking-[0.3em] uppercase italic">Menu</span>
            <button id="mobile-close-btn" class="p-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
            {headerData.links?.map((lnk: any) => (
              <a href={lnk.url} class="text-xs font-bold uppercase tracking-widest border-b border-neutral-100 pb-4">{lnk.name}</a>
            ))}
          </div>
        </div>
        {/* --- SELESAI: GLOBAL HEADER --- */}

        <main class="flex-grow">{children}</main>

        {/* --- GLOBAL FOOTER DINAMIS --- */}
        <footer class="bg-neutral-900 text-white pt-20 pb-10 mt-20 border-t-[6px] border-black">
          <div class="max-w-[1200px] mx-auto px-6 md:px-8">
            <div class={`grid grid-cols-1 ${gridClass} gap-12 md:gap-16 mb-16`}>
              {footerData.columns?.length > 0 ? footerData.columns.map((col: any) => (
                <div class="space-y-6">
                  {col.image && <img src={col.image} class="h-8 object-contain mb-4 invert brightness-0" alt="Footer Logo" />}
                  {col.title && <h4 class="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-100">{col.title}</h4>}
                  {col.text && <p class="text-[11px] text-neutral-400 leading-relaxed whitespace-pre-wrap">{col.text}</p>}
                  {col.links && col.links.length > 0 && (
                    <div class="flex flex-col space-y-4">
                      {col.links.map((lnk: any) => (
                        <a href={lnk.url} class="text-[10px] text-neutral-400 hover:text-white transition-colors uppercase tracking-[0.2em] block w-fit">{lnk.name}</a>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                 <div class="col-span-full text-center text-neutral-600 text-[10px] uppercase tracking-widest">
                    [ Footer Widget Unconfigured ]
                 </div>
              )}
            </div>
            <div class="border-t border-neutral-800 pt-8 text-center">
              <p class="text-[9px] text-neutral-500 uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} Visoe Luxury. All Rights Reserved.</p>
            </div>
          </div>
        </footer>

        {/* CART DRAWER & SCRIPTS (TETAP UTUH) */}
        <div id="cart-overlay" class="fixed inset-0 bg-black/40 z-[60] hidden"></div>
        <div id="cart-drawer" class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] translate-x-full transition-transform duration-500 flex flex-col shadow-2xl">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-[10px] font-bold tracking-[0.3em] uppercase">Shopping Bag</h2>
            <button id="cart-close-btn" class="p-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" stroke-width="1.5"/></svg></button>
          </div>
          <div id="cart-items" class="flex-1 overflow-y-auto p-6 space-y-6"></div>
          <div class="p-6 bg-gray-50 space-y-4">
            <div class="flex justify-between font-bold text-xs uppercase tracking-widest">
              <span>Subtotal</span><span id="cart-total">Rp 0</span>
            </div>
            <a href="/checkout" class="block w-full bg-black text-white py-4 text-center text-[10px] font-bold tracking-[0.3em] uppercase">Checkout</a>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          // Mobile Menu Toggle
          const mMenuBtn = document.getElementById('mobile-menu-btn');
          const mCloseBtn = document.getElementById('mobile-close-btn');
          const mMenu = document.getElementById('mobile-menu');
          if(mMenuBtn && mCloseBtn && mMenu) {
            mMenuBtn.onclick = () => { mMenu.classList.remove('hidden'); mMenu.classList.add('flex'); document.body.style.overflow = 'hidden'; };
            mCloseBtn.onclick = () => { mMenu.classList.add('hidden'); mMenu.classList.remove('flex'); document.body.style.overflow = ''; };
          }

          // Cart Logic
          window.visoeCart = JSON.parse(localStorage.getItem('visoe_cart')) || [];
          const fmtIDR = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
          
          window.updateCartUI = () => {
            const badge = document.getElementById('cart-badge');
            const items = document.getElementById('cart-items');
            const total = document.getElementById('cart-total');
            if(!badge || !items || !total) return;

            const qty = window.visoeCart.reduce((s, i) => s + i.quantity, 0);
            badge.textContent = qty; badge.style.opacity = qty > 0 ? '1' : '0';
            if (window.visoeCart.length === 0) items.innerHTML = '<p class="text-center py-10 text-[10px] text-neutral-400 uppercase tracking-widest">Bag is empty</p>';
            else items.innerHTML = window.visoeCart.map((item, idx) => \`
              <div class="flex gap-4">
                <img src="\${item.image}" class="w-16 h-20 object-cover bg-gray-50" />
                <div class="flex-1">
                  <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">\${item.brand}</p>
                  <h4 class="text-[10px] font-medium uppercase truncate">\${item.name}</h4>
                  <p class="text-[10px] font-bold mt-1">\${fmtIDR(item.price)}</p>
                  <div class="flex items-center gap-3 mt-2">
                    <button onclick="window.changeQty(\${idx}, -1)" class="w-5 h-5 border flex items-center justify-center">-</button>
                    <span class="text-[10px] font-bold">\${item.quantity}</span>
                    <button onclick="window.changeQty(\${idx}, 1)" class="w-5 h-5 border flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
            \`).join('');
            total.textContent = fmtIDR(window.visoeCart.reduce((s, i) => s + (i.price * i.quantity), 0));
          };

          window.addToCart = (p) => {
            const i = window.visoeCart.findIndex(it => it.id === p.id);
            if(i > -1) window.visoeCart[i].quantity += 1; else window.visoeCart.push({...p, quantity: 1});
            localStorage.setItem('visoe_cart', JSON.stringify(window.visoeCart));
            window.updateCartUI(); window.toggleCart(true);
          };

          window.changeQty = (idx, d) => {
            window.visoeCart[idx].quantity += d; if(window.visoeCart[idx].quantity <= 0) window.visoeCart.splice(idx, 1);
            localStorage.setItem('visoe_cart', JSON.stringify(window.visoeCart)); window.updateCartUI();
          };

          window.toggleCart = (open) => {
            const drawer = document.getElementById('cart-drawer'); const overlay = document.getElementById('cart-overlay');
            if(!drawer || !overlay) return;
            if(open) { overlay.classList.remove('hidden'); setTimeout(() => drawer.classList.remove('translate-x-full'), 10); } 
            else { drawer.classList.add('translate-x-full'); setTimeout(() => overlay.classList.add('hidden'), 500); }
          };

          const ctBtn = document.getElementById('cart-toggle-btn');
          const ccBtn = document.getElementById('cart-close-btn');
          const cOvr = document.getElementById('cart-overlay');
          if(ctBtn) ctBtn.onclick = () => window.toggleCart(true);
          if(ccBtn) ccBtn.onclick = () => window.toggleCart(false);
          if(cOvr) cOvr.onclick = () => window.toggleCart(false);
          
          document.addEventListener('DOMContentLoaded', window.updateCartUI);
        `}} />
      </body>
    </html>
  );
});