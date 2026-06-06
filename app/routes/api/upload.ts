import { createRoute } from 'honox/factory';

export const POST = createRoute(async (c) => {
  const db = c.env.DB;
  
  // Menggunakan fungsi standar Hono untuk membaca FormData
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return c.json({ success: false, message: 'No file provided' }, 400);
  }

  try {
    // 1. Ambil Kredensial Cloudinary dari Database
    const settingsRecord = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first();
    if (!settingsRecord || !settingsRecord.config_json) {
       throw new Error("Pengaturan toko belum dikonfigurasi.");
    }
    
    const settings = JSON.parse(settingsRecord.config_json as string);
    const cloudName = settings.cloudinary_cloud_name;
    const apiKey = settings.cloudinary_api_key;
    const apiSecret = settings.cloudinary_api_secret;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Kredensial Cloudinary belum diisi di menu Pengaturan Admin.");
    }

    // 2. Buat Signature Keamanan (SHA-1) sesuai standar Cloudinary API
    const timestamp = Math.round((new Date()).getTime() / 1000).toString();
    const strToSign = `timestamp=${timestamp}${apiSecret}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(strToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Eksekusi Upload ke Cloudinary
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', file);
    cloudinaryData.append('api_key', apiKey);
    cloudinaryData.append('timestamp', timestamp);
    cloudinaryData.append('signature', signature);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryData,
    });

    const uploadResult: any = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadResult.error?.message || 'Gagal upload ke server Cloudinary');
    }

    const url = uploadResult.secure_url;

    // 4. Catat file yang berhasil diupload ke tabel media_assets
    const id = crypto.randomUUID().substring(0, 15);
    const sizeKb = file.size / 1024;
    
    await db.prepare(
      "INSERT INTO media_assets (id, file_name, file_key, public_url, size_kb) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, file.name, uploadResult.public_id, url, sizeKb).run();

    return c.json({ success: true, url });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
