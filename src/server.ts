import * as path from 'path'
import { fork } from 'child_process'
import * as cluster from 'cluster'
import * as express from 'express'
import { Server } from 'http'
import * as nunjucks from 'nunjucks'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as httpContext from 'express-http-context'

import { CONFIG, checkConfig } from './helpers/config'
import { logger } from './helpers/log'
import { setSharedLogger } from './shared/utils/logger'

import { Notifier } from './lib/notifier'
import { Redis } from './lib/redis'

import { initConfig, initDatabaseModels, sequelizeTypescript } from './initializers'

import * as controllers from './controllers'
import {
  getAuthenticateMiddleware,
  doLogout,
  commonConstants,
  logRequest,
  getSessionMiddleware,
  initI18n,
  i18nMiddleware,
  i18nChangeLocale
} from './middlewares'

import { testFunction } from './shared/test' // TODO : remove. This is for temporary testing purpose.

// Shared code (front and back end) will now use logger.
setSharedLogger(logger)

async function init () {
  if (cluster.isMaster) {
    await initConfig()
  }
  const configErrors = checkConfig()
  if (configErrors.warnings.length) {
    logger.warn('There are some warnings in config', configErrors.warnings)
  }
  if (configErrors.errors.length) {
    logger.error('Cannot start server, there are errors in config.', configErrors.errors)
    throw new Error('Cannot start server, there are errors in config.')
  }

  if (cluster.isMaster) {
    const migrator = require('./initializers/migrator')
    await migrator.migrate()
    logger.debug('Database as been instanciated or migrated, closing master connection.')
    await sequelizeTypescript.close()
  } else {
    await initDatabaseModels()
  }

  if (cluster.isMaster) {
    let nbWorkers = CONFIG.CLUSTER.WORKERS
    if (!nbWorkers) {
      nbWorkers = require('os').cpus().length - CONFIG.CLUSTER.NOTIFIERS
    }
    if (nbWorkers <= 0) {
      logger.error('Invalid nbWorkers, fallback on 1.')
      nbWorkers = 1
    }

    logger.info(`Master ${process.pid} forking ${nbWorkers} process...`)
    for (let i = 0; i < nbWorkers; i++) {
      cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.info(`worker ${worker.process.pid} died. Launching a new one...`, code, signal)
      cluster.fork()
    })
  } else {
    const port = CONFIG.SERVER.PORT
    logger.info(`Server ${process.pid} starting at http://localhost:${port}`)
    const server = await newServer()
    server.listen(port)
    logger.debug(`Server ${process.pid} listening on port ${port}`)
    testFunction()
  }

  if (cluster.isMaster) {
    newNotifier()
  }
}
init().catch((err) => {
  if (cluster.isMaster) {
    logger.error('Function init failed in master. ', err)
  } else {
    logger.error('Function init failed in a worker. ', err)
  }
  process.exit(1)
})

/**
 * newServer creates the express app and the http server.
 */
async function newServer () {
  const app = express()
  const server = new Server(app)

  await initI18n()

  Redis.initInstance()

  const sessionMiddleware = getSessionMiddleware()
  app.use(sessionMiddleware)

  nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
  })

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(cookieParser())

  // httpContext.middleware must be called after third party middlewares causing context lost (like bodyParser),
  // logRequest must be called after httpContext.middleware and before our middlewares (that needs logging).
  app.use(httpContext.middleware)
  app.use(logRequest)

  app.use(express.static(path.join(__dirname, './public')))
  app.use('/i18n', express.static(path.join(__dirname, './i18n')))

  app.use(i18nMiddleware)
  app.use(commonConstants)
  app.post(/.*/, // After i18nMiddleware and commonConstants, in case we have to display a login form.
    getAuthenticateMiddleware([i18nChangeLocale])
  )

  app.use('/', controllers.indexRouter)

  app.get('/logout', [doLogout, (req: express.Request, res: express.Response) => {
    return res.redirect('/')
  }])

  Notifier.Instance.initInstance()

  return server
}

function newNotifier () {
  const notifierProcess = fork(path.join(__dirname, 'notifier'), undefined, {
    detached: false,
    stdio: 'inherit'
  })
  const notifierOnUnexpectedExit = (code: any, signal: any) => {
    logger.error('Child notifier process terminated with code: ' + code, signal)
    process.exit(1)
  }
  notifierProcess.on('exit', notifierOnUnexpectedExit)
  const notifierShutdown = () => {
    logger.debug('Master is exiting, shutting down the notifier...')
    notifierProcess.removeListener('exit', notifierOnUnexpectedExit)
    notifierProcess.kill('SIGTERM')
  }

  process.once('SIGTERM', () => {
    logger.debug('Receiving a SIGTERM, exiting...')
    process.exit(0)
  })
  process.once('SIGINT', () => {
    logger.debug('Receiving a SIGINT, exiting...')
    process.exit(0)
  })
  process.once('SIGUSR1', () => {
    logger.debug('Receiving a SIGUSR1, exiting...')
    process.exit(0)
  })
  process.once('SIGUSR2', () => {
    logger.debug('Receiving a SIGUSR2, exiting...')
    process.exit(0)
  })
  process.once('exit', () => notifierShutdown())

  // This is a somewhat ugly approach, but it has the advantage of working
  // in conjunction with most of what third parties might choose to do with
  // uncaughtException listeners, while preserving whatever the exception is.
  process.once('uncaughtException', (error) => {
    // If this was the last of the listeners, then shut down the child and rethrow.
    // Our assumption here is that any other code listening for an uncaught
    // exception is going to do the sensible thing and call process.exit().
    if (process.listeners('uncaughtException').length === 0) {
      notifierShutdown()
      throw error
    }
  })
}
