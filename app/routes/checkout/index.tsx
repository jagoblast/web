import { createRoute } from 'honox/factory';
import { getAuthUser } from '../../utils/auth';

export default createRoute(async (c) => {
  const db = c.env.DB;
  const userAuth = await getAuthUser(c);
  let userData: any = null;

  if (userAuth && userAuth.role === 'customer') {
    userData = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userAuth.id).first();
  }

  let siteTitle = 'Visoe Luxury';
  let headerData: any = {};
  let footerData: any = {};
  
  try {
    const storeSettingsRow: any = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first();
    if (storeSettingsRow && storeSettingsRow.config_json) siteTitle = JSON.parse(storeSettingsRow.config_json).site_title || 'Visoe Luxury';
    const headerRow: any = await db.prepare("SELECT content_json FROM frontpage_widgets WHERE widget_type = 'header_widget' AND is_active = 1 ORDER BY id DESC LIMIT 1").first();
    const footerRow: any = await db.prepare("SELECT content_json FROM frontpage_widgets WHERE widget_type = 'footer_widget' AND is_active = 1 ORDER BY id DESC LIMIT 1").first();
    headerData = headerRow ? JSON.parse(headerRow.content_json || '{}') : {};
    footerData = footerRow ? JSON.parse(footerRow.content_json || '{}') : {};
  } catch(e) {}

  return c.html(
    <html lang="id">
      <head>
        <title>Checkout | {siteTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; background: #fafafa; margin: 0; }
          .font-serif { font-family: 'Bodoni Moda', serif; }
        `}} />
      </head>
      <body class="flex flex-col min-h-screen">
        
        <header class="w-full bg-white z-[100] relative border-b border-neutral-100">
            <div class="max-w-[1200px] mx-auto px-6 py-6 flex justify-between items-center">
              <a href="/"><img src={headerData.logo_desktop || headerData.logo || '/logo.png'} style={{ width: '150px' }} class="object-contain" alt={siteTitle} /></a>
              <a href="/products" class="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-neutral-500">Cancel & Return</a>
            </div>
        </header>

        <main class="flex-1 max-w-[1200px] mx-auto px-6 py-16 w-full">
          <h1 class="text-3xl font-serif italic uppercase tracking-widest mb-10 border-b border-neutral-100 pb-6">Secure Checkout</h1>
          
          <div class="flex flex-col lg:flex-row gap-16 items-start">
            <div class="lg:w-2/3 w-full bg-white p-10 border border-neutral-100 shadow-sm">
              <h2 class="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-neutral-50 pb-4">Shipping Information</h2>
              
              {!userData && (
                <div class="mb-8 p-4 bg-neutral-50 border border-neutral-100 flex justify-between items-center">
                   <span class="text-[10px] font-bold uppercase tracking-widest opacity-50">Already have an account?</span>
                   <a href="/login" class="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-6 py-2">Sign In</a>
                </div>
              )}

              <form id="checkout-form" method="POST" action="/checkout/process" class="space-y-6">
                <input type="hidden" name="cart_data" id="cart_data_input" />
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Full Name</label><input type="text" name="name" value={userData?.name || ''} required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" /></div>
                  <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Phone Number</label><input type="text" name="phone" value={userData?.phone || ''} required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" /></div>
                </div>
                <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Email Address</label><input type="email" name="email" value={userData?.email || ''} required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" /></div>
                <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Delivery Address</label><textarea name="address" required rows={4} class="w-full border border-neutral-200 p-4 outline-none focus:border-black transition text-sm bg-transparent">{userData?.address || ''}</textarea></div>
                
                <div class="pt-8 mt-8 border-t border-neutral-100">
                   <h2 class="text-[11px] font-bold uppercase tracking-[0.3em] mb-6">Payment Method</h2>
                   <div class="border border-black p-4 bg-neutral-50 flex items-center gap-4">
                      <div class="w-4 h-4 rounded-full border-4 border-black bg-white flex-shrink-0"></div>
                      <div>
                        <span class="block text-[10px] font-bold uppercase tracking-widest">Credit Card / Full Payment</span>
                        <span class="block text-[9px] text-neutral-400 uppercase tracking-widest mt-1">Processed securely via 101payasia</span>
                      </div>
                   </div>
                </div>

                <button type="submit" id="submit-btn" class="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-neutral-800 transition mt-10">Proceed to Payment</button>
              </form>
            </div>

            <div class="lg:w-1/3 w-full bg-neutral-50 p-10 border border-neutral-100 sticky top-10">
              <h2 class="text-[11px] font-bold uppercase tracking-[0.3em] mb-8">Order Summary</h2>
              <ul id="checkout-items" class="space-y-6 mb-8 border-b border-neutral-200 pb-8"></ul>
              <div class="flex justify-between items-center text-xl font-serif italic font-bold">
                 <span>Total</span><span id="checkout-total">Rp 0</span>
              </div>
            </div>
          </div>
        </main>

        <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-16 px-6 mt-auto">
            <div class="max-w-[1200px] mx-auto flex justify-between items-center"><span class="text-[9px] font-bold uppercase tracking-widest opacity-30">&copy; {new Date().getFullYear()} {siteTitle}.</span></div>
        </footer>

        <script dangerouslySetInnerHTML={{ __html: `
          const formatIDR = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
          
          document.addEventListener('DOMContentLoaded', () => {
            const cart = JSON.parse(localStorage.getItem('premium_cart')) || [];
            if (cart.length === 0) { alert('Cart is empty!'); window.location.href = '/products'; return; }
            
            document.getElementById('cart_data_input').value = JSON.stringify(cart);
            const container = document.getElementById('checkout-items');
            
            let total = 0;
            container.innerHTML = cart.map(item => {
              total += (item.price * item.quantity);
              return \`
                <li class="flex gap-4">
                  <img src="\${item.image}" class="w-16 h-20 object-cover border border-neutral-200 bg-white" />
                  <div class="flex-1 flex flex-col justify-center">
                    <h3 class="text-[10px] font-bold uppercase tracking-widest line-clamp-1">\${item.name}</h3>
                    <p class="text-[9px] text-neutral-400 uppercase tracking-widest mt-1">\${item.brand} • Qty: \${item.quantity}</p>
                    <p class="text-[11px] font-bold tracking-widest mt-2">\${formatIDR(item.price * item.quantity)}</p>
                  </div>
                </li>
              \`;
            }).join('');
            
            document.getElementById('checkout-total').textContent = formatIDR(total);
          });

          document.getElementById('checkout-form').addEventListener('submit', function() {
            const btn = document.getElementById('submit-btn');
            btn.innerHTML = 'PROCESSING...'; btn.classList.add('opacity-50', 'pointer-events-none');
          });
        `}} />
      </body>
    </html>
  );
});