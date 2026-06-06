import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const success = c.req.query('success')
  
  // Ambil pengaturan yang sudah tersimpan
  const settingsRecord = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first()
  let settings: any = {}
  if (settingsRecord && settingsRecord.config_json) {
    settings = JSON.parse(settingsRecord.config_json as string)
  }

  // Pastikan array banks ada
  const banks = Array.isArray(settings.banks) ? settings.banks : []

  return c.render(
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Sistem & API</h1>
        <p className="text-sm text-gray-500">Konfigurasi dasar, metode pembayaran, dan integrasi pihak ketiga.</p>
      </div>

      {success === '1' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <p className="text-sm text-green-700 font-medium">Pengaturan berhasil disimpan!</p>
        </div>
      )}
      
      {/* --- FORM 1: PENGATURAN UMUM --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="general" />
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Informasi Toko Umum</h2>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
            <input type="text" name="store_name" defaultValue={settings.store_name || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black focus:border-black" />
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-md font-bold text-sm tracking-wide hover:bg-black transition-colors shadow">Simpan Info Umum</button>
        </div>
      </form>

      {/* --- FORM 2: PEMBAYARAN MANUAL (MULTI-BANK) --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="banks" />
        <h2 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">Rekening Bank Manual</h2>
        <p className="text-xs text-gray-500 mb-6">Tambahkan rekening yang akan ditampilkan saat pengguna memilih "Transfer Manual".</p>
        
        <div id="bank-list" className="space-y-4 mb-6">
          {banks.map((bank: any, index: number) => (
            <div className="bank-item grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-gray-50 border border-gray-200 p-4 rounded-md relative" key={index}>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Nama Bank</label>
                <input type="text" name="bank_name[]" defaultValue={bank.bank_name} placeholder="Contoh: BCA" className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm" required />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">No. Rekening</label>
                <input type="text" name="bank_account_number[]" defaultValue={bank.bank_account_number} className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm" required />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Atas Nama</label>
                <input type="text" name="bank_account_name[]" defaultValue={bank.bank_account_name} className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm" required />
              </div>
              <div className="sm:col-span-1 pb-1">
                <button type="button" onClick="this.closest('.bank-item').remove()" className="w-full bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 font-bold text-sm" title="Hapus Bank">X</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 mt-4 gap-4">
          <button type="button" id="btn-add-bank" className="w-full sm:w-auto text-sm bg-white px-4 py-2 rounded-md border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors">+ Tambah Bank Baru</button>
          <button type="submit" className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2 rounded-md font-bold text-sm tracking-wide hover:bg-black transition-colors shadow">Simpan Data Bank</button>
        </div>
      </form>

      {/* --- FORM 3: CLOUDINARY --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="cloudinary" />
        <h2 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">Penyimpanan Gambar (Cloudinary)</h2>
        <p className="text-xs text-gray-500 mb-6">Kredensial untuk melakukan streaming upload gambar produk.</p>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4 mb-6">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Name</label>
            <input type="text" name="cloudinary_cloud_name" defaultValue={settings.cloudinary_cloud_name || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input type="text" name="cloudinary_api_key" defaultValue={settings.cloudinary_api_key || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
            <input type="password" name="cloudinary_api_secret" defaultValue="" placeholder="(Tersembunyi - Isi untuk mengubah)" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-md font-bold text-sm tracking-wide hover:bg-black transition-colors shadow">Simpan Cloudinary</button>
        </div>
      </form>

      {/* --- FORM 4: RAJAONGKIR --- */}
      <form action="/api/settings/update" method="POST" className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
        <input type="hidden" name="section" value="rajaongkir" />
        <h2 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">Integrasi Pengiriman (RajaOngkir)</h2>
        <p className="text-xs text-gray-500 mb-6">Kunci API dari RajaOngkir untuk menghitung tarif ongkos kirim secara otomatis.</p>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key RajaOngkir</label>
            <input type="password" name="rajaongkir_api_key" defaultValue={settings.rajaongkir_api_key || ''} placeholder="Masukkan API Key Anda..." className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black focus:border-black" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-md font-bold text-sm tracking-wide hover:bg-black transition-colors shadow">Simpan RajaOngkir</button>
        </div>
      </form>

      {/* SCRIPT UNTUK MENAMBAH ROW BANK BARU */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const btnAdd = document.getElementById('btn-add-bank');
          const list = document.getElementById('bank-list');
          
          if (btnAdd && list) {
             btnAdd.addEventListener('click', function() {
               const div = document.createElement('div');
               div.className = 'bank-item grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-gray-50 border border-gray-200 p-4 rounded-md relative mt-4';
               div.innerHTML = \`
                  <div class="sm:col-span-3">
                     <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Nama Bank</label>
                     <input type="text" name="bank_name[]" placeholder="Contoh: BNI" class="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm" required />
                  </div>
                  <div class="sm:col-span-4">
                     <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">No. Rekening</label>
                     <input type="text" name="bank_account_number[]" class="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm" required />
                  </div>
                  <div class="sm:col-span-4">
                     <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Atas Nama</label>
                     <input type="text" name="bank_account_name[]" class="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm" required />
                  </div>
                  <div class="sm:col-span-1 pb-1">
                     <button type="button" onclick="this.closest('.bank-item').remove()" class="w-full bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 font-bold text-sm" title="Hapus Bank">X</button>
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
