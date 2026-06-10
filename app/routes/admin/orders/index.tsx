import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  let orders: any[] = [];
  
  // 1. Tangkap parameter status dari URL (contoh: ?status=pending)
  const statusParam = c.req.query('status');

  try {
    if (statusParam) {
      if (statusParam === 'confirmed') {
        // Menggabungkan status PAID dan COMPLETED (Case-insensitive)
        const { results } = await c.env.DB.prepare(`
          SELECT o.id, o.created_at, o.grand_total as total_amount, o.status,
                 u.name as customer_name, u.email as customer_email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE LOWER(o.status) IN ('paid', 'completed') 
          ORDER BY o.created_at DESC
        `).all();
        orders = results || [];
      } else {
        // Pencarian aman tanpa peduli huruf besar/kecil di database
        const { results } = await c.env.DB.prepare(`
          SELECT o.id, o.created_at, o.grand_total as total_amount, o.status,
                 u.name as customer_name, u.email as customer_email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE LOWER(o.status) = LOWER(?)
          ORDER BY o.created_at DESC
        `).bind(statusParam).all();
        orders = results || [];
      }
    } else {
      // Tampilkan semua jika tidak ada filter
      const { results } = await c.env.DB.prepare(`
        SELECT o.id, o.created_at, o.grand_total as total_amount, o.status,
               u.name as customer_name, u.email as customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `).all();
      orders = results || [];
    }
  } catch (e) {
    console.error("Order Fetch Error:", e);
    orders = [];
  }

  const formatIDR = (p: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0);

  return c.render(
    <div class="max-w-[1200px] mx-auto py-10 px-6">
      <div class="flex items-center justify-between mb-12 border-b border-neutral-100 pb-8">
        <div>
          <h1 class="text-3xl font-serif italic tracking-widest uppercase">Order Management</h1>
          <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] mt-2">
            {statusParam ? `Menampilkan pesanan: ${statusParam.toUpperCase()}` : 'View and manage customer transactions'}
          </p>
        </div>
      </div>

      <div class="overflow-x-auto bg-white border border-neutral-100 shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-neutral-50 border-b border-neutral-200">
              <th class="py-5 px-6 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Order ID</th>
              <th class="py-5 px-6 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Date</th>
              <th class="py-5 px-6 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Customer Details</th>
              <th class="py-5 px-6 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Total</th>
              <th class="py-5 px-6 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Status Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} class="py-12 text-center text-[10px] uppercase tracking-widest text-neutral-400">No orders available for this status.</td>
              </tr>
            ) : (
              orders.map((order) => {
                // Amankan status ke huruf kecil untuk perbandingan
                const currentStatus = (order.status || 'pending').toLowerCase();
                
                return (
                  <tr key={order.id} class="border-b border-neutral-100 hover:bg-neutral-50 transition">
                    <td class="py-5 px-6 text-[10px] font-mono tracking-widest uppercase text-neutral-600">{order.id}</td>
                    <td class="py-5 px-6 text-[10px] tracking-widest text-neutral-500">{new Date(order.created_at).toLocaleString('en-GB')}</td>
                    <td class="py-5 px-6">
                      <p class="text-[10px] font-bold uppercase tracking-widest">{order.customer_name || 'Unknown User'}</p>
                      <p class="text-[9px] tracking-widest text-neutral-400 mt-1">{order.customer_email || 'No email'}</p>
                    </td>
                    <td class="py-5 px-6 text-[11px] font-bold italic tracking-widest">{formatIDR(order.total_amount)}</td>
                    <td class="py-5 px-6">
                      {/* Pastikan value yang dikirim huruf kecil agar sesuai format database Anda */}
                      <select 
                        data-order-id={order.id}
                        class="order-status-select bg-transparent border border-neutral-300 text-[9px] font-bold uppercase tracking-widest py-2 px-3 outline-none focus:border-black cursor-pointer"
                      >
                        <option value="pending" selected={currentStatus === 'pending'}>PENDING</option>
                        <option value="paid" selected={currentStatus === 'paid'}>PAID</option>
                        <option value="shipped" selected={currentStatus === 'shipped'}>SHIPPED</option>
                        <option value="completed" selected={currentStatus === 'completed'}>COMPLETED</option>
                        <option value="cancelled" selected={currentStatus === 'cancelled'}>CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.order-status-select').forEach(select => {
          select.addEventListener('change', async (e) => {
            const orderId = e.target.getAttribute('data-order-id');
            const newStatus = e.target.value;
            
            const res = await fetch('/api/orders/update-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: orderId, status: newStatus })
            });
            
            if(res.ok) {
              alert('Status updated successfully');
              window.location.reload(); 
            } else {
              alert('Failed to update status');
            }
          });
        });
      `}} />
    </div>,
    { title: 'Orders | Admin' }
  );
});
