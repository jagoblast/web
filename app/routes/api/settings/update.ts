import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  
  const currentRecord = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first()
  let currentSettings: any = {}
  if (currentRecord && currentRecord.config_json) {
    currentSettings = JSON.parse(currentRecord.config_json as string)
  }

  // Jika input API Secret kosong, gunakan secret yang lama (agar admin tidak harus selalu menginput ulang secret)
  const incomingSecret = formData.get('cloudinary_api_secret') as string
  const finalSecret = incomingSecret ? incomingSecret : currentSettings.cloudinary_api_secret

  const newSettings = {
    ...currentSettings,
    store_name: formData.get('store_name') as string,
    bank_name: formData.get('bank_name') as string,
    bank_account_number: formData.get('bank_account_number') as string,
    bank_account_name: formData.get('bank_account_name') as string,
    
    // Simpan kunci Cloudinary
    cloudinary_cloud_name: formData.get('cloudinary_cloud_name') as string,
    cloudinary_api_key: formData.get('cloudinary_api_key') as string,
    cloudinary_api_secret: finalSecret,
  }

  await db.prepare(`
    INSERT INTO store_settings (id, config_json) 
    VALUES ('GLOBAL', ?) 
    ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json
  `).bind(JSON.stringify(newSettings)).run()

  return c.redirect('/admin/settings?success=1')
})
