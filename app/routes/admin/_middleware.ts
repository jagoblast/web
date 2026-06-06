import { createMiddleware } from 'hono/factory'
import { getAuthUser } from '../../utils/auth'

export const middleware = createMiddleware(async (c, next) => {
  // 1. Verifikasi JWT Enskripsi HS256
  const user = await getAuthUser(c)
  
  // 2. Otorisasi Ketat Berbasis Role Database
  if (!user || user.role !== 'admin') {
    // Anda bisa melempar error 403 atau melempar mereka kembali ke login
    return c.text('403 Forbidden: Anda bukan Administrator ShopinId.', 403)
  }
  
  await next()
})
