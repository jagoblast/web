import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../../utils/auth'
import { createSlug } from '../../../utils/catalog'
import { generateId } from '../../../utils/admin_utils'

// --- HANDLER POST: SIMPAN PRODUK KE DATABASE ---
export const POST = createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const store = await db.prepare("SELECT id FROM stores WHERE user_id = ?").bind(user.id).first()
  if (!store) return c.redirect('/seller/register')

  const formData = await c.req.formData()
  
  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const brand = formData.get('brand') as string || 'No Brand'
  const condition = formData.get('condition') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const weight = parseInt(formData.get('weight') as string) || 500
  const is_digital = formData.get('is_digital') === 'on' ? 1 : 0
  const is_active = formData.get('is_active') === 'on' ? 1 : 0
  
  // Untuk gambar utama
  const imageUrl = formData.get('image_url') as string
  const images_json = JSON.stringify(imageUrl ? [imageUrl] : [])

  const id = 'PRD-' + generateId().substring(0, 8).toUpperCase()
  // Tambahkan random string di slug untuk menghindari duplikat nama
  const slug = createSlug(name) + '-' + generateId().substring(0, 4)

  try {
    await db.prepare(`
      INSERT INTO products (
        id, category_id, slug, name, brand, condition, description, 
        price, stock, weight, is_active, images_json, is_digital, store_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, category_id, slug, name, brand, condition, description,
      price, stock, weight, is_active, images_json, is_digital, store.id
    ).run()

    return c.redirect('/seller/products')
  } catch (err: any) {
    return c.redirect(`/seller/products/new?err=${encodeURIComponent(err.message)}`)
  }
})


// --- HANDLER GET: TAMPILKAN FORM ---
export default createRoute(async (c) => {
  const db = c.env.DB
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login')

  const store = await db.prepare("SELECT id FROM stores WHERE user_id = ?").bind(user.id).first()
  if (!store) return c.redirect('/seller/register')

  // Ambil semua kategori dari database
  const { results: categories } = await db.prepare("SELECT id, name FROM categories ORDER BY name ASC").all()
  
  const error = c.req.query('err')

  return c.render(
    <div className="py-8 px-6 md:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
             <p className="text-sm text-gray-500 mt-1">Masukkan detail produk yang ingin Anda jual.</p>
          </div>
          <a href="/seller/products" className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest">
            Batal & Kembali
          </a>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-sm shadow-sm text-red-700 text-sm font-bold">
            ⚠ Error: {error}
          </div>
        )}

        <form action="/seller/products/new" method="POST" className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Produk *</label>
              <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm" placeholder="Contoh: Sepatu Sneakers Pria" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kategori *</label>
              <select name="category_id" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm bg-white">
                <option value="" disabled selected>-- Pilih Kategori --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">URL Gambar Utama *</label>
              <input type="url" name="image_url" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm" placeholder="https://..." />
              <p className="text-[10px] text-gray-400 mt-1">Gunakan URL gambar (misal dari hasil upload di pengaturan).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-100 pb-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Harga (Rp) *</label>
              <input type="number" name="price" required min="1" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm font-bold" placeholder="150000" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Stok Tersedia *</label>
              <input type="number" name="stock" required min="1" defaultValue="1" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Berat (Gram) *</label>
              <input type="number" name="weight" required min="1" defaultValue="500" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Brand / Merek</label>
              <input type="text" name="brand" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm" placeholder="Contoh: Nike, Adidas, Tanpa Merek" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kondisi *</label>
              <select name="condition" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm bg-white">
                <option value="Baru">Baru (New)</option>
                <option value="Bekas">Bekas (Pre-loved)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Deskripsi Produk *</label>
              <textarea name="description" rows={6} required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-black text-sm" placeholder="Jelaskan detail spesifikasi, bahan, dan keunggulan produk Anda..."></textarea>
            </div>
          </div>

          {/* OPSI TAMBAHAN */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-4 rounded-sm border border-gray-200">
              <input type="checkbox" name="is_digital" className="w-5 h-5 text-black rounded-sm border-gray-300 focus:ring-black" />
              <div>
                <div className="font-bold text-sm text-gray-900">Ini adalah Produk Digital (E-book, Voucher, Jasa)</div>
                <div className="text-xs text-gray-500">Centang opsi ini agar pembeli tidak dikenakan ongkos kirim.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer bg-green-50 p-4 rounded-sm border border-green-200">
              <input type="checkbox" name="is_active" defaultChecked className="w-5 h-5 text-green-600 rounded-sm border-green-300 focus:ring-green-600" />
              <div>
                <div className="font-bold text-sm text-green-900">Langsung Aktifkan Produk</div>
                <div className="text-xs text-green-700">Produk akan langsung tayang di etalase toko Anda. Hapus centang jika ingin menyimpannya sebagai Draft.</div>
              </div>
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-black text-white px-10 py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-md">
              Simpan & Tayangkan Produk
            </button>
          </div>
        </form>

      </div>
    </div>
  )
})
