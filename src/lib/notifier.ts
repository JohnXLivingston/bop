
import { Redis } from './redis'
import { logger } from '../helpers/log'
import { SocketIOEmitter } from 'socket.io-emitter'

interface SocketIOEmitterWithCustomRequest extends SocketIOEmitter {
  customRequest?: (data: any, callback: (err: any, replies: any[]) => void) => void
}

class Notifier {
  private static instance: Notifier
  private readonly io: SocketIOEmitterWithCustomRequest
  private readonly ioNamespace: SocketIOEmitterWithCustomRequest

  constructor () {
    this.io = require('socket.io-emitter')(Redis.Instance.getClient(), {
      key: Redis.Instance.getPrefix() + 'notifier'
    })
    this.ioNamespace = this.io.of('/bop')
  }

  initInstance (): void {}

  private sendCustomRequest (emitter: SocketIOEmitterWithCustomRequest, data: any): void {
    // Waiting for this PR to be merged: https://github.com/socketio/socket.io-emitter/pull/74/commits
    // Until then...
    if (emitter.customRequest && typeof emitter.customRequest === 'function') {
      emitter.customRequest(data, (err: any, replies: any) => {
        if (err) {
          logger.error('There was an error on customRequest ', err)
        }
        logger.debug('customRequestion responses: ', replies)
      })
    } else {
      const requestid = require('uid2')(6)
      const request = JSON.stringify({
        requestid,
        type: 5, // see socket.io-redis/index.js: requestTypes.customRequest
        data
      })
      const requestChannel = emitter.prefix + '-request#' + emitter.nsp + '#'
      // For now, we dont have to wait the response.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      emitter.redis.publish(requestChannel, request)
    }
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
