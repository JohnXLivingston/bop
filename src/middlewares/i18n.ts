import * as express from 'express'
// import * as i18nAbide from 'i18n-abide'
// import { isProduction } from '../helpers/config'
// import { logger } from '../helpers/log'
const i18next = require('i18next')
const i18nextMiddlewhare = require('i18next-http-middleware')
const i18nextFsBackend = require('i18next-fs-backend')

i18next.use(i18nextMiddlewhare.LanguageDetector).use(i18nextFsBackend).init({
  backend: {
    loadPath: 'dist/i18n/{{lng}}/{{ns}}.json'
    // FIXME: addPath to log errors
  },
  debug: false,
  defaultNS: 'common',
  fallbackLng: 'en',
  ns: 'common'
})

// // Tips: languages is like xx-XX and locale xx_XX.
// const supportedLanguages = ['en-US', 'fr-FR']
// let debugLang: string | undefined
// let debugLocale: string | undefined
// if (!isProduction) {
//   supportedLanguages.push('it-CH')
//   debugLang = 'it-CH'
//   debugLocale = 'it_CH'
// }
/**
 * Read the locale from session or cookies and set it in request[headers] for i18n-abide.
 */
async function _readLocale (req: express.Request, res: express.Response, next: express.NextFunction) {
  // let locale: string | undefined
  // if (req.session?.clientLocale) {
  //   locale = req.session.clientLocale
  // }
  // TODO: also read a cookie?

  // if (locale) {
  //   if (!localeSupported(locale)) {
  //     logger.debug('The requested locale "%s" is not supported.', locale)
  //   } else {
  //     logger.debug('There is a valid locale (%s) in the user session, using it.', locale)
  //     req.headers['accept-language'] = i18nAbide.normalizeLanguage(i18nAbide.languageFrom(locale))
  //   }
  // }
  return next()
}
/**
 * Initialize i18n-abide.
 */
// const i18n = [_readLocale, i18nAbide.abide({
//   supported_languages: supportedLanguages,
//   default_lang: 'en-US',
//   debug_lang: debugLang,
//   translation_directory: 'dist/i18n',
//   logger: logger
// })]
function testToRemove (req: express.Request, res: express.Response, next: express.NextFunction) {
  res.locals.i18n = i18next
  next()
}
const i18n = [_readLocale, testToRemove]

// function localeSupported (locale: string): boolean {
//   if (i18nAbide.getLocales().indexOf(locale) >= 0) {
//     return true
//   }
//   if (debugLocale && debugLocale === locale) {
//     return true
//   }
//   return false
// }

// const localeInformations = i18nAbide.getLocales().sort().map(locale => {
//   return {
//     locale: i18nAbide.normalizeLocale(locale),
//     language: i18nAbide.normalizeLanguage(i18nAbide.languageFrom(locale))
//   }
// })
// if (debugLocale) {
//   localeInformations.push({
//     locale: i18nAbide.normalizeLocale(debugLocale),
//     language: i18nAbide.normalizeLanguage(debugLang)
//   })
// }
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

// TODO: serve static i18n folder if necessary for front-end localization.
// FIXME: find a way to conserve local after logout? In a cookie?

export {
  i18n,
  i18nChangeLocale
}
