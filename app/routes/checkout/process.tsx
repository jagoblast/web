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
  const validCartItems = []
  let totalItemsPrice = 0

  for (const item of cart) {
    const product = await db.prepare("SELECT id, price, stock, store_id FROM products WHERE id = ?").bind(item.id).first()
    if (!product) continue 
    if (product.stock < item.quantity) return c.redirect('/checkout?err=out_of_stock')
    
    totalItemsPrice += (product.price * item.quantity)
    validCartItems.push({ 
      id: product.id, 
      quantity: item.quantity, 
      price: product.price,
      store_id: product.store_id 
    })
  }

  if (validCartItems.length === 0) return c.redirect('/checkout?err=invalid_items')

  const groupedByStore = validCartItems.reduce((acc, item) => {
    if (!acc[item.store_id]) acc[item.store_id] = []
    acc[item.store_id].push(item)
    return acc
  }, {})

  // 1. HITUNG BIAYA ADMIN
  const settings = await db.prepare("SELECT admin_fee_type, admin_fee_value FROM platform_settings LIMIT 1").first()
  let adminFee = 0
  if (settings) {
     if (settings.admin_fee_type === 'percentage') {
        adminFee = Math.round(totalItemsPrice * (settings.admin_fee_value / 100))
     } else {
        adminFee = settings.admin_fee_value
     }
  }

  // 2. LOGIKA USER (GUEST/LOGIN)
  let currentUser = await getAuthUser(c)
  let finalUserId = 'guest'
  if (currentUser) {
    finalUserId = currentUser.id
  } else {
    // ... Logika registrasi guest disederhanakan untuk contoh
    finalUserId = 'USR-' + generateId().substring(0, 8).toUpperCase()
    await db.prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'customer')`)
            .bind(finalUserId, formData.get('name'), formData.get('email'), await hashPassword(formData.get('password'))).run()
  }

  const parentOrderId = generateId()
  let totalShippingFee = 0 // Akan diisi dari loop toko
  
  // 3. LOOP TOKO: HITUNG ONGKIR & BUAT PESANAN TOKO
  const storeOrdersData = []
  for (const storeId in groupedByStore) {
    const storeOrderId = generateId()
    const storeItems = groupedByStore[storeId]
    
    // Disini tempat tembak API RajaOngkir multi-origin
    const dummyShippingCost = 15000 
    totalShippingFee += dummyShippingCost

    // GENERATE RESI OTOMATIS (AWB) DARI SISTEM
    const autoResi = `AWB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    storeOrdersData.push({ storeOrderId, storeId, dummyShippingCost, autoResi, storeItems })
  }

  const grandTotal = totalItemsPrice + totalShippingFee + adminFee

  // 4. SIMPAN PARENT ORDER
  await db.prepare(`
    INSERT INTO orders (id, user_id, status, total_items_price, total_shipping_fee, admin_fee, grand_total, shipping_address, payment_method)
    VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)
  `).bind(parentOrderId, finalUserId, totalItemsPrice, totalShippingFee, adminFee, grandTotal, address, paymentMethod).run()

  // 5. SIMPAN CHILD ORDERS & WALLET PENDING LOGIC
  for (const data of storeOrdersData) {
    await db.prepare(`
      INSERT INTO store_orders (id, order_id, store_id, shipping_courier, shipping_cost, tracking_number, status)
      VALUES (?, ?, ?, 'JNE', ?, ?, 'pending')
    `).bind(data.storeOrderId, parentOrderId, data.storeId, data.dummyShippingCost, data.autoResi).run()

    let storeTotalIncome = 0

    for (const item of data.storeItems) {
      await db.prepare(`
        INSERT INTO order_items (id, order_id, store_order_id, product_id, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(generateId(), parentOrderId, data.storeOrderId, item.id, item.quantity, item.price).run()
      storeTotalIncome += (item.price * item.quantity)
    }

    // Pastikan dompet vendor ada, jika belum buat baru
    await db.prepare(`INSERT OR IGNORE INTO vendor_wallets (id, store_id, pending_balance, available_balance) VALUES (?, ?, 0, 0)`)
            .bind(generateId(), data.storeId).run()

    // Tambahkan dana ke PENDING BALANCE Vendor
    await db.prepare(`UPDATE vendor_wallets SET pending_balance = pending_balance + ? WHERE store_id = ?`)
            .bind(storeTotalIncome, data.storeId).run()
  }

  return c.redirect(`/checkout/success?order_id=${parentOrderId}&method=${paymentMethod}`)
})
