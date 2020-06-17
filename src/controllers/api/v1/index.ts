import * as express from 'express'
import { usersRouter } from './users'

const apiV1Router = express.Router()
apiV1Router.use('/users', usersRouter)

apiV1Router.use('/ping', (req: express.Request, res: express.Response) => {
  return res.send('pong').status(200).end()
})

export { apiV1Router }
