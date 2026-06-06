import { createRoute } from 'honox/factory';
import { uploadToR2 } from '../../utils/admin_utils';

export const POST = createRoute(async (c) => {
  const formData = await c.req.parseBody();
  const file = formData.file;

  if (file instanceof File) {
    try {
      // 1. FUNGSI ASLI ANDA (TETAP UTUH & TIDAK DISENTUH)
      // Ini akan tetap mengupload file ke R2 dan mengembalikan URL CDN-nya
      const url = await uploadToR2(c, file);
      
      // 2. TAMBAHAN PENCATATAN KE DATABASE
      // Setelah URL didapat, kita catat ke tabel media_assets agar muncul di Media Library
      const db = c.env.DB;
      const id = Math.random().toString(36).substring(2, 15);
      const fileName = file.name;
      const sizeKb = file.size / 1024;
      
      await db.prepare(
        "INSERT INTO media_assets (id, file_name, file_key, public_url, size_kb) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, fileName, url, url, sizeKb).run();

      // 3. RESPONS ASLI ANDA (TETAP UTUH)
      return c.json({ success: true, url });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || 'R2 Upload Failed' }, 500);
    }
  }
  return c.json({ success: false, message: 'No file provided' }, 400);
});