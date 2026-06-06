import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  
  const settingsRecord = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first()
  let settings: any = {}
  if (settingsRecord && settingsRecord.config_json) {
    settings = JSON.parse(settingsRecord.config_json as string)
  }

  return c.render(
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Toko</h1>
      
      <form action="/api/settings/update" method="POST" className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Toko Umum</h2>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
              <input type="text" name="store_name" defaultValue={settings.store_name || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black focus:border-black" />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Informasi Pembayaran Manual</h2>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
              <input type="text" name="bank_name" defaultValue={settings.bank_name || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
              <input type="text" name="bank_account_number" defaultValue={settings.bank_account_number || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik Rekening</label>
              <input type="text" name="bank_account_name" defaultValue={settings.bank_account_name || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
            </div>
          </div>
        </div>

        {/* --- BLOK PENGATURAN CLOUDINARY BARU --- */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Penyimpanan Gambar (Cloudinary)</h2>
          <p className="text-sm text-gray-500 mb-6">Kredensial untuk melakukan streaming upload gambar produk langsung ke Cloudinary.</p>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Name</label>
              <input type="text" name="cloudinary_cloud_name" defaultValue={settings.cloudinary_cloud_name || ''} placeholder="Contoh: dxxxxxxx" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input type="text" name="cloudinary_api_key" defaultValue={settings.cloudinary_api_key || ''} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
              <input type="password" name="cloudinary_api_secret" defaultValue={settings.cloudinary_api_secret || ''} placeholder="Biarkan kosong jika tidak diubah" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-black text-white px-8 py-3 rounded-md font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors shadow">
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  )
})
