import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../../utils/auth'
import { generateId } from '../../../utils/admin_utils'

export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const store = await db.prepare("SELECT id FROM stores WHERE user_id = ?").bind(user.id).first()
  if (!store) return c.redirect('/seller/register')

  const formData = await c.req.formData()
  const name = formData.get('name') as string
  const brand = formData.get('brand') as string
  const condition = formData.get('condition') as string
  const price = parseInt(formData.get('price') as string, 10)
  const stock = parseInt(formData.get('stock') as string, 10) || 1
  const description = formData.get('description') as string
  
  // Karena saat ini kategori itu tabel terpisah, kita beri default (misal tas) atau biarkan kosong
  const category_id = 'default_cat_id' // Idealnya diambil dari dropdown kategri
  
  // Ambil JSON gambar dari input hidden (diisi oleh uploader JS di client-side)
  const images_json = formData.get('images_json') as string || '[]'

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
  const productId = generateId()

  try {
    await db.prepare(`
      INSERT INTO products (id, store_id, category_id, slug, name, brand, condition, description, price, stock, is_active, images_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(productId, store.id, category_id, slug, name, brand, condition, description, price, stock, images_json).run()

    return c.redirect('/seller?success=1')
  } catch (error) {
    return c.redirect('/seller/products/new?err=1')
  }
})

export default createRoute(async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  return c.render(
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
        <a href="/seller" className="text-sm font-bold text-gray-500 hover:text-black">← Kembali ke Dasbor</a>
      </div>

      <form action="/seller/products/new" method="POST" className="bg-white p-8 rounded-sm shadow-sm border border-gray-200 space-y-6">
        
        {/* Placeholder untuk URL Gambar yang diupload */}
        <input type="hidden" name="images_json" id="images_json_input" value="[]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Produk</label>
            <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="Contoh: Balenciaga City Bag Black" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Brand (Merek)</label>
            <input type="text" name="brand" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="Contoh: Balenciaga" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kondisi</label>
            <select name="condition" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black bg-white">
              <option value="Brand New">Brand New</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Harga (Rp)</label>
            <input type="number" name="price" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="Tanpa titik, contoh: 5000000" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Stok</label>
            <input type="number" name="stock" required defaultValue="1" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Deskripsi Produk & Kelengkapan</label>
          <textarea name="description" rows={5} required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black" placeholder="Jelaskan kondisi detail, minus (jika ada), dan kelengkapan (Box, Dustbag, dll)"></textarea>
        </div>

        {/* Info Upload Gambar */}
        <div className="bg-gray-50 p-4 border border-dashed border-gray-300 rounded-sm text-sm text-gray-500">
           💡 <strong>Catatan:</strong> Fitur unggah gambar multi-file akan memanggil fungsi integrasi Cloudinary yang sudah dibuat di sisi Admin.
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-black text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors">
            Simpan Produk
          </button>
        </div>
      </form>
    </div>
  )
})
