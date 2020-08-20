import * as express from 'express'
import { logger } from '../helpers/log'
import { UserModel } from '../models'
import { Notifier } from '../lib/notifier'
import { Context } from '../shared/models/context.model'

/**
 * If the user is authenticated, everything is ok.
 * Elsewhere redirect to login form.
 * @param req
 * @param res
 * @param next
 */
async function authenticatedOrLogin (req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    if (req.session && req.session.userId) {
      logger.debug('[auth:authenticatedOrLogin] There is a userId in session. Checking...')
      const user = await checkUser(req.session.userId)
      if (user) {
        logger.debug('[auth:authenticatedOrLogin] User %d is already logged in.', req.session.userId)
        _fillResWithUser(res, user)
        return next()
      }
      logger.debug('[auth:authenticatedOrLogin] User is NOT ok.')
      await _doLogout(req)
    }
    logger.debug('[auth:authenticatedOrLogin] Displaying the login page...')
    res.status(401)
    res.render('login.html', {
      login: res.locals.loginFailed?.login,
      loginFailed: !!res.locals.loginFailed
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * If the user is not authenticated, display a 401 error page.
 * @param req
 * @param res
 * @param next
 */
async function authenticatedOr401 (req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    if (req.session && req.session.userId) {
      logger.debug('[auth:authenticatedOr401] There is a userId in session. Checking...')
      const user = await checkUser(req.session.userId)
      if (user) {
        logger.debug('[auth:authenticatedOr401] User %d is already logged in.', req.session.userId)
        _fillResWithUser(res, user)
        return next()
      }
      logger.debug('[auth:authenticatedOr401] User is NOT ok.')
      await _doLogout(req)
    }
    logger.debug('[auth:authenticatedOr401] Sending 410 status...')
    res.sendStatus(401)
  } catch (err) {
    return next(err)
  }
}

/**
 * This returns a middlewares array for intercepting login form POST.
 * @param middlewares additional middlewares needed to display the login page (for example for localization).
 */
function getAuthenticateMiddleware (middlewares: express.RequestHandler[]): express.RequestHandler[] {
  return [
    _authenticate,
    ...middlewares,
    // _authenticate only calls next() if the user is not logged in and post a login form.
    // So authenticatedOrLogin MUST display a login form.
    // To ensure we are not doing crap, we just call this:
    _checkPostAuthenticate,
    authenticatedOrLogin
  ]
}

function _checkPostAuthenticate (req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!res.locals.loginFailed) {
    throw new Error('Don\'t expect to be here without failing to log in.')
  }
  next()
}

async function _authenticate (req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    if (req.method !== 'POST') {
      return next('route')
    }
    if (!req.body || req.body.loginForm !== '1') {
      return next('route')
    }

    const login = req.body.login
    const password = req.body.password
    if (!login) {
      return next('route')
    }

    logger.debug('[auth:_authenticate] We are on a login form POST.')
    const user = await UserModel.findOne({ where: { login: login, authenticationType: 'password' } })
    if (!user) {
      logger.debug('[auth:_authenticate] User not found')
    } else if (!await user.isPasswordMatch(password)) {
      logger.debug('[auth:_authenticate] Wrong password')
    } else if (!await checkUser(user)) {
      logger.debug('[auth:_authenticate] User not valid')
    } else {
      logger.debug('[auth:_authenticate] User found and correct...')
      _fillResWithUser(res, user)
      if (!req.session) {
        throw new Error('There is no req.session, WTF?')
      }
      if (req.session.userId && req.session.userId !== user.id) {
        // FIXME: catch this error in a global error handling middleware, and display localized message.
        throw new Error('The user is already logged in with another user.')
      }
      req.session.userId = user.id
      req.session.login = user.login
      // TODO: add user locale in req.session.clientLocale
      logger.debug('[auth:_authenticate] User %d successfully logged in.', req.session.userId)
      return res.redirect(req.originalUrl)
    }
    logger.debug('[auth:_authenticate] Wrong authentification. Showing the login form again.')
    if (req.session?.userId) {
      // FIXME: catch this error in a global error handling middleware, and display localized message.
      throw new Error('The user is already logged in, but submited wrong authent infos.')
    }
    res.locals.loginFailed = { login }
    // server.ts call .use([authenticate, some_required_middleware..., authenticatedOrLogin]),
    // next() will display login page.
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * This middleware disconnects the user. You have to chain with a redirection.
 * @param req
 * @param res
 * @param next
 */
async function doLogout (req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    logger.debug('[auth:doLogout]')
    await _doLogout(req).then(next)
  } catch (err) {
    return next(err)
  }
}

async function _doLogout (req: express.Request): Promise<void> {
  const p = new Promise<void>((resolve, reject) => {
    if (req.session) {
      logger.debug('[auth:_doLogout] Destroying session...')
      const sessionId = req.session.id
      req.session.destroy(err => {
        if (err) {
          reject(err)
        }
        logger.debug('[auth:_doLogout] Calling Notifier.Instance.killSession...')
        Notifier.Instance.killSession(sessionId)
        resolve()
      })
    }
  })
  return p
}

/**
 * Check if the user is valid, and hash the right to login.
 * Return the user instance if ok, undefined otherwise.
 */
async function checkUser(userId: number): Promise<undefined | UserModel>
async function checkUser(user: UserModel): Promise<undefined | UserModel>
async function checkUser (arg: any): Promise<undefined | UserModel> {
  let user: UserModel | null
  if (typeof arg === 'number') {
    logger.debug('[auth:_checkUser] Called with the userId %d', arg)
    user = await UserModel.findByPk(arg)
  } else {
    user = arg
  }
  if (!user) {
    logger.debug('[auth:_checkUser] User not found')
    return undefined
  }

  // TODO: check user state and co.
  return user
}

function _fillResWithUser (res: express.Response, user: UserModel) {
  const context: Context = res.locals.context
  context.user = user.toFormattedJSON()
}

export {
  authenticatedOrLogin,
  authenticatedOr401,
  doLogout,
  getAuthenticateMiddleware,
  checkUser
}
