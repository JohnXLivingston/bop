
import { Redis } from './redis'
import { logger } from '../helpers/log'
import { Emitter } from '@socket.io/redis-emitter'

class Notifier {
  private static instance: Notifier
  private readonly io: Emitter<BopEvents>
  private readonly ioBopNamespace: Emitter<BopEvents>
  private readonly ioBopInternalNamespace: Emitter<BopEvents>

  constructor () {
    this.io = new Emitter<BopEvents>(Redis.Instance.getClientDuplicate(), {
      key: Redis.Instance.getPrefix() + 'notifier'
    })
    this.ioBopNamespace = this.io.of('/bop')
    this.ioBopInternalNamespace = this.io.of('/bop_internal')
  }

  initInstance (): void {}

  /**
   * When a session is destroyed, please call disconnectSession to be sure to disconnect all user browser tabs.
   * @param sessionID
   */
  killSession (sessionId: string): void {
    logger.debug('We have to kill a session. Sending disconnect_session message.')
    this.ioBopInternalNamespace.serverSideEmit('disconnect_session', sessionId)
  }

  broadcastMessage (msg: string): void {
    logger.debug('Broadcasting a text message...')
    this.ioBopNamespace.emit('news', {
      msg: msg
    })
  }

  testServerSideEmit (): void {
    logger.debug('Sending test serverSideEmit...')
    this.ioBopInternalNamespace.serverSideEmit('serverside_emit_test', 'ping')
  }

  static get Instance (): Notifier {
    return this.instance || (this.instance = new Notifier())
  }
}

export {
  Notifier
}
