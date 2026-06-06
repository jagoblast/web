import { createRoute } from 'honox/factory';
import { getAuthUser, hashPassword } from '../../utils/auth';

export const POST = createRoute(async (c) => {
  const db = c.env.DB;
  const user = await getAuthUser(c);
  if (!user || user.role !== 'customer') return c.redirect('/login');

  const formData = await c.req.parseBody();
  const action = formData.action as string;

  if (action === 'update_profile') {
    await db.prepare("UPDATE users SET name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(formData.name, formData.phone, formData.address, user.id).run();
  } else if (action === 'change_password') {
    const newPass = await hashPassword(formData.new_password as string);
    await db.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(newPass, user.id).run();
  }

  return c.redirect('/account?success=1');
});

export default createRoute(async (c) => {
  const db = c.env.DB;
  const authUser = await getAuthUser(c);
  if (!authUser || authUser.role !== 'customer') return c.redirect('/login');

  const tab = c.req.query('tab') || 'dashboard';

  const userRecord: any = await db.prepare("SELECT * FROM users WHERE id = ?").bind(authUser.id).first();
  const { results: orders } = await db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").bind(authUser.id).all();

  // Ambil Header & Footer Global dari Database
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
    
    if (!headerData.menu || headerData.menu.length === 0) headerData.menu = [{ title: 'Shop', url: '/products', columns: [] }];
    if (!footerData.columns || footerData.columns.length === 0) footerData.columns = [{ title: 'Company', links: [{ name: 'About Us', url: '/about' }] }];
  } catch(e) {}

  const formatIDR = (p: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0);

  return c.html(
    <html lang="id">
      <head>
        <title>My Account | {siteTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; background: #fafafa; margin: 0; overflow-x: hidden; }
          .font-serif { font-family: 'Bodoni Moda', serif; }
        `}} />
      </head>
      <body class="flex flex-col min-h-screen">
        
        {/* ================= HEADER GLOBAL ================= */}
        <header class="w-full bg-white z-[100] relative border-b border-neutral-100">
          <div class="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/"><img src={headerData.logo_desktop || headerData.logo || '/logo.png'} style={{ width: '150px' }} class="object-contain" alt={siteTitle} /></a>
            <div class="flex gap-6 items-center">
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Welcome, {userRecord.name}</span>
              <a href="/logout" class="text-[9px] font-bold uppercase tracking-widest hover:text-red-500 transition border border-neutral-200 px-4 py-2">Sign Out</a>
            </div>
          </div>
        </header>

        <main class="flex-1 max-w-[1200px] mx-auto px-6 py-16 w-full flex flex-col md:flex-row gap-12">
          
          {/* STICKY MENU 1200PX */}
          <aside class="w-full md:w-64 flex-shrink-0">
            <div class="sticky top-10 space-y-2 bg-white p-6 border border-neutral-100 shadow-sm">
              <h3 class="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6">Menu</h3>
              <a href="/account?tab=dashboard" class={`block text-[11px] font-bold uppercase tracking-widest py-3 border-b border-neutral-50 ${tab==='dashboard'?'text-black':'text-neutral-400 hover:text-black transition'}`}>Dashboard</a>
              <a href="/account?tab=orders" class={`block text-[11px] font-bold uppercase tracking-widest py-3 border-b border-neutral-50 ${tab==='orders'?'text-black':'text-neutral-400 hover:text-black transition'}`}>Order History</a>
              <a href="/account?tab=settings" class={`block text-[11px] font-bold uppercase tracking-widest py-3 ${tab==='settings'?'text-black':'text-neutral-400 hover:text-black transition'}`}>Account Settings</a>
            </div>
          </aside>

          {/* KONTEN AREA */}
          <div class="flex-1 bg-white p-10 border border-neutral-100 shadow-sm">
            {c.req.query('success') && <div class="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest p-4 mb-8 text-center border border-green-200">Updates saved successfully.</div>}

            {/* TAB: DASHBOARD */}
            {tab === 'dashboard' && (
              <div class="space-y-8">
                <h1 class="text-3xl font-serif italic uppercase tracking-widest">Dashboard</h1>
                <p class="text-[11px] text-neutral-500 leading-relaxed max-w-lg">Welcome to your private member area. Here you can track your recent orders, manage your shipping addresses, and update your profile.</p>
                <div class="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-100">
                   <div class="p-6 bg-neutral-50 border border-neutral-100"><h4 class="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-2">Total Orders</h4><span class="text-3xl font-serif">{orders.length}</span></div>
                   <div class="p-6 bg-neutral-50 border border-neutral-100"><h4 class="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-2">Member Since</h4><span class="text-[11px] font-bold uppercase tracking-widest">{new Date(userRecord.created_at).toLocaleDateString('id-ID')}</span></div>
                </div>
              </div>
            )}

            {/* TAB: ORDER HISTORY (DIREVISI) */}
            {tab === 'orders' && (
              <div class="space-y-8">
                <h1 class="text-3xl font-serif italic uppercase tracking-widest">Order History</h1>
                {orders.length === 0 ? (
                  <p class="text-[11px] text-neutral-500 uppercase tracking-widest">You haven't placed any orders yet.</p>
                ) : (
                  <div class="space-y-6">
                    {orders.map((o: any) => (
                      <div class="border border-neutral-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition group">
                        <div class="flex-1">
                          {/* LINK KE DETAIL ORDER BERDASARKAN ID */}
                          <a href={`/account/orders/${o.id}`} class="block group-hover:pl-2 transition-all">
                            <h4 class="text-[12px] font-bold uppercase tracking-widest mb-1">{o.id}</h4>
                            <p class="text-[9px] text-neutral-400 uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString('id-ID')} • {o.payment_method || '101payasia'}</p>
                          </a>
                        </div>
                        <div class="text-center md:text-right flex flex-col items-center md:items-end gap-3">
                          <p class="text-[14px] font-bold tracking-widest">{formatIDR(o.total_amount)}</p>
                          <span class={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 border ${o.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{o.status}</span>
                          
                          {/* TOMBOL BAYAR SEKARANG MENGGUNAKAN KOLOM payment_url */}
                          {o.status === 'PENDING' && o.payment_url && (
                            <a href={o.payment_url} target="_blank" class="bg-black text-white px-8 py-2.5 text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition shadow-lg">Pay Now</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ACCOUNT SETTINGS */}
            {tab === 'settings' && (
              <div class="space-y-12">
                <h1 class="text-3xl font-serif italic uppercase tracking-widest border-b border-neutral-100 pb-6">Account Settings</h1>
                
                <form method="POST" class="space-y-6 max-w-lg">
                  <input type="hidden" name="action" value="update_profile" />
                  <h3 class="text-[11px] font-bold uppercase tracking-[0.3em]">Profile & Address</h3>
                  <div class="space-y-4">
                    <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Full Name</label><input type="text" name="name" value={userRecord.name} class="w-full border-b border-neutral-200 py-2 outline-none text-sm focus:border-black transition" /></div>
                    <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Phone</label><input type="text" name="phone" value={userRecord.phone || ''} class="w-full border-b border-neutral-200 py-2 outline-none text-sm focus:border-black transition" /></div>
                    <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Shipping Address (Default)</label><textarea name="address" rows={3} class="w-full border border-neutral-200 p-3 outline-none text-sm focus:border-black transition">{userRecord.address || ''}</textarea></div>
                    <button type="submit" class="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition">Save Profile</button>
                  </div>
                </form>

                <form method="POST" class="space-y-6 max-w-lg pt-12 border-t border-neutral-100">
                  <input type="hidden" name="action" value="change_password" />
                  <h3 class="text-[11px] font-bold uppercase tracking-[0.3em]">Change Password</h3>
                  <div class="space-y-4">
                    <div class="space-y-2"><label class="text-[9px] font-bold uppercase tracking-widest text-neutral-400">New Password</label><input type="password" name="new_password" required class="w-full border-b border-neutral-200 py-2 outline-none text-sm focus:border-black transition" /></div>
                    <button type="submit" class="bg-neutral-200 text-black px-8 py-4 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-300 transition">Update Password</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>

        {/* ================= FOOTER GLOBAL ================= */}
        <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-24 px-6 mt-auto">
          <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-left">
            <div class="space-y-8">
              <h4 class="text-2xl font-serif italic uppercase tracking-widest">{siteTitle}</h4>
              <p class="text-[11px] opacity-40 leading-relaxed uppercase tracking-[0.2em]">Exclusively Curated Authentic Luxury.</p>
            </div>
            {footerData.columns?.map((col: any) => (
              <div class="space-y-8">
                <h5 class="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">{col.title}</h5>
                <ul class="space-y-5">{col.links?.map((lnk: any) => (<li><a href={lnk.url} class="text-[11px] uppercase tracking-widest hover:pl-2 transition-all block opacity-70">{lnk.name}</a></li>))}</ul>
              </div>
            ))}
          </div>
          <div class="max-w-[1200px] mx-auto mt-24 pt-12 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-6">
             <span class="text-[9px] font-bold uppercase tracking-widest opacity-30">&copy; {new Date().getFullYear()} {siteTitle}.</span>
          </div>
        </footer>
      </body>
    </html>
  );
});