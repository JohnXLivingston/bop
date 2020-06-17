import * as io from 'socket.io-client'
import getLogger from '../utils/logger'
import { getContext } from '../utils/context'

const logger = getLogger('lib/notifications.ts')
const AUTORELOADDELAY = 1000

class Notifications {
  private socket?: SocketIOClient.Socket
  private autoReloadDevModeActivated: boolean = false

  /**
   * Connect to server.
   */
  connect () {
    let connectCount = 0
    let reloadTimeout: NodeJS.Timeout | undefined

    const notifierUrl = getContext().notifierBaseUrl
    this.socket = io(notifierUrl + '/bop')

    this.socket.on('connect', () => {
      connectCount++
      if (this.autoReloadDevModeActivated && connectCount >= 2 && reloadTimeout === undefined) {
        logger.debug(`Socket reconnect detected, reloading the page in ${AUTORELOADDELAY} ms.`)
        // We will not reload immediatly. On case there will be others server restarts.
        reloadTimeout = setTimeout(() => {
          reloadTimeout = undefined
          // Just in case we disabled during timeout:
          if (this.autoReloadDevModeActivated) {
            window.location.reload()
          }
        }, AUTORELOADDELAY)
      }
    })

    this.socket.on('disconnect', () => {
      logger.debug('We just got disconnected from the socket.')
      // TODO: display something. Try to reconnect? If it is because of a session ending, reload page?
    })

    this.socket.on('news', (data: any) => {
      logger.debug(data)
    })
  }

  /**
   * When in development, can be used to auto reload the page when there are some changes.
   * In other words: each time after the first one the socket is connected (because nodemon restart on watch)
   * @param activate : true to activate this mode.
   */
  autoReloadDevMode (activate: boolean) :void {
    this.autoReloadDevModeActivated = activate
  }
}

const notifications = new Notifications()

export {
  notifications
}
