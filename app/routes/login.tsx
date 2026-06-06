import { createRoute } from 'honox/factory';
import { getAuthUser, createToken, setAuthCookie, hashPassword } from '../utils/auth';

export const POST = createRoute(async (c) => {
  const db = c.env.DB;
  const formData = await c.req.parseBody();
  const email = formData.email as string;
  const password = formData.password as string;

  const hashed = await hashPassword(password);
  const user: any = await db.prepare("SELECT * FROM users WHERE email = ? AND password_hash = ? AND role = 'customer'").bind(email, hashed).first();

  if (user) {
    const token = await createToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(c, token);
    return c.redirect('/account');
  }
  
  return c.redirect('/login?error=1');
});

export default createRoute(async (c) => {
  const db = c.env.DB;
  const user = await getAuthUser(c);
  if (user && user.role === 'customer') return c.redirect('/account');

  let siteTitle = 'Visoe Luxury';
  let headerData: any = {};
  let footerData: any = {};
  
  try {
    const storeSettingsRow: any = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first();
    if (storeSettingsRow && storeSettingsRow.config_json) {
      siteTitle = JSON.parse(storeSettingsRow.config_json).site_title || 'Visoe Luxury';
    }
    const headerRow: any = await db.prepare("SELECT content_json FROM frontpage_widgets WHERE widget_type = 'header_widget' AND is_active = 1 ORDER BY id DESC LIMIT 1").first();
    const footerRow: any = await db.prepare("SELECT content_json FROM frontpage_widgets WHERE widget_type = 'footer_widget' AND is_active = 1 ORDER BY id DESC LIMIT 1").first();
    headerData = headerRow ? JSON.parse(headerRow.content_json || '{}') : {};
    footerData = footerRow ? JSON.parse(footerRow.content_json || '{}') : {};
    if (!headerData.menu || headerData.menu.length === 0) headerData.menu = [{ title: 'Shop', url: '/products', columns: [] }];
    if (!footerData.columns || footerData.columns.length === 0) footerData.columns = [{ title: 'Company', links: [{ name: 'About Us', url: '/about' }] }];
  } catch(e) {}

  const error = c.req.query('error');

  return c.html(
    <html lang="id">
      <head>
        <title>Member Login | {siteTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; background: #fafafa; margin: 0; }
          .font-serif { font-family: 'Bodoni Moda', serif; }
        `}} />
      </head>
      <body class="flex flex-col min-h-screen">
        
        {/* HEADER GLOBAL (MAX 1200PX) */}
        <header class="w-full bg-white z-[100] relative border-b border-neutral-100">
            <div class="max-w-[1200px] mx-auto px-6 py-6 flex justify-between items-center">
              <a href="/"><img src={headerData.logo_desktop || headerData.logo || '/logo.png'} style={{ width: '150px' }} class="object-contain" alt={siteTitle} /></a>
              <a href="/products" class="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-neutral-500">Back to Shop</a>
            </div>
        </header>

        <main class="flex-1 flex items-center justify-center py-20 px-4 max-w-[1200px] mx-auto w-full">
          <div class="w-full max-w-md bg-white p-10 shadow-2xl border border-neutral-100">
            <div class="text-center mb-10">
              <h1 class="text-3xl font-serif italic tracking-widest uppercase mb-2">Sign In</h1>
              <p class="text-[10px] text-neutral-400 uppercase tracking-widest">Access your private account</p>
            </div>

            {error && <div class="bg-red-50 text-red-600 text-[10px] p-4 text-center mb-6 font-bold uppercase tracking-widest border border-red-100">Invalid credentials.</div>}

            <form method="POST" class="space-y-6">
              <div class="space-y-2">
                <label class="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Email Address</label>
                <input type="email" name="email" required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" placeholder="Enter your email" />
              </div>
              <div class="space-y-2">
                <label class="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Password</label>
                <input type="password" name="password" required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" placeholder="••••••••" />
              </div>
              <button type="submit" class="w-full bg-black text-white py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-neutral-800 transition shadow-lg mt-4">Sign In</button>
            </form>
            
            <div class="mt-8 text-center border-t border-neutral-100 pt-8">
              <p class="text-[10px] text-neutral-400 tracking-widest uppercase">Don't have an account? <a href="/register" class="text-black font-bold border-b border-black pb-1 ml-1">Register</a></p>
            </div>
          </div>
        </main>

        {/* FOOTER GLOBAL (MAX 1200PX) */}
        <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-16 px-6 mt-auto">
            <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
               <span class="text-[9px] font-bold uppercase tracking-widest opacity-30">&copy; {new Date().getFullYear()} {siteTitle}.</span>
            </div>
        </footer>

      </body>
    </html>
  );
});