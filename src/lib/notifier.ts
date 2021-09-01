
import { Redis } from './redis'
import { logger } from '../helpers/log'
import { Emitter } from '@socket.io/redis-emitter'

interface BopSocketEvent {
  customRequest: (data: any, callback: (err: any, replies: any[]) => void) => void
}

class Notifier {
  private static instance: Notifier
  private readonly io: Emitter<BopSocketEvent>
  private readonly ioNamespace: Emitter<BopSocketEvent>

  constructor () {
    this.io = new Emitter<BopSocketEvent>(Redis.Instance.getClient(), {
      key: Redis.Instance.getPrefix() + 'notifier'
    })
    this.ioNamespace = this.io.of('/bop')
  }

  initInstance (): void {}

  private sendCustomRequest (emitter: Emitter<BopSocketEvent>, data: any): void {
    emitter.emit('customRequest', data, (err: any, replies: any) => {
      if (err) {
        logger.error('There was an error on customRequest ', err)
      }
      logger.debug('customRequestion responses: ', replies)
    })
  }

  /**
   * When a session is destroyed, please call disconnectSession to be sure to disconnect all user browser tabs.
   * @param sessionID
   */
  killSession (sessionId: string): void {
    logger.debug('We have to kill a session. Sending customRequest.')
    this.sendCustomRequest(this.ioNamespace, 'disconnect:' + sessionId)
  }

  static get Instance (): Notifier {
    return this.instance || (this.instance = new Notifier())
  }
}

export {
  Notifier
}
