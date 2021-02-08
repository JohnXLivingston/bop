import * as cryptoRandomString from 'crypto-random-string'
import { CONFIG, updateConfigKey } from '../helpers/config'
import { logger } from '../helpers/log'

/**
 * Initialize some configurations at the first launch.
 * To avoid problems when using clusters, it should only be called by the master.
 */
async function initConfig (): Promise<void> {
  if (!CONFIG.COOKIES.SESSION.SECRET) {
    logger.info('Missing CONFIG.COOKIES.SESSION.SECRET, will generate one and write it to disk.')
    const secret = cryptoRandomString({ length: 32 })
    // TODO: we should have a reloadConfig method. We should not modify CONFIG here by hand.
    CONFIG.COOKIES.SESSION.SECRET = secret
    await updateConfigKey('cookies.session.secret', secret)
  }
}

export {
  initConfig
}
