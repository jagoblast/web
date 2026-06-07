import { createRoute } from 'honox/factory'
import { getAuthUser } from '../../../utils/auth'
import { createSlug } from '../../../utils/catalog'
import { generateId } from '../../../utils/admin_utils'

// --- HANDLER POST: SIMPAN PRODUK ---
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
  
  // URL gambar yang sudah diupload
  const imageUrl = formData.get('image_url') as string
  const images_json = JSON.stringify(imageUrl ? [imageUrl] : [])

  const id = 'PRD-' + generateId().substring(0, 8).toUpperCase()
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

  const { results: categories } = await db.prepare("SELECT id, name FROM categories ORDER BY name ASC").all()
  const error = c.req.query('err')

  return c.render(
    <div className="py-8 px-6 md:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold uppercase tracking-widest">Tambah Produk Toko</h1>
        </div>

        {error && <div className="bg-red-50 p-4 border border-red-200 text-red-700 font-bold text-sm">Error: {error}</div>}

        <form action="/seller/products/new" method="POST" className="bg-white p-8 rounded-sm shadow-sm border border-gray-200 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Produk *</label>
              <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kategori *</label>
              <select name="category_id" required className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm bg-white">
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* UPLOAD GAMBAR */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gambar Produk *</label>
            <div className="flex items-center space-x-4">
               <div className="w-20 h-20 border border-gray-300 rounded-sm flex items-center justify-center overflow-hidden bg-gray-50">
                 <img id="img_preview" src="/placeholder.jpg" className="w-full h-full object-cover" />
               </div>
               <input type="hidden" name="image_url" id="image_url" required />
               <input type="file" id="file_input" accept="image/*" className="hidden" 
                 onChange="uploadImage()" />
               <button type="button" onClick="document.getElementById('file_input').click()" 
                 className="bg-gray-100 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-200">Pilih Gambar</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Harga (Rp)</label>
              <input type="number" name="price" required className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Stok</label>
              <input type="number" name="stock" required defaultValue="1" className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Berat (Gram)</label>
              <input type="number" name="weight" required defaultValue="500" className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm" />
            </div>
          </div>

          <textarea name="description" rows={4} required className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm" placeholder="Deskripsi produk..."></textarea>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" name="is_digital" />
              <span className="text-sm font-bold">Produk Digital (Tanpa Ongkir)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" name="is_active" defaultChecked />
              <span className="text-sm font-bold">Aktifkan Produk</span>
            </label>
          </div>

          <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-800">
            Simpan Produk
          </button>
        </form>

        {/* Script AJAX Upload */}
        <script dangerouslySetInnerHTML={{__html: `
          async function uploadImage() {
            const file = document.getElementById('file_input').files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
              document.getElementById('image_url').value = data.url;
              document.getElementById('img_preview').src = data.url;
            } else {
              alert('Gagal upload gambar');
            }
          }
        `}} />
      </div>
    </div>
  )
})
