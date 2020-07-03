import getLogger from './utils/logger'
import { notifications } from './lib/notifications'
import { testFunction } from '../../shared/test'
import { parseWidgets } from './widgets/utils'
import '../scss/main.scss'

require('./common')
require('./widgets/locale')
require('./widgets/sidebar')

const logger = getLogger('main.ts')
logger.debug('JS is okay.')

$(() => {
  notifications.connect()

  if ($('[data-auto-reload-dev-mode]').length) {
    notifications.autoReloadDevMode($('[data-auto-reload-dev-mode]').is(':checked'))
  }
  $('body').on('click', '[data-auto-reload-dev-mode]', (ev) => {
    const cb = $(ev.currentTarget)
    notifications.autoReloadDevMode(cb.is(':checked'))
  })

  parseWidgets()
})
testFunction()
