import { CONFIG } from '../config'
import { createPool, Pool, PoolConnection } from 'mariadb'

let pool: Pool
async function initPool (): Promise<boolean> {
  pool = createPool({
    database: CONFIG.DATABASE.DBNAME ?? undefined,
    host: CONFIG.DATABASE.HOSTNAME ?? undefined,
    port: CONFIG.DATABASE.PORT,
    user: CONFIG.DATABASE.USERNAME ?? undefined,
    password: CONFIG.DATABASE.PASSWORD ?? undefined,
    connectionLimit: CONFIG.DATABASE.POOL.MAX
    // FIXME: there is a bug in mariadb type files.
    // See: https://github.com/mariadb-corporation/mariadb-connector-nodejs/issues/169
    // leakDetectionTimeout: CONFIG.DATABASE.POOL.LEAKTIMEOUT ?? 0
  })
  return true
}

async function getPool (): Promise<Pool> {
  if (!pool) {
    throw new Error('Calling getPool before initialization is not allowed.')
  }
  return pool
}

async function getConnection (): Promise<PoolConnection> {
  if (!pool) {
    throw new Error('Calling getConnection before initialization is not allowed.')
  }
  return pool.getConnection()
}

export {
  initPool,
  getPool,
  getConnection
}
