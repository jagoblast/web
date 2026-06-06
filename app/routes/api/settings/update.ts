import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  
  // 1. Ambil pengaturan yang sudah ada agar tidak menimpa properti lain (misal logo, banner)
  const currentRecord = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first()
  let currentSettings = {}
  if (currentRecord && currentRecord.config_json) {
    currentSettings = JSON.parse(currentRecord.config_json as string)
  }

  // 2. Gabungkan pengaturan lama dengan input baru dari form
  const newSettings = {
    ...currentSettings,
    store_name: formData.get('store_name') as string,
    bank_name: formData.get('bank_name') as string,
    bank_account_number: formData.get('bank_account_number') as string,
    bank_account_name: formData.get('bank_account_name') as string,
  }

  // 3. Simpan ke Database (Gunakan UPSERT / ON CONFLICT)
  await db.prepare(`
    INSERT INTO store_settings (id, config_json) 
    VALUES ('GLOBAL', ?) 
    ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json
  `).bind(JSON.stringify(newSettings)).run()

  // 4. Kembalikan Admin ke halaman pengaturan dengan parameter sukses
  return c.redirect('/admin/settings?success=1')
})
