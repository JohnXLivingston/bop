import { initWidgetsLocale } from './locale'
import { initWidgetsSidebar } from './sidebar'

export * from './locale'
export * from './sidebar'

function initCommonWidgets () {
  initWidgetsLocale()
  initWidgetsSidebar()
}

export {
  initCommonWidgets
}
