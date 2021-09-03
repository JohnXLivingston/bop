/* eslint-disable import/first */
import { registerTSPaths } from './helpers/register-ts-paths'
registerTSPaths()

import * as path from 'path'
import * as cluster from 'cluster'
import * as express from 'express'
import { createServer, Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket, Handshake } from 'socket.io'
import * as sharedSession from 'express-socket.io-session'
import { createAdapter } from '@socket.io/redis-adapter'
import { instrument } from '@socket.io/admin-ui'

import { CONFIG, checkConfig, webUrl } from './helpers/config'
import { logger } from './helpers/log'
import { setSharedLogger } from './shared/utils/logger'

import { Redis } from './lib/redis'

import { initDatabaseModels } from './initializers'

import { getSessionMiddleware, checkUser } from './middlewares'

// Shared code (front and back end) will now use logger.
setSharedLogger(logger)

async function init (): Promise<void> {
  const configErrors = checkConfig()
  if (configErrors.warnings.length) {
    logger.warn('There are some warnings in config', configErrors.warnings)
  }
  if (configErrors.errors.length) {
    logger.error('Cannot start server, there are errors in config.', configErrors.errors)
    throw new Error('Cannot start server, there are errors in config.')
  }

  await initDatabaseModels()

  const port = CONFIG.NOTIFIER.PORT

  newServer().listen(port, () => {
    logger.info(`Notifier ${process.pid} started at http://localhost:${port}`)
  })
}
init().catch((err) => {
  if (cluster.isMaster) {
    logger.error('Function init failed in notifier master. ', err)
  } else {
    logger.error('Function init failed in a notifier worker. ', err)
  }
  process.exit(1)
})

/**
 * newServer creates the express app and the http server.
 */
function newServer (): HTTPServer {
  const app = express()
  const server = createServer(app)

  Redis.initInstance()
  Notifier.Instance.init(server)

  if (CONFIG.NOTIFIER.ADMINUI) {
    app.use(express.static(path.join(__dirname, './socketioadmin')))
  }

  return server
}

class Notifier {
  private static instance: Notifier
  // userSockets: sockets by userId
  private userSockets: { [userId: string]: Socket[] }
  // sessionSockets: sockets by sessionId
  private sessionSockets: { [sessionId: string]: Socket[] }
  // private ioBopNamespace?: any

  constructor () {
    this.userSockets = {}
    this.sessionSockets = {}
  }

  init (server: HTTPServer): void {
    const url = webUrl()
    const io = new SocketIOServer<BopEvents>(server, {
      adapter: createAdapter(
        Redis.Instance.getClientDuplicate(),
        Redis.Instance.getClientDuplicate(),
        {
          key: Redis.Instance.getPrefix() + 'notifier'
        }
      ),
      cookie: false,
      cors: {
        origin: url,
        methods: ['GET', 'POST'],
        credentials: true
      }
    })

    const ioBopNamespace = io.of('/bop')
    // this.ioBopNamespace = ioBopNamespace

    ioBopNamespace.use(sharedSession(getSessionMiddleware(), {
      autoSave: false // Session should not be modified from the notifier.
    }))
    ioBopNamespace.use((socket, next: (err?: Error) => void) => {
      try {
        const handshake = socket.handshake as Handshake
        const sessionId = handshake?.session?.id
        const userId = handshake?.session?.userId
        if (!sessionId || !userId) {
          logger.debug('New notifier connection for an unlogged user, refusing.')
          return next(new Error('You must have a valid session to connect to Notifier'))
        }
        const userPromise = checkUser(userId)
        userPromise.then(
          user => {
            if (!user) {
              logger.error('The user in the session is no more valid. Refusing.')
              return next(new Error('The user has no right to log in.'))
            }

            logger.debug(
              'New notifier connection for user %s, session %s',
              userId,
              sessionId.substring(0, 4) + '...'
            )

            if (!this.userSockets[userId]) { this.userSockets[userId] = [] }
            this.userSockets[userId].push(socket)

            if (!this.sessionSockets[sessionId]) { this.sessionSockets[sessionId] = [] }
            this.sessionSockets[sessionId].push(socket)

            this._countSockets(userId, sessionId)

            socket.on('disconnect', () => {
              logger.debug('Disconnecting a socket for user %s.', userId)
              this.userSockets[userId] = this.userSockets[userId].filter(s => s !== socket)
              this.sessionSockets[sessionId] = this.sessionSockets[sessionId].filter(s => s !== socket)
              this._countSockets(userId, sessionId)
            })

            next()
          },
          err => {
            logger.error('checkUser failed with:', err)
            next(err)
          }
        )
      } catch (err) {
        logger.error('Something went wrong', err)
        next(err)
      }
    })

    ioBopNamespace.on('connection', (socket) => {
      socket.emit('news', { msg: `Welcome on process ${process.pid}` })
      socket.broadcast.emit('news', { msg: `We have a new incomer on process ${process.pid}` })
    })

    const ioBopInternalNamespace = io.of('/bop_internal')
    ioBopInternalNamespace.on('disconnect_session', (sessionID: any) => {
      logger.debug('Received a request to disconnect a session.')
      if (typeof sessionID !== 'string') {
        logger.error('Invalid sessionID')
        return
      }
      this._disconnectSession(sessionID)
    })
    ioBopInternalNamespace.on('serverside_emit_test', (data: any) => {
      logger.info('Received a serverside_emit_test message', data)
    })

    if (CONFIG.NOTIFIER.ADMINUI) {
      instrument(io, {
        auth: false
      })
    }
  }

  private _countSockets (userId: number, sessionId: string): void {
    logger.debug('The user %s has %d open sockets on this worker.', userId, this.userSockets[userId].length)
    logger.debug(
      'The user %s has %d sockets for this session on this worker.',
      userId,
      this.sessionSockets[sessionId].length
    )
  }

  private _disconnectSession (sessionID: string): void {
    const sockets = this.sessionSockets[sessionID]
    if (!sockets) {
      return
    }
    for (let i = 0; i < sockets.length; i++) {
      sockets[i].disconnect(true)
    }
  }

  static get Instance (): Notifier {
    return this.instance || (this.instance = new Notifier())
  }
}
