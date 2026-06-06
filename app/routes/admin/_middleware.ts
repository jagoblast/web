import { basicAuth } from 'hono/basic-auth'
export const middleware = [
  basicAuth({ username: 'admin', password: 'password_rahasia' })
]