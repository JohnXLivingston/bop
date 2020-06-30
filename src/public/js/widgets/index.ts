import { initWidgetsLocale } from './locale'
import { initWidgetsPlanning } from './planning'
import { initWidgetsSidebar } from './sidebar'

export * from './locale'
export * from './planning'
export * from './sidebar'

function initAllWidgets () {
  initWidgetsLocale()
  initWidgetsSidebar()
  initWidgetsPlanning()
}

export {
  initAllWidgets
}
