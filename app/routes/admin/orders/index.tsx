import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  let orders: any[] = [];
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    orders = results || [];
  } catch (e) {
    orders = [];
  }

  const formatIDR = (p: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0);

  return c.render(
    <div class="max-w-[1200px] mx-auto py-10 px-6">
      <div class="flex items-center justify-between mb-12 border-b border-neutral-100 pb-8">
        <div>
          <h1 class="text-3xl font-serif italic tracking-widest uppercase">Order Management</h1>
          <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] mt-2">View and manage customer transactions</p>
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
                <td colSpan={5} class="py-12 text-center text-[10px] uppercase tracking-widest text-neutral-400">No orders available.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr class="border-b border-neutral-100 hover:bg-neutral-50 transition">
                  <td class="py-5 px-6 text-[10px] font-mono tracking-widest uppercase text-neutral-600">{order.id}</td>
                  <td class="py-5 px-6 text-[10px] tracking-widest text-neutral-500">{new Date(order.created_at).toLocaleString('en-GB')}</td>
                  <td class="py-5 px-6">
                    <p class="text-[10px] font-bold uppercase tracking-widest">{order.customer_name}</p>
                    <p class="text-[9px] tracking-widest text-neutral-400 mt-1">{order.customer_email}</p>
                  </td>
                  <td class="py-5 px-6 text-[11px] font-bold italic tracking-widest">{formatIDR(order.total_amount)}</td>
                  <td class="py-5 px-6">
                    <select 
                      data-order-id={order.id}
                      class="order-status-select bg-transparent border border-neutral-300 text-[9px] font-bold uppercase tracking-widest py-2 px-3 outline-none focus:border-black cursor-pointer"
                    >
                      <option value="PENDING" selected={order.status === 'PENDING'}>PENDING</option>
                      <option value="PAID" selected={order.status === 'PAID'}>PAID</option>
                      <option value="SHIPPED" selected={order.status === 'SHIPPED'}>SHIPPED</option>
                      <option value="COMPLETED" selected={order.status === 'COMPLETED'}>COMPLETED</option>
                      <option value="CANCELLED" selected={order.status === 'CANCELLED'}>CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))
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
            } else {
              alert('Failed to update status');
            }
          });
        });
      `}} />
    </div>,
    { title: 'Orders | Admin Visoe' }
  );
});