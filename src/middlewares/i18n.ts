import * as express from 'express'
import { CONFIG } from '../helpers/config'
import { logger } from '../helpers/log'
import { i18n } from 'i18next'
import { readdirSync, lstatSync } from 'fs'
import { join } from 'path'
const i18next: i18n = require('i18next')
const i18nextFsBackend = require('i18next-fs-backend')
const i18nextMiddleware = require('i18next-http-middleware')

let supportedLanguagesInfo: Array<{
  key: string
  label: string
}>

async function initI18n (): Promise<void> {
  const supportedLanguages = readdirSync('dist/i18n/locales').filter((fileName) => {
    const joinedPath = join('dist/i18n/locales', fileName)
    const isDirectory = lstatSync(joinedPath).isDirectory()
    return isDirectory
  })
  logger.info('Loading supported languages: ' + supportedLanguages.join(', '))

  await i18next.use(i18nextMiddleware.LanguageDetector).use(i18nextFsBackend).init({
    backend: {
      loadPath: 'dist/i18n/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['querystring', /* 'session', */ 'cookie', 'header'],
      lookupQuerystring: '_language',
      lookupCookie: CONFIG.COOKIES.PREFIX + 'language',
      caches: ['cookie'],
      cookieSameSite: 'strict',
      cookieSecure: true,
      cookiePath: '/',
      cookieExpirationDate: new Date(Date.UTC(9999, 11, 31))
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
    missingKeyHandler: (
      lngs: readonly string[],
      ns: string,
      key: string,
      fallbackValue: string,
      _updateMissing: boolean,
      _options: any
    ): void => {
      const l = lngs.toString()
      logger.error(`Missing localized string: lng=${l}, ns=${ns}, key=${key}, fallbackValue=${fallbackValue}.`)
    }
  })

  supportedLanguagesInfo = []
  for (let i = 0; i < supportedLanguages.length; i++) {
    const l = supportedLanguages[i]
    if (!l.includes('-')) {
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

function i18nMiddleware (): any {
  return i18nextMiddleware.handle(i18next)
}

function i18nResourcesLoader (): any {
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
function i18nChangeLocale (req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (req.query._language) {
    // i18next will save the language in cookie/session (see detection.cache)
    const url = req.originalUrl.replace(/(\?|&)_language=.*(&|$)/g, '')
    logger.debug('Redirecting to: "%s".', url)
    return res.redirect(url)
  }

  if (supportedLanguagesInfo) {
    let urlBase = req.originalUrl
    if (urlBase[urlBase.length] !== '&') {
      if (urlBase.includes('?')) {
        urlBase += '&'
      } else {
        urlBase += '?'
      }
    }
    res.locals.changeLocaleInformations = supportedLanguagesInfo.map(language => {
      return Object.assign({}, language, { url: urlBase + '_language=' + encodeURIComponent(language.key) + '&' })
    })
  }
  return next()
}

export {
  initI18n,
  i18nMiddleware,
  i18nResourcesLoader,
  i18nChangeLocale
}
