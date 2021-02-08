/* eslint-disable import/first */
import { registerTSPaths } from './helpers/register-ts-paths'
registerTSPaths()

import * as cluster from 'cluster'
import * as express from 'express'
import { Server } from 'http'
import * as sharedSession from 'express-socket.io-session'
import { Socket } from 'socket.io'

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
function newServer (): Server {
  const app = express()
  const server = new Server(app)

  Redis.initInstance()
  Notifier.Instance.init(server)

  return server
}

class Notifier {
  private static instance: Notifier
  // userSockets: sockets by userId
  private userSockets: { [userId: string]: Socket[] }
  // sessionSockets: sockets by sessionId
  private sessionSockets: { [sessionId: string]: Socket[] }
  // private ioNamespace?: any

  constructor () {
    this.userSockets = {}
    this.sessionSockets = {}
  }

  init (server: Server): void {
    const url = webUrl()
    const io = require('socket.io')(server, {
      cookie: false,
      origins: [url]
    })

    const redisClient = Redis.Instance.getClient()
    const redisAdapter = require('socket.io-redis')
    io.adapter(redisAdapter({
      key: Redis.Instance.getPrefix() + 'notifier',
      pub: redisClient,
      sub: redisClient
    }))
    const ioNamespace = io.of('/bop')
    // this.ioNamespace = ioNamespace

    ioNamespace.use(sharedSession(getSessionMiddleware()))
    ioNamespace.use(async (socket: Socket, next: express.NextFunction) => {
      const sessionId = socket.handshake?.session?.id
      const userId = socket.handshake?.session?.userId
      if (!sessionId || !userId) {
        logger.debug('New notifier connection for an unlogged user, refusing.')
        return next(new Error('You must have a valid session to connect to Notifier'))
      }
      const user = await checkUser(userId)
      if (!user) {
        logger.error('The user in the session is no more valid. Refusing.')
        return next(new Error('The user has no right to log in.'))
      }

      logger.debug('New notifier connection for user %s, session %s', userId, sessionId.substring(0, 4) + '...')

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
    })

    ioNamespace.adapter.customHook = (data: string, cb: () => {}) => {
      const m = data.match(/^(\w+):(.*)$/)
      if (!m) {
        cb()
        return
      }
      const key = m[1]
      const val = m[2]
      if (key === 'disconnect') {
        // val is a sessionId
        logger.debug('Received a request to disconnect a session.')
        this._disconnectSession(val)
      }
      cb()
    }

    ioNamespace.on('connection', (socket: Socket) => {
      socket.emit('news', { msg: `Welcome on process ${process.pid}` })
      socket.broadcast.emit('news', { msg: `We have a new incomer on process ${process.pid}` })
    })
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
