import { createRoute } from 'honox/factory';
import { getAuthUser, createToken, setAuthCookie, hashPassword } from '../utils/auth';
import { generateId } from '../utils/admin_utils';

export const POST = createRoute(async (c) => {
  const db = c.env.DB;
  const formData = await c.req.parseBody();
  const name = formData.name as string;
  const email = formData.email as string;
  const password = formData.password as string;
  const phone = formData.phone as string;

  // 1. Cek apakah email sudah terdaftar di database
  const existingUser: any = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existingUser) {
    return c.redirect('/register?error=email_exists');
  }

  // 2. Hash Password dengan SHA-256
  const hashed = await hashPassword(password);
  const userId = 'USR-' + generateId().substring(0, 8).toUpperCase();

  // 3. Simpan data user baru ke database
  await db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone)
    VALUES (?, ?, ?, ?, 'customer', ?)
  `).bind(userId, name, email, hashed, phone).run();

  // 4. Langsung buatkan sesi login (Token JWT)
  const token = await createToken({ id: userId, email: email, role: 'customer' });
  setAuthCookie(c, token);
  
  // 5. Arahkan ke Dashboard Akun
  return c.redirect('/account?success=registered');
});

export default createRoute(async (c) => {
  const db = c.env.DB;
  const user = await getAuthUser(c);
  
  // Jika sudah login, lempar ke akun
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
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Create Account | {siteTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; background: #fafafa; margin: 0; }
          .font-serif { font-family: 'Bodoni Moda', serif; }
        `}} />
      </head>
      <body class="flex flex-col min-h-screen">
        
        {/* ================= HEADER GLOBAL MAX 1200px ================= */}
        <header class="w-full bg-white z-[100] relative border-b border-neutral-100">
            <div class="max-w-[1200px] mx-auto px-6 py-6 flex justify-between items-center">
              <a href="/">
                <img src={headerData.logo_desktop || headerData.logo || '/logo.png'} style={{ width: headerData.logo_width_desktop || '150px' }} class="object-contain" alt={siteTitle} />
              </a>
              <a href="/products" class="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-neutral-500 transition">Back to Shop</a>
            </div>
        </header>

        {/* ================= MAIN CONTENT MAX 1200px ================= */}
        <main class="flex-1 flex items-center justify-center py-20 px-4 max-w-[1200px] mx-auto w-full">
          <div class="w-full max-w-lg bg-white p-10 md:p-14 shadow-2xl border border-neutral-100">
            <div class="text-center mb-10 border-b border-neutral-100 pb-8">
              <h1 class="text-3xl font-serif italic tracking-widest uppercase mb-2">Create Account</h1>
              <p class="text-[10px] text-neutral-400 uppercase tracking-[0.2em]">Join our exclusive membership</p>
            </div>

            {error === 'email_exists' && (
              <div class="bg-red-50 text-red-600 text-[10px] p-4 text-center mb-8 font-bold uppercase tracking-[0.2em] border border-red-100">
                Email is already registered. Please sign in instead.
              </div>
            )}

            <form method="POST" class="space-y-6">
              <div class="space-y-2">
                <label class="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Full Name</label>
                <input type="text" name="name" required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" placeholder="John Doe" />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Email Address</label>
                  <input type="email" name="email" required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" placeholder="john@example.com" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Phone Number</label>
                  <input type="text" name="phone" required class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" placeholder="0812xxxxxx" />
                </div>
              </div>

              <div class="space-y-2 pt-2">
                <label class="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Secure Password</label>
                <input type="password" name="password" required minlength="6" class="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm bg-transparent" placeholder="••••••••" />
                <p class="text-[8px] text-neutral-400 mt-1 uppercase tracking-widest opacity-60">Minimum 6 characters</p>
              </div>

              <div class="pt-6">
                <button type="submit" class="w-full bg-black text-white py-5 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-neutral-800 transition shadow-xl">Complete Registration</button>
              </div>
            </form>
            
            <div class="mt-10 text-center border-t border-neutral-100 pt-8">
              <p class="text-[10px] text-neutral-400 tracking-widest uppercase">
                Already a member? <a href="/login" class="text-black font-bold border-b border-black pb-1 ml-1 hover:opacity-50 transition">Sign In</a>
              </p>
            </div>
          </div>
        </main>

        {/* ================= FOOTER GLOBAL MAX 1200px ================= */}
        <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-16 px-6 mt-auto">
            <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
               <span class="text-[9px] font-bold uppercase tracking-widest opacity-30">&copy; {new Date().getFullYear()} {siteTitle}.</span>
               <div class="flex gap-8 text-[9px] font-bold uppercase tracking-widest opacity-30">
                  <a href="/terms">Terms</a><a href="/privacy">Privacy</a>
               </div>
            </div>
        </footer>

      </body>
    </html>
  );
});