import { jsxRenderer } from 'hono/jsx-renderer';

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Admin Panel | Visoe Luxury'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f9f9f9; }
        `}} />
      </head>
      <body class="flex min-h-screen">
        {/* SIDEBAR NAVIGATION */}
        <aside class="w-64 bg-black text-white flex flex-col sticky top-0 h-screen">
          <div class="p-8 border-b border-neutral-800">
            <h1 class="text-xl font-bold uppercase tracking-[0.3em]">Visoe<span class="font-light italic text-neutral-500">Adm</span></h1>
          </div>
          
          <nav class="flex-1 p-6 space-y-2 overflow-y-auto">
            <a href="/admin" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Dashboard</a>
            
            <div class="pt-4 pb-2 text-[8px] font-bold text-neutral-500 uppercase tracking-[0.2em] px-4">Management</div>
            <a href="/admin/products" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Products</a>
            <a href="/admin/categories" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Categories</a>
            <a href="/admin/orders" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Orders</a>
            {/* INI TAMBAHAN MENU PAGES */}
            <a href="/admin/pages" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded text-green-400">Pages</a>
            
            <div class="pt-4 pb-2 text-[8px] font-bold text-neutral-500 uppercase tracking-[0.2em] px-4">Customization</div>
            <a href="/admin/page-builder" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Page Builder</a>
            <a href="/admin/media" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Media Library</a>
            <a href="/admin/settings" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition rounded">Settings</a>
          </nav>

          <div class="p-6 border-t border-neutral-800">
            <a href="/" target="_blank" class="block py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition">View Website ↗</a>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main class="flex-1 overflow-y-auto p-10">
          {children}
        </main>
      </body>
    </html>
  );
});