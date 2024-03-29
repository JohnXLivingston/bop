import getLogger from './utils/logger'
import { notifications } from './lib/notifications'
import { testFunction } from 'bop/shared/test'
import { parseWidgets } from './utils/widgets'
import { initI18n } from './utils/i18n'
import 'bop/public/scss/main.scss'

require('./common')
require('./widgets/locale')
require('./widgets/sidebar')
require('./widgets/wheelmenu')

const logger = getLogger('main.ts')
logger.info(`Running BOP build ${BUILD}.`)

const pJquery = new Promise<void>((resolve) => {
  $(() => {
    notifications.connect()
    resolve()
  })
})

const pI18n = initI18n()

Promise.all([pJquery, pI18n]).then(() => {
  if ($('[data-auto-reload-dev-mode]').length) {
    notifications.autoReloadDevMode($('[data-auto-reload-dev-mode]').is(':checked'))
  }
  $('body').on('click', '[data-auto-reload-dev-mode]', (ev) => {
    const cb = $(ev.currentTarget)
    notifications.autoReloadDevMode(cb.is(':checked'))
  })

  parseWidgets()
}, () => {
  logger.error('Failed initializing the application.')
})
testFunction()
