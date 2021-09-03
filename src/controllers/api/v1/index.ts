import * as express from 'express'
import { usersRouter } from './users'
import { planningRouter } from './planning'
import { isProduction } from '../../../helpers/config'
import { asyncMiddleware } from 'bop/middlewares/async'
import { Notifier } from 'bop/lib/notifier'
import { logger } from 'bop/helpers/log'

const apiV1Router = express.Router()
apiV1Router.use('/users', usersRouter)
apiV1Router.use('/planning', planningRouter)

apiV1Router.use('/ping', (req: express.Request, res: express.Response) => {
  logger.debug('PING API')
  return res.send('pong').status(200).end()
})

if (!isProduction) {
  apiV1Router.use('/broadcast_ping', asyncMiddleware(async (req, res) => {
    logger.info('Test API: will broadcast a pong message to all connected clients.')
    Notifier.Instance.broadcastMessage('pong')
    return res.send('pong').status(200).end()
  }))

  apiV1Router.use('/test_serverside_emit', asyncMiddleware(async (req, res) => {
    logger.info('Test API: will try a serverSideEmit.')
    Notifier.Instance.testServerSideEmit()
    return res.send('pong').status(200).end()
  }))
}

export { apiV1Router }
