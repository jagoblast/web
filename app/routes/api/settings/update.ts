import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  const section = formData.get('section') as string // Mendeteksi blok mana yang dikirim
  
  // Ambil konfigurasi saat ini dari database
  const currentRecord = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first()
  let currentSettings: any = {}
  if (currentRecord && currentRecord.config_json) {
    currentSettings = JSON.parse(currentRecord.config_json as string)
  }

  // Siapkan objek baru yang menyalin data lama agar tidak hilang
  let newSettings = { ...currentSettings }

  // PROSES PENYIMPANAN BERDASARKAN BLOK YANG DIKLIK
  if (section === 'general') {
    newSettings.store_name = formData.get('store_name') as string
  } 
  else if (section === 'banks') {
    // Menangkap array input dari form dinamis Tambah Bank
    const bankNames = formData.getAll('bank_name[]') as string[]
    const bankAccNums = formData.getAll('bank_account_number[]') as string[]
    const bankAccNames = formData.getAll('bank_account_name[]') as string[]
    
    const banks = []
    for(let i = 0; i < bankNames.length; i++) {
      if(bankNames[i] || bankAccNums[i] || bankAccNames[i]) {
        banks.push({
          bank_name: bankNames[i],
          bank_account_number: bankAccNums[i],
          bank_account_name: bankAccNames[i]
        })
      }
    }
    newSettings.banks = banks
  } 
  else if (section === 'cloudinary') {
    const incomingSecret = formData.get('cloudinary_api_secret') as string
    const finalSecret = incomingSecret ? incomingSecret : currentSettings.cloudinary_api_secret

    newSettings.cloudinary_cloud_name = formData.get('cloudinary_cloud_name') as string
    newSettings.cloudinary_api_key = formData.get('cloudinary_api_key') as string
    newSettings.cloudinary_api_secret = finalSecret
  }
  else if (section === 'rajaongkir') {
    newSettings.rajaongkir_api_key = formData.get('rajaongkir_api_key') as string
  }

  // Simpan kembali ke D1 menggunakan UPSERT
  await db.prepare(`
    INSERT INTO store_settings (id, config_json) 
    VALUES ('GLOBAL', ?) 
    ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json
  `).bind(JSON.stringify(newSettings)).run()

  return c.redirect('/admin/settings?success=1')
})
