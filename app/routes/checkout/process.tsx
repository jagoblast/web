import { createRoute } from 'honox/factory'
import { generateId } from '../../utils/admin_utils'

export default createRoute(async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  
  const cartDataRaw = formData.get('cart_data') as string
  const address = formData.get('address') as string
  const paymentMethod = formData.get('payment_method') as string || 'automatic'
  
  if (!cartDataRaw) return c.redirect('/checkout?err=empty_cart')
  
  const cart = JSON.parse(cartDataRaw)
  let totalAmount = 0
  const validCartItems = []

  // VALIDASI KEAMANAN: Ambil harga langsung dari database, BUKAN dari frontend
  for (const item of cart) {
    const product = await db.prepare("SELECT id, price, stock FROM products WHERE id = ?").bind(item.id).first()
    
    if (!product) continue 
    if (product.stock < item.quantity) {
       return c.redirect('/checkout?err=out_of_stock')
    }

    // Kalkulasi menggunakan harga asli dari database
    totalAmount += (product.price * item.quantity)
    validCartItems.push({
      id: product.id,
      quantity: item.quantity,
      price: product.price 
    })
  }

  if (validCartItems.length === 0) return c.redirect('/checkout?err=invalid_items')

  const orderId = generateId()
  // Jika ada sistem login, ganti 'guest' dengan ID pengguna yang sedang login
  const userId = 'guest' 

  // 1. Simpan Order ke Database
  await db.prepare(`
    INSERT INTO orders (id, user_id, status, total_amount, shipping_address, payment_method)
    VALUES (?, ?, 'PENDING', ?, ?, ?)
  `).bind(orderId, userId, totalAmount, address, paymentMethod).run()

  // 2. Simpan Detail Item Order
  for (const item of validCartItems) {
    await db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `).bind(generateId(), orderId, item.id, item.quantity, item.price).run()
  }

  // 3. Percabangan Alur Pembayaran
  if (paymentMethod === 'manual') {
    // Bypass payment gateway, langsung ke halaman sukses dengan parameter manual
    return c.redirect(`/checkout/success?order_id=${orderId}&method=manual`)
  } else {
    // Logika Payment Gateway Otomatis Anda sebelumnya (misal: 101PayAsia/Stripe)
    // PASTIKAN API Key dipanggil dari c.env, bukan hardcoded!
    // const apiKey = c.env.PAYMENT_API_KEY; 
    
    // ... Logika eksekusi cURL / fetch ke API pihak ketiga ...
    
    return c.redirect(`/checkout/success?order_id=${orderId}&method=auto`)
  }
})
