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

export {
  gettext,
  format
}
