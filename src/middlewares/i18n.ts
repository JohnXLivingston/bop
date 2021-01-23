import * as express from 'express'
import { logger } from '../helpers/log'
import { i18n } from 'i18next'
const i18next: i18n = require('i18next')
const i18nextFsBackend = require('i18next-fs-backend')
const i18nextMiddleware = require('i18next-http-middleware')

const supportedLanguages = ['en', 'fr'] // TODO: add ['en-US', 'fr-FR']

async function initI18n () {
  await i18next.use(i18nextMiddleware.LanguageDetector).use(i18nextFsBackend).init({
    backend: {
      loadPath: 'dist/i18n/{{lng}}/{{ns}}.json'
    },
    debug: false,
    defaultNS: 'common',
    fallbackLng: 'en',
    ns: 'common',
    preload: supportedLanguages,
    saveMissing: true,
    missingKeyHandler: (lng: string[], ns: string, key: string, fallbackValue: string) => {
      logger.error(`Missing localized string: lng=${lng}, ns=${ns}, key=${key}, fallbackValue=${fallbackValue}.`)
    }
  })
}

function i18nMiddleware () {
  return i18nextMiddleware.handle(i18next)
}

function i18nResourcesLoader () {
  return i18nextMiddleware.getResourcesHandler(i18next, {
    cache: true
  })
}

/**
 * Use this middleware if the current route can be called to change the current locale.
 * @param req
 * @param res
 * @param next
 */
function i18nChangeLocale (req: express.Request, res: express.Response, next: express.NextFunction) {
  // if (req.query._locale) {
  //   const newLocale = i18nAbide.normalizeLocale(req.query._locale)
  //   logger.debug('Trying to change user\' locale to "%s".', newLocale)
  //   if (newLocale && localeSupported(newLocale)) {
  //     if (req.session) {
  //       logger.debug('Saving locale in session')
  //       req.session.clientLocale = newLocale
  //       // TODO: save locale on user.
  //     }
  //     // TODO: save locale on cookie?
  //   } else {
  //     logger.warn('Error: locale "%s" does not exist.', newLocale)
  //   }
  //   const url = req.originalUrl.replace(/(\?|&)_locale=.*(&|$)/g, '')
  //   logger.debug('Redirecting to: "%s".', url)
  //   return res.redirect(url)
  // }

  // let urlBase = req.originalUrl
  // if (urlBase[urlBase.length] !== '&') {
  //   if (urlBase.indexOf('?') >= 0) {
  //     urlBase += '&'
  //   } else {
  //     urlBase += '?'
  //   }
  // }
  // res.locals.changeLocaleInformations = localeInformations.map(info => {
  //   return Object.assign({}, info, { url: urlBase + '_locale=' + encodeURIComponent(info.locale) + '&' })
  // })

  return next()
}

// FIXME: find a way to conserve local after logout? In a cookie?

export {
  initI18n,
  i18nMiddleware,
  i18nResourcesLoader,
  i18nChangeLocale
}
