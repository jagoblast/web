import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  let totalProducts = 0;
  let totalOrders = 0;
  let totalRevenue = 0;
  let recentOrders: any[] = [];

  try {
    const pRes = await c.env.DB.prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1").first();
    totalProducts = pRes?.count || 0;

    const oRes = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders").first();
    totalOrders = oRes?.count || 0;

    const rRes = await c.env.DB.prepare("SELECT SUM(total_amount) as sum FROM orders WHERE status != 'cancelled'").first();
    totalRevenue = rRes?.sum || 0;

    // Ambil order beserta nama user-nya
    const { results } = await c.env.DB.prepare(`
      SELECT o.*, u.name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC LIMIT 5
    `).all();
    recentOrders = results || [];
  } catch (e) {
    console.log("Database might not be fully initialized:", e);
  }

  const formatIDR = (p: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0);

  return c.render(
    <div class="max-w-[1200px] mx-auto py-10 px-6">
      <div class="mb-12 border-b border-neutral-100 pb-8">
        <h1 class="text-3xl font-serif italic tracking-widest uppercase">Admin Overview</h1>
        <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] mt-2">Welcome to Visoe Luxury Dashboard</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div class="p-8 border border-neutral-100 bg-neutral-50 shadow-sm flex flex-col justify-center items-center text-center space-y-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Total Revenue</p>
          <h3 class="text-2xl font-serif italic tracking-widest">{formatIDR(totalRevenue)}</h3>
        </div>
        <div class="p-8 border border-neutral-100 bg-neutral-50 shadow-sm flex flex-col justify-center items-center text-center space-y-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Total Orders</p>
          <h3 class="text-2xl font-serif italic tracking-widest">{totalOrders}</h3>
        </div>
        <div class="p-8 border border-neutral-100 bg-neutral-50 shadow-sm flex flex-col justify-center items-center text-center space-y-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Active Products</p>
          <h3 class="text-2xl font-serif italic tracking-widest">{totalProducts}</h3>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex justify-between items-end border-b border-neutral-100 pb-4">
          <h2 class="text-[11px] font-bold uppercase tracking-[0.3em]">Recent Transactions</h2>
          <a href="/admin/orders" class="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition">View All Orders</a>
        </div>
        
        <div class="overflow-x-auto bg-white border border-neutral-100 shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-neutral-50 border-b border-neutral-200">
                <th class="py-4 px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Order ID</th>
                <th class="py-4 px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Date</th>
                <th class="py-4 px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Customer</th>
                <th class="py-4 px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Amount</th>
                <th class="py-4 px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} class="py-8 text-center text-[10px] uppercase tracking-widest text-neutral-400">No orders found.</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr class="border-b border-neutral-100 hover:bg-neutral-50 transition">
                    <td class="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-neutral-600">{order.id}</td>
                    <td class="py-4 px-6 text-[10px] tracking-widest text-neutral-500">{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                    <td class="py-4 px-6 text-[10px] font-bold tracking-widest uppercase">{order.customer_name || 'Guest'}</td>
                    <td class="py-4 px-6 text-[10px] font-bold italic tracking-widest">{formatIDR(order.total_amount)}</td>
                    <td class="py-4 px-6">
                      <span class={`px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-neutral-200 text-neutral-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    { title: 'Dashboard | Admin' }
  );
});