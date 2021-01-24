import * as express from 'express'
import { logger } from '../helpers/log'
import { i18n } from 'i18next'
import { readdirSync, lstatSync } from 'fs'
import { join } from 'path'
const i18next: i18n = require('i18next')
const i18nextFsBackend = require('i18next-fs-backend')
const i18nextMiddleware = require('i18next-http-middleware')

let supportedLanguagesInfo: {
  key: string,
  label: string
}[]

async function initI18n () {
  const supportedLanguages = readdirSync('dist/i18n').filter((fileName) => {
    const joinedPath = join('dist/i18n', fileName)
    const isDirectory = lstatSync(joinedPath).isDirectory()
    return isDirectory
  })
  logger.info('Loading supported languages: ' + supportedLanguages.join(', '))

  await i18next.use(i18nextMiddleware.LanguageDetector).use(i18nextFsBackend).init({
    backend: {
      loadPath: 'dist/i18n/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['querystring', /* 'session', 'cookie', */ 'header'],
      lookupQuerystring: '_locale'
      // lookupCookie: 'language',
    },
    debug: false,
    defaultNS: 'common',
    fallbackLng: 'en',
    load: 'all',
    ns: 'common',
    preload: supportedLanguages,
    returnNull: false,
    returnEmptyString: false,
    saveMissing: true,
    supportedLngs: supportedLanguages,
    missingKeyHandler: (lng: string[], ns: string, key: string, fallbackValue: string) => {
      logger.error(`Missing localized string: lng=${lng}, ns=${ns}, key=${key}, fallbackValue=${fallbackValue}.`)
    }
  })

  supportedLanguagesInfo = []
  for (let i = 0; i < supportedLanguages.length; i++) {
    const l = supportedLanguages[i]
    if (l.indexOf('-') < 0) {
      // language like 'en': keep only if there is no derivated language.
      if (supportedLanguages.find(f => f.startsWith(l))) {
        continue
      }
    }
    const i18nTmp = i18next.cloneInstance({})
    await i18nTmp.changeLanguage(l)
    supportedLanguagesInfo.push({
      key: l,
      label: i18nTmp.t('languages.' + l)
    })
  }
  supportedLanguagesInfo.sort((a, b) => a.label.localeCompare(b.label))
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

  if (supportedLanguagesInfo) {
    let urlBase = req.originalUrl
    if (urlBase[urlBase.length] !== '&') {
      if (urlBase.indexOf('?') >= 0) {
        urlBase += '&'
      } else {
        urlBase += '?'
      }
    }
    res.locals.changeLocaleInformations = supportedLanguagesInfo.map(language => {
      return Object.assign({}, language, { url: urlBase + '_locale=' + encodeURIComponent(language.key) + '&' })
    })
  }

  return next()
}

// FIXME: find a way to conserve local after logout? In a cookie?

export {
  initI18n,
  i18nMiddleware,
  i18nResourcesLoader,
  i18nChangeLocale
}
