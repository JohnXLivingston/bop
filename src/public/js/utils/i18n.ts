import i18next from 'i18next'
import HttpApi from 'i18next-http-backend'
import BackendAdapter from 'i18next-multiload-backend-adapter'
import getLogger from './logger'

const logger = getLogger('i18n')

async function initI18n () {
  const lng = $('html').attr('lang') || 'en'
  await i18next.use(BackendAdapter).init({
    backend: {
      backend: HttpApi,
      backendOption: {
        allowMultiLoading: true,
        loadPath: '/i18n?lng={{lng}}&ns={{ns}}&version=' + encodeURIComponent(BUILD)
      }
    },
    debug: false,
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: lng,
    load: 'all',
    ns: 'common',
    saveMissing: true,
    returnNull: false,
    returnEmptyString: false,
    missingKeyHandler: (lng: string[], ns: string, key: string, fallbackValue: string) => {
      logger.error(`Missing localized string: lng=${lng}, ns=${ns}, key=${key}, fallbackValue=${fallbackValue}.`)
    }
  })
}

export {
  i18next,
  initI18n
}
