import i18next from 'i18next'
import HttpApi from 'i18next-http-backend'
import getLogger from './logger'

const logger = getLogger('i18n')
declare global {
  interface Window {
    // eslint-disable-next-line camelcase
    json_locale_data: any,
    gettext: (msgId: string) => string
    format: (fmt: any, obj: any, named: any) => string
  }
}

if (!window.json_locale_data) {
  window.json_locale_data = {}
}

const gettext = (msgid: string): string => {
  if (window.json_locale_data && window.json_locale_data.messages) {
    const dict = window.json_locale_data.messages || {}
    if (dict[msgid] && dict[msgid].length >= 2 && dict[msgid][1].trim() !== '') {
      return dict[msgid][1]
    }
  }
  return msgid
}

const format = (fmt: any, obj: any, named: any): string => {
  if (!fmt) return ''
  if (!fmt.replace) {
    return fmt
  }
  if (named) {
    return fmt.replace(/%\(\w+\)s/g, (match: any) => String(obj[match.slice(2, -2)]))
  } else {
    return fmt.replace(/%s/g, () => String(obj.shift()))
  }
}

window.gettext = gettext
window.format = format

async function initI18n () {
  await i18next.use(HttpApi).init({
    backend: {
      allowMultiLoading: false, // TODO: enable multiloading
      loadPath: '/i18n/{{lng}}/{{ns}}.json'
    },
    debug: false,
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: $('body').attr('lang') || 'en',
    ns: 'common',
    saveMissing: true,
    missingKeyHandler: (lng: string[], ns: string, key: string, fallbackValue: string) => {
      logger.error(`Missing localized string: lng=${lng}, ns=${ns}, key=${key}, fallbackValue=${fallbackValue}.`)
    }
  })
}

export {
  gettext,
  format,
  i18next,
  initI18n
}
