import * as express from 'express'
import { v1 as uuidv1 } from 'uuid'
import * as httpContext from 'express-http-context'

import { logger } from '../helpers/log'

function logRequest (req: express.Request, res: express.Response, next: express.NextFunction): void {
  let reqId = uuidv1()
  // for better readability, we will reverse the sequences (lasts chars are constant over a process...)
  reqId = reqId.split('-').reverse().join('-')
  httpContext.set('reqId', reqId)
  logger.debug(`Request ${req.method}: ${req.originalUrl}`)
  next()
}

export {
  logRequest
}
