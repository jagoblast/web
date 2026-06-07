import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

// --- LOGIKA BACKEND: MENYIMPAN PENGATURAN KE DATABASE ---
export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  
  // Proteksi ganda: Pastikan yang mengakses adalah Admin
  if (!user || user.role !== 'admin') return c.redirect('/login')

  const formData = await c.req.formData()
  
  // Ambil data pengaturan Fee
  const adminFeeType = formData.get('admin_fee_type') as string
  const adminFeeValue = parseFloat(formData.get('admin_fee_value') as string)
  
  // Ambil data API Key
  const rajaongkirApiKey = formData.get('rajaongkir_api_key') as string
  const cloudinaryCloudName = formData.get('cloudinary_cloud_name') as string
  const cloudinaryApiKey = formData.get('cloudinary_api_key') as string
  const cloudinaryApiSecret = formData.get('cloudinary_api_secret') as string

  try {
    // Cek apakah baris pengaturan sudah ada di tabel platform_settings
    const existing = await db.prepare("SELECT id FROM platform_settings LIMIT 1").first()

    if (existing) {
        // Jika sudah ada, lakukan UPDATE
        await db.prepare(`
          UPDATE platform_settings 
          SET admin_fee_type = ?, 
              admin_fee_value = ?, 
              rajaongkir_api_key = ?,
              cloudinary_cloud_name = ?,
              cloudinary_api_key = ?,
              cloudinary_api_secret = ?,
              updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(
            adminFeeType, adminFeeValue, 
            rajaongkirApiKey, cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret, 
            existing.id
        ).run()
    } else {
        // Jika belum ada, lakukan INSERT
        await db.prepare(`
          INSERT INTO platform_settings (
            admin_fee_type, admin_fee_value, 
            rajaongkir_api_key, cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            adminFeeType, adminFeeValue, 
            rajaongkirApiKey, cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret
        ).run()
    }

    return c.redirect('/admin/settings?success=1')
  } catch (error) {
    console.error("Error saving settings:", error);
    return c.redirect('/admin/settings?err=1')
  }
})


// --- LOGIKA FRONTEND: MENAMPILKAN FORM PENGATURAN ---
export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  
  if (!user || user.role !== 'admin') return c.redirect('/login')

  // Ambil pengaturan saat ini. Jika kosong, berikan string kosong untuk API key.
  const settings = await db.prepare("SELECT * FROM platform_settings LIMIT 1").first() || {
    admin_fee_type: 'flat',
    admin_fee_value: 2500,
    rajaongkir_api_key: '',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: ''
  }

  const success = c.req.query('success')
  const error = c.req.query('err')

  return c.render(
    <div className="max-w-4xl mx-auto py-10 px-4">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pengaturan Platform</h1>
        <a href="/admin" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">← Kembali ke Dasbor</a>
      </div>
      
      {/* Notifikasi */}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-sm mb-6 border border-green-200 font-medium text-sm flex items-center shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Pengaturan sistem berhasil disimpan!
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-sm mb-6 border border-red-200 font-medium text-sm flex items-center shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Gagal menyimpan pengaturan. Pastikan tabel platform_settings sudah di-alter.
        </div>
      )}

      <form action="/admin/settings" method="POST" className="space-y-8">

        {/* --- BAGIAN 1: API CLOUDINARY & RAJAONGKIR --- */}
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-6 border-b border-gray-100 pb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            Integrasi API (Layanan Eksternal)
          </h2>
          
          <div className="space-y-6">
            {/* RajaOngkir */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest">RajaOngkir API Key</label>
              <input 
                type="text" 
                name="rajaongkir_api_key" 
                defaultValue={settings.rajaongkir_api_key as string || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm transition-colors" 
                placeholder="Masukkan API Key dari panel RajaOngkir" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              {/* Cloudinary */}
              <div className="md:col-span-3">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Pengaturan Media Cloudinary</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-2 uppercase">Cloud Name</label>
                <input 
                  type="text" 
                  name="cloudinary_cloud_name" 
                  defaultValue={settings.cloudinary_cloud_name as string || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-2 uppercase">API Key</label>
                <input 
                  type="text" 
                  name="cloudinary_api_key" 
                  defaultValue={settings.cloudinary_api_key as string || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-2 uppercase">API Secret</label>
                <input 
                  type="password" 
                  name="cloudinary_api_secret" 
                  defaultValue={settings.cloudinary_api_secret as string || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-black focus:border-black text-sm transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- BAGIAN 2: PENGATURAN BIAYA LAYANAN --- */}
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-2 border-b border-gray-100 pb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Biaya Layanan Admin (Admin Fee)
          </h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Biaya ini akan ditambahkan otomatis saat pembeli melakukan checkout. Pilih apakah berupa potongan persentase (%) atau nominal flat (Rp).
          </p>
          
          <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Tipe Potongan</label>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="admin_fee_type" 
                  value="flat" 
                  defaultChecked={settings.admin_fee_type === 'flat'} 
                  className="w-4 h-4 text-black focus:ring-black border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-700">Flat (Nominal Rupiah Tetap)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="admin_fee_type" 
                  value="percentage" 
                  defaultChecked={settings.admin_fee_type === 'percentage'} 
                  className="w-4 h-4 text-black focus:ring-black border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-700">Persentase (%) dari Total Harga</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Nilai Potongan</label>
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">Rp / %</span>
              </div>
              <input 
                type="number" 
                step="0.01" 
                name="admin_fee_value" 
                required 
                defaultValue={settings.admin_fee_value}
                className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-sm focus:ring-black focus:border-black transition-colors font-bold text-lg" 
                placeholder="2500" 
              />
            </div>
          </div>
        </div>

        {/* --- TOMBOL SIMPAN --- */}
        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-black text-white px-10 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-xl w-full md:w-auto text-sm">
            Simpan Seluruh Pengaturan
          </button>
        </div>

      </form>
    </div>
  )
})
