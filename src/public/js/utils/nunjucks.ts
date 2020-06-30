import { gettext, format } from './i18n'
import { getContext } from './context'

function nunjucksContext (context: any): object {
  const r = Object.assign({}, {
    gettext,
    format,
    context: getContext()
  }, context)
  return r
}

declare class Template {
  render(context?: object): string;
}

export {
  nunjucksContext,
  Template
}
