import * as session from 'express-session'
import { CONFIG, isProduction } from '../helpers/config'
import { Redis } from '../lib/redis'
import { logger } from '../helpers/log'
import type { RequestHandler } from 'express'

declare module 'express-session' {
  interface Session {
    userId?: number
    login?: string
  }
}

function getSessionMiddleware (): RequestHandler {
  logger.debug('Calling getSessionMiddleware...')
  const RedisStore = require('connect-redis')(session)

  return session({
    cookie: {
      // Exception for domain: in development if domain is localhost we dont set it.
      // So you can test on your local network (otherwise, cookie will not be set if you use http://192.168.x.x).
      domain: !isProduction && CONFIG.SERVER.HOSTNAME === 'localhost' ? undefined : CONFIG.SERVER.HOSTNAME,
      httpOnly: true,
      maxAge: undefined,
      path: '/',
      sameSite: true,
      secure: CONFIG.SERVER.HTTPS
    },
    name: CONFIG.COOKIES.PREFIX + 'sid',
    proxy: undefined, // Will comply to express 'trust proxy' settings
    resave: false,
    saveUninitialized: false,
    secret: CONFIG.COOKIES.SESSION.SECRET,
    store: new RedisStore({
      client: Redis.Instance.getClientDuplicate(),
      prefix: 'sess:', // No need to add Redis.Instance.getPrefix(), because it is set in redisClient
      ttl: 60 * 60 * 24 * 7, // one week ttl is more than enough
      disableTouch: false
    }),
    unset: 'destroy'
  })
}

export {
  getSessionMiddleware
}
