import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  let settings;
  try {
    const res = await c.env.DB.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first();
    settings = JSON.parse(res?.config_json || '{}');
  } catch (e) {
    settings = { store_name: "Visoe Luxury", contact_email: "", whatsapp_number: "", instagram_url: "", shipping_policy: "" };
  }

  return c.render(
    <div class="max-w-[1000px] mx-auto py-10 px-6">
      <div class="mb-12 border-b border-neutral-100 pb-8">
        <h1 class="text-3xl font-serif italic tracking-widest uppercase">Global Settings</h1>
        <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] mt-2">Manage store configurations and details</p>
      </div>

      <form id="settings-form" class="space-y-12 bg-neutral-50 border border-neutral-100 p-8 md:p-12 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-8">
            <h3 class="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-neutral-200 pb-3">Basic Information</h3>
            <div class="space-y-2">
              <label class="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Store Name</label>
              <input type="text" name="store_name" value={settings.store_name} class="w-full border-b border-neutral-300 py-3 text-xs outline-none focus:border-black transition bg-transparent" />
            </div>
            <div class="space-y-2">
              <label class="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Contact Email</label>
              <input type="email" name="contact_email" value={settings.contact_email} class="w-full border-b border-neutral-300 py-3 text-xs outline-none focus:border-black transition bg-transparent" />
            </div>
            <div class="space-y-2">
              <label class="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">WhatsApp Number</label>
              <input type="text" name="whatsapp_number" value={settings.whatsapp_number} placeholder="+628..." class="w-full border-b border-neutral-300 py-3 text-xs outline-none focus:border-black transition bg-transparent" />
            </div>
          </div>

          <div class="space-y-8">
            <h3 class="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-neutral-200 pb-3">Social & Policies</h3>
            <div class="space-y-2">
              <label class="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Instagram Link</label>
              <input type="text" name="instagram_url" value={settings.instagram_url} placeholder="https://instagram.com/..." class="w-full border-b border-neutral-300 py-3 text-xs outline-none focus:border-black transition bg-transparent" />
            </div>
            <div class="space-y-2">
              <label class="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Shipping Policy (Brief)</label>
              <textarea name="shipping_policy" rows={4} class="w-full border border-neutral-300 p-4 text-xs outline-none focus:border-black transition bg-white leading-relaxed">{settings.shipping_policy}</textarea>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t border-neutral-200 flex justify-end">
          <button type="submit" class="w-full md:w-[300px] bg-black text-white py-6 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-neutral-800 transition-all shadow-xl">
            Save Settings
          </button>
        </div>
      </form>

      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('settings-form').onsubmit = async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const payload = {
            store_name: fd.get('store_name'),
            contact_email: fd.get('contact_email'),
            whatsapp_number: fd.get('whatsapp_number'),
            instagram_url: fd.get('instagram_url'),
            shipping_policy: fd.get('shipping_policy')
          };

          const res = await fetch('/api/settings/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if(res.ok) {
            alert('Settings successfully updated!');
            window.location.reload();
          } else {
            alert('Error saving settings. Have you run the store_settings SQL migration?');
          }
        };
      `}} />
    </div>,
    { title: 'Settings | Admin' }
  );
});