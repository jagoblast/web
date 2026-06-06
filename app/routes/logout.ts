import { createRoute } from 'honox/factory'
import { logoutUser } from '../utils/auth'

export default createRoute(async (c) => {
  // Panggil fungsi hapus cookie dari auth.ts
  logoutUser(c)
  
  // Arahkan kembali ke halaman beranda setelah keluar
  return c.redirect('/')
})
