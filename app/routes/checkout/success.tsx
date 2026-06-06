import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const db = c.env.DB
  const orderId = c.req.query('order_id')
  const method = c.req.query('method')

  if (!orderId) return c.redirect('/')

  // Ambil total harga order
  const order = await db.prepare("SELECT total_amount FROM orders WHERE id = ?").bind(orderId).first()
  
  let bankInfo = null
  // Jika pembayarannya manual, tarik data rekening dari tabel store_settings
  if (method === 'manual') {
    const settings = await db.prepare("SELECT config_json FROM store_settings WHERE id = 'GLOBAL'").first()
    if (settings && settings.config_json) {
      const config = JSON.parse(settings.config_json as string)
      bankInfo = {
        bankName: config.bank_name || 'Bank Belum Diatur',
        accountNumber: config.bank_account_number || '-',
        accountName: config.bank_account_name || '-'
      }
    }
  }

  return c.render(
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h1>
      <p className="text-gray-600 mb-8 text-lg">Terima kasih. ID Pesanan Anda: <strong className="text-black bg-gray-100 px-2 py-1 rounded">{orderId}</strong></p>

      {/* Blok Instruksi Transfer Manual */}
      {method === 'manual' && bankInfo && (
        <div className="bg-blue-50 border border-blue-200 p-8 rounded-lg text-left mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-200 pb-2">Instruksi Pembayaran Manual</h2>
          <p className="text-blue-800 mb-6">Silakan lakukan transfer tepat sebesar <strong className="text-2xl block mt-2 text-black">Rp {order?.total_amount?.toLocaleString('id-ID')}</strong> ke rekening berikut:</p>
          
          <div className="bg-white p-6 rounded border border-blue-100 shadow-sm">
            <p className="text-sm text-gray-500 uppercase tracking-wider">Bank</p>
            <p className="font-bold text-xl mb-4 text-gray-900">{bankInfo.bankName}</p>
            
            <p className="text-sm text-gray-500 uppercase tracking-wider">Nomor Rekening</p>
            <p className="font-bold text-2xl mb-4 text-blue-700 tracking-widest">{bankInfo.accountNumber}</p>
            
            <p className="text-sm text-gray-500 uppercase tracking-wider">Atas Nama Pemilik</p>
            <p className="font-bold text-xl text-gray-900">{bankInfo.accountName}</p>
          </div>
          
          <p className="text-sm text-blue-800 mt-6 bg-blue-100 p-3 rounded">
            💡 Setelah mentransfer, pesanan Anda akan diverifikasi dan diproses oleh tim kami.
          </p>
        </div>
      )}

      <a href="/" className="inline-block bg-black text-white px-8 py-4 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-md">
        Kembali ke Beranda
      </a>
    </div>
  )
})
