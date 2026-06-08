import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const success = c.req.query('success')
  
  let settings: any = await db.prepare("SELECT * FROM platform_settings WHERE id = 1").first()
  if (!settings) settings = {}

  let banks = []
  try { banks = JSON.parse((settings.manual_banks_json as string) || '[]') } catch(e) {}

  return c.render(
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Platform Global</h1>
        <p className="text-sm text-gray-500">Konfigurasi fee, kontak, metode pembayaran, dan integrasi API Marketplace.</p>
      </div>

      {success === '1' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
          <p className="text-sm text-green-700 font-bold">Pengaturan berhasil disimpan ke Platform Settings!</p>
        </div>
      )}
      
      {/* --- FORM 1: PENGATURAN UMUM & WHATSAPP --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="general" />
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Informasi Utama & Biaya Admin</h2>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nomor WhatsApp Admin</label>
            <input type="text" name="whatsapp_number" defaultValue={settings.whatsapp_number || '6281234567890'} className="w-full border-gray-300 rounded-sm shadow-sm p-3 border focus:ring-black text-sm" placeholder="Gunakan format tanpa +, contoh: 6281234567890" />
            <p className="text-[10px] text-gray-500 mt-2">Nomor ini digunakan untuk menerima konfirmasi pembayaran manual dan permintaan pendaftaran vendor baru.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tipe Biaya Admin</label>
            <select name="admin_fee_type" defaultValue={settings.admin_fee_type || 'flat'} className="w-full border-gray-300 rounded-sm shadow-sm p-3 border focus:ring-black">
               <option value="flat">Nominal Tetap (Flat)</option>
               <option value="percent">Persentase (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nilai Biaya</label>
            <input type="number" name="admin_fee_value" defaultValue={settings.admin_fee_value || 2500} className="w-full border-gray-300 rounded-sm shadow-sm p-3 border focus:ring-black" />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-50">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black">Simpan Pengaturan</button>
        </div>
      </form>

      {/* --- FORM 2: PEMBAYARAN MANUAL --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="banks" />
        <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-3">Rekening Escrow Marketplace</h2>
        <p className="text-xs text-gray-500 mb-6">Rekening penampungan uang pembeli sebelum dicairkan ke dompet penjual.</p>
        
        <div id="bank-list" className="space-y-4 mb-6">
          {banks.map((bank: any, index: number) => (
            <div className="bank-item grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-gray-50 border border-gray-200 p-4 rounded-sm relative" key={index}>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Nama Bank</label>
                <input type="text" name="bank_name[]" defaultValue={bank.bank_name} className="w-full border-gray-300 rounded-sm shadow-sm p-2 border text-sm focus:ring-black" required />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">No. Rekening</label>
                <input type="text" name="bank_account_number[]" defaultValue={bank.bank_account_number} className="w-full border-gray-300 rounded-sm shadow-sm p-2 border text-sm focus:ring-black" required />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Atas Nama</label>
                <input type="text" name="bank_account_name[]" defaultValue={bank.bank_account_name} className="w-full border-gray-300 rounded-sm shadow-sm p-2 border text-sm focus:ring-black" required />
              </div>
              <div className="sm:col-span-1 pb-1">
                <button type="button" onClick="this.closest('.bank-item').remove()" className="w-full bg-red-50 text-red-600 p-2 rounded-sm font-bold text-sm">X</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button type="button" id="btn-add-bank" className="text-xs bg-white px-4 py-2.5 rounded-sm border border-gray-300 font-bold hover:bg-gray-50 uppercase tracking-wider">+ Tambah Bank</button>
          <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black">Simpan Bank</button>
        </div>
      </form>

      {/* --- FORM 3: CLOUDINARY --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="cloudinary" />
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Penyimpanan Gambar (Cloudinary)</h2>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4 mb-6">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cloud Name</label>
            <input type="text" name="cloudinary_cloud_name" defaultValue={settings.cloudinary_cloud_name || ''} className="w-full border-gray-300 rounded-sm shadow-sm p-3 border text-sm" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">API Key</label>
            <input type="text" name="cloudinary_api_key" defaultValue={settings.cloudinary_api_key || ''} className="w-full border-gray-300 rounded-sm shadow-sm p-3 border text-sm" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">API Secret</label>
            <input type="password" name="cloudinary_api_secret" defaultValue="" placeholder="(Isi untuk ubah)" className="w-full border-gray-300 rounded-sm shadow-sm p-3 border text-sm" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-50">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black">Simpan Cloudinary</button>
        </div>
      </form>

      {/* --- FORM 4: RAJAONGKIR --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="rajaongkir" />
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Integrasi Pengiriman (RajaOngkir)</h2>
        
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">API Key RajaOngkir</label>
          <input type="password" name="rajaongkir_api_key" defaultValue={settings.rajaongkir_api_key || ''} className="w-full border-gray-300 rounded-sm shadow-sm p-3 border text-sm" />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-50">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black">Simpan RajaOngkir</button>
        </div>
      </form>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const btnAdd = document.getElementById('btn-add-bank');
          const list = document.getElementById('bank-list');
          if (btnAdd && list) {
             btnAdd.addEventListener('click', function() {
               const div = document.createElement('div');
               div.className = 'bank-item grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-gray-50 border border-gray-200 p-4 rounded-sm relative mt-4';
               div.innerHTML = \`
                  <div class="sm:col-span-3">
                     <label class="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Nama Bank</label>
                     <input type="text" name="bank_name[]" class="w-full border-gray-300 rounded-sm p-2 border text-sm" required />
                  </div>
                  <div class="sm:col-span-4">
                     <label class="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">No. Rekening</label>
                     <input type="text" name="bank_account_number[]" class="w-full border-gray-300 rounded-sm p-2 border text-sm" required />
                  </div>
                  <div class="sm:col-span-4">
                     <label class="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Atas Nama</label>
                     <input type="text" name="bank_account_name[]" class="w-full border-gray-300 rounded-sm p-2 border text-sm" required />
                  </div>
                  <div class="sm:col-span-1 pb-1">
                     <button type="button" onclick="this.closest('.bank-item').remove()" class="w-full bg-red-50 text-red-600 p-2 rounded-sm font-bold text-sm">X</button>
                  </div>
               \`;
               list.appendChild(div);
             });
          }
        });
      `}} />
    </div>
  )
})
