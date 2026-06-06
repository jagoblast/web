import { createRoute } from 'honox/factory';
import { generateId } from '../../utils/admin_utils';
import { getAuthUser } from '../../utils/auth';

export const POST = createRoute(async (c) => {
  const formData = await c.req.parseBody();
  const db = c.env.DB;
  const user = await getAuthUser(c);

  const name = formData.name as string;
  const email = formData.email as string;
  const phone = formData.phone as string;
  const address = formData.address as string;
  const cartDataRaw = formData.cart_data as string;

  if (!cartDataRaw) return c.redirect('/checkout');

  const cart = JSON.parse(cartDataRaw) as any[];
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orderId = 'ORD-' + Date.now().toString().substring(5) + generateId().substring(0, 4).toUpperCase();
  
  let finalUserId = user ? user.id : 'GUEST-' + generateId();

  if (!user) {
    await db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, address)
      VALUES (?, ?, ?, ?, 'customer', ?, ?)
      ON CONFLICT(email) DO UPDATE SET name=excluded.name, phone=excluded.phone, address=excluded.address
    `).bind(finalUserId, name, email, 'guest-account', phone, address).run();
    const ur: any = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    finalUserId = ur ? ur.id : finalUserId;
  }

  // 1. Insert Order (Tanpa payment_url dulu)
  await db.prepare(`
    INSERT INTO orders (id, user_id, status, total_amount, shipping_address, payment_method)
    VALUES (?, ?, 'PENDING', ?, ?, 'card_fullpayment')
  `).bind(orderId, finalUserId, totalAmount, address).run();

  for (const item of cart) {
    await db.prepare(`INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)`)
      .bind(generateId(), orderId, item.id, item.quantity, item.price).run();
  }

  const API_KEY = c.env.PAY101_API_KEY || 'sk_live_Yuqu1tHOYRVF8XIgqsZULd0GyDVX5f4e';
  const PROJECT_ID = c.env.PAY101_PROJECT_ID || '16';

  try {
    const payRes = await fetch('https://101payasia.com/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-Project-ID': PROJECT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: totalAmount,
        payment_method: 'card_fullpayment',
        reference_id: orderId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone
      })
    });

    const payData: any = await payRes.json();

    // 2. Jika sukses, UPDATE payment_url ke tabel orders
    if (payData.success && payData.data?.checkout_url) {
      const checkoutUrl = payData.data.checkout_url;
      await db.prepare("UPDATE orders SET payment_url = ? WHERE id = ?").bind(checkoutUrl, orderId).run();
      
      return c.redirect(`/checkout/success?order_id=${orderId}&pay_url=${encodeURIComponent(checkoutUrl)}`);
    } else {
      return c.redirect(`/checkout/success?order_id=${orderId}&err=payment_init_failed`);
    }
  } catch(e) {
    return c.redirect(`/checkout/success?order_id=${orderId}&err=gateway_timeout`);
  }
});