import { createRoute } from 'honox/factory'
import { generateId } from '../../utils/admin_utils'
import { getAuthUser } from '../../utils/auth'

export default createRoute(async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  const user = await getAuthUser(c)
  
  if (!user) return c.redirect('/login?err=must_login')

  const cartDataRaw = formData.get('cart_data') as string
  const address = formData.get('address') as string
  const paymentMethod = formData.get('payment_method') as string || 'automatic'
  
  if (!cartDataRaw) return c.redirect('/checkout?err=empty_cart')
  const cart = JSON.parse(cartDataRaw)
  
  let itemsPriceTotal = 0
  const validCartItems = []
  
  for (const item of cart) {
    const product = await db.prepare("SELECT id, price, stock, store_id, is_digital FROM products WHERE id = ?").bind(item.id).first()
    if (!product || product.stock < item.quantity) return c.redirect('/checkout?err=invalid_stock')
    
    itemsPriceTotal += (product.price * item.quantity)
    validCartItems.push({ 
      id: product.id, 
      quantity: item.quantity, 
      price: product.price, 
      store_id: product.store_id,
      is_digital: product.is_digital || 0
    })
  }

  const settings = await db.prepare("SELECT admin_fee_value FROM platform_settings ORDER BY id DESC LIMIT 1").first()
  const adminFee = settings ? settings.admin_fee_value : 2500
  
  // Ongkir Gratis jika SEMUA produk adalah produk digital (is_digital = 1)
  const hasPhysicalProduct = validCartItems.some(item => item.is_digital === 0)
  const totalShippingFee = hasPhysicalProduct ? 15000 : 0 

  const grandTotal = itemsPriceTotal + totalShippingFee + adminFee
  const orderId = 'ORD-' + generateId().substring(0, 10).toUpperCase()

  await db.prepare(`
    INSERT INTO orders (id, user_id, status, total_items_price, total_shipping_fee, admin_fee, grand_total, shipping_address, payment_method)
    VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)
  `).bind(orderId, user.id, itemsPriceTotal, totalShippingFee, adminFee, grandTotal, address, paymentMethod).run()

  const storeGroups = validCartItems.reduce((acc, item) => {
    if (!acc[item.store_id]) acc[item.store_id] = []
    acc[item.store_id].push(item)
    return acc
  }, {})

  for (const storeId of Object.keys(storeGroups)) {
    const storeOrderId = 'SO-' + generateId().substring(0, 8).toUpperCase()
    
    await db.prepare(`
      INSERT INTO store_orders (id, order_id, store_id, status)
      VALUES (?, ?, ?, 'pending')
    `).bind(storeOrderId, orderId, storeId).run()

    for (const item of storeGroups[storeId]) {
      await db.prepare(`
        INSERT INTO order_items (id, order_id, store_order_id, product_id, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(generateId(), orderId, storeOrderId, item.id, item.quantity, item.price).run()
    }
  }

  return c.redirect(`/checkout/success?order_id=${orderId}`)
})
