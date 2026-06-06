import { createRoute } from 'honox/factory'
import { generateId } from '../../utils/admin_utils'
import { getAuthUser, hashPassword, createToken, setAuthCookie } from '../../utils/auth'

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

  // VALIDASI HARGA & STOK
  for (const item of cart) {
    const product = await db.prepare("SELECT id, price, stock FROM products WHERE id = ?").bind(item.id).first()
    if (!product) continue 
    if (product.stock < item.quantity) {
       return c.redirect('/checkout?err=out_of_stock')
    }
    totalAmount += (product.price * item.quantity)
    validCartItems.push({ id: product.id, quantity: item.quantity, price: product.price })
  }

  if (validCartItems.length === 0) return c.redirect('/checkout?err=invalid_items')

  const orderId = generateId()
  
  // === LOGIKA PENDAFTARAN CHECKOUT ALA WOOCOMMERCE ===
  let currentUser = await getAuthUser(c)
  let finalUserId = 'guest'

  if (currentUser) {
    // Jika sudah login, gunakan ID mereka
    finalUserId = currentUser.id
  } else {
    // Jika belum login, tangkap data pendaftaran dari form
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (name && email && password) {
      try {
        finalUserId = 'USR-' + generateId().substring(0, 8).toUpperCase()
        const hashed = await hashPassword(password)

        // 1. Simpan pengguna baru ke database
        await db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role)
          VALUES (?, ?, ?, ?, 'customer')
        `).bind(finalUserId, name, email, hashed).run()

        // 2. Langsung loginkan pengguna di latar belakang
        const token = await createToken(c, { id: finalUserId, role: 'customer', name: name })
        setAuthCookie(c, token)
        
      } catch (error) {
        // Jika gagal karena email bentrok (UNIQUE constraint gagal)
        return c.redirect('/checkout?err=email_terdaftar')
      }
    }
  }

  // === SIMPAN PESANAN KE DATABASE ===
  await db.prepare(`
    INSERT INTO orders (id, user_id, status, total_amount, shipping_address, payment_method)
    VALUES (?, ?, 'PENDING', ?, ?, ?)
  `).bind(orderId, finalUserId, totalAmount, address, paymentMethod).run()

  for (const item of validCartItems) {
    await db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `).bind(generateId(), orderId, item.id, item.quantity, item.price).run()
  }

  // === PERCABANGAN METODE PEMBAYARAN ===
  if (paymentMethod === 'manual') {
    return c.redirect(`/checkout/success?order_id=${orderId}&method=manual`)
  } else {
    // Integrasi Gateway Pembayaran Otomatis...
    return c.redirect(`/checkout/success?order_id=${orderId}&method=auto`)
  }
})
