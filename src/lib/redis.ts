import { ClientOpts, createClient, RedisClient } from 'redis'
import { CONFIG } from '../helpers/config'
import { logger } from '../helpers/log'

class Redis {
  private static instance: Redis
  private client: RedisClient
  private prefix: string

  constructor () {
    const options = Redis.getRedisClientOptions()
    this.prefix = options.prefix || ''
    this.client = createClient(options)

    this.client.on('error', error => {
      logger.error('Error in Redis client.', { error })
      throw new Error('Error in Redis client, dont know what to do.')
    })

    if (options.password) {
      this.client.auth(options.password)
    }
  }

  static getRedisClientOptions (): ClientOpts {
    const options: ClientOpts = Object.assign(
      {},
      {
        host: CONFIG.REDIS.HOSTNAME!,
        port: CONFIG.REDIS.PORT!,
        prefix: CONFIG.REDIS.PREFIX
      },
      (CONFIG.REDIS.DB) ? { db: CONFIG.REDIS.DB } : {},
      (CONFIG.REDIS.AUTH != null) ? { password: CONFIG.REDIS.AUTH } : {}
    )
    return options
  }

  getClient (): RedisClient {
    return this.client
  }

  getPrefix (): string {
    return this.prefix
  }

  static initInstance () {
    this.instance = new this()
  }

  static get Instance (): Redis {
    if (!this.instance) {
      throw new Error('You cannot call Redis.Instance before calling initInstance.')
    }
    return this.instance
  }
}

export {
  Redis
}
