import { i18next } from './i18n'
import { getContext } from './context'

function nunjucksContext (context: any): object {
  const r = Object.assign({}, {
    i18n: i18next,
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
