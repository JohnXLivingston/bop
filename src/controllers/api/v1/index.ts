import * as express from 'express'
import { usersRouter } from './users'
import { planningRouter } from './planning'

const apiV1Router = express.Router()
apiV1Router.use('/users', usersRouter)
apiV1Router.use('/planning', planningRouter)

apiV1Router.use('/ping', (req: express.Request, res: express.Response) => {
  return res.send('pong').status(200).end()
})

export { apiV1Router }
