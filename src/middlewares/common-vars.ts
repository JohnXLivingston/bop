import * as express from 'express'
import { isProduction, webpackManifest, webUrl, notifierUrl } from '../helpers/config'
import { Context } from 'bop/shared/models/context.model'

/**
 * Injects some constants in res.locals, for use in templates and co.
 * @param req
 * @param res
 * @param next
 */
function commonConstants (req: express.Request, res: express.Response, next: express.NextFunction) {
  res.locals.isProduction = isProduction
  res.locals.webpackManifest = webpackManifest

  const context: Context = {
    webBaseUrl: webUrl(),
    notifierBaseUrl: notifierUrl()
  }
  res.locals.context = context
  next()
}

export {
  commonConstants
}
