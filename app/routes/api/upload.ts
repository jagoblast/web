import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../utils/auth'

// Fungsi bantuan untuk membuat SHA-1 Signature rahasia Cloudinary
async function generateSignature(timestamp: string, apiSecret: string) {
  const msgBuffer = new TextEncoder().encode(`timestamp=${timestamp}${apiSecret}`);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  
  // 1. Keamanan Dasar: Pastikan yang melakukan upload adalah user yang sudah login
  const user = await getAuthUser(c)
  if (!user) {
    return c.json({ success: false, message: 'Unauthorized. Anda harus login.' }, 401)
  }

  try {
    // 2. Ambil kredensial Cloudinary dari database platform_settings
    const settings = await db.prepare("SELECT cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret FROM platform_settings LIMIT 1").first()
    
    if (!settings || !settings.cloudinary_cloud_name || !settings.cloudinary_api_key || !settings.cloudinary_api_secret) {
      return c.json({ 
        success: false, 
        message: 'Pengaturan API Cloudinary belum diisi. Silakan hubungi Admin atau atur di halaman Pengaturan Admin.' 
      }, 500)
    }

    // 3. Tangkap file gambar yang dikirim dari form (form data AJAX)
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ success: false, message: 'Tidak ada file gambar yang terdeteksi.' }, 400)
    }

    // 4. Siapkan parameter wajib Cloudinary
    const cloudName = settings.cloudinary_cloud_name as string;
    const apiKey = settings.cloudinary_api_key as string;
    const apiSecret = settings.cloudinary_api_secret as string;
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Generate signature untuk otentikasi
    const signature = await generateSignature(timestamp, apiSecret);

    // 5. Bungkus ulang data untuk dikirim (POST) ke server Cloudinary
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', file);
    cloudinaryData.append('api_key', apiKey);
    cloudinaryData.append('timestamp', timestamp);
    cloudinaryData.append('signature', signature);

    // 6. Eksekusi pengiriman ke Cloudinary
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryData
    });

    const result = await uploadResponse.json() as any;

    // 7. Kembalikan URL gambar ke frontend
    if (result.secure_url) {
      return c.json({ 
        success: true, 
        url: result.secure_url 
      });
    } else {
      return c.json({ 
        success: false, 
        message: result.error?.message || 'Terjadi kesalahan dari pihak Cloudinary.' 
      }, 500);
    }

  } catch (error: any) {
    console.error("Upload Error:", error);
    return c.json({ success: false, message: 'Gagal memproses unggahan: ' + error.message }, 500)
  }
})
