import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  return c.render(
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>
      
      <form action="/checkout/process" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* State Keranjang - Pastikan value ini diisi secara dinamis melalui script sisi klien (client.ts) */}
        <input type="hidden" name="cart_data" id="cartDataInput" value="[]" />

        {/* Form Informasi Pengiriman */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informasi Pengiriman</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea 
              name="address" 
              required 
              rows={4} 
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" 
              placeholder="Jalan, RT/RW, Kota, Kode Pos"
            ></textarea>
          </div>
        </div>

        {/* Form Metode Pembayaran */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Metode Pembayaran</h2>
            <div className="space-y-3 mt-4">
              <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="payment_method" value="automatic" className="h-4 w-4 text-black focus:ring-black" defaultChecked />
                <span className="ml-3 font-medium text-gray-900">Pembayaran Otomatis (Virtual Account/CC)</span>
              </label>
              
              <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="payment_method" value="manual" className="h-4 w-4 text-black focus:ring-black" />
                <span className="ml-3 font-medium text-gray-900">Transfer Bank Manual</span>
              </label>
            </div>
          </div>

          <button type="submit" className="mt-8 w-full bg-black text-white py-4 px-4 rounded-md hover:bg-gray-800 font-bold uppercase tracking-wide transition-colors">
            Selesaikan Pesanan
          </button>
        </div>
      </form>
    </div>
  )
})
