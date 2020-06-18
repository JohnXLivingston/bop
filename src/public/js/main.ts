import getLogger from './utils/logger'
import { notifications } from './lib/notifications'
import { testFunction } from '../../shared/test'
import { initWidgetsLocale } from './widgets/locale'
import '../scss/main.scss'

require('./common')

const logger = getLogger('main.ts')
logger.debug('JS is okay.')

$(() => {
  notifications.connect()

  if ($('[auto-reload-dev-mode]').length) {
    notifications.autoReloadDevMode($('[auto-reload-dev-mode]').is(':checked'))
  }
  $('body').on('click', '[auto-reload-dev-mode]', (ev) => {
    const cb = $(ev.currentTarget)
    notifications.autoReloadDevMode(cb.is(':checked'))
  })

  initWidgetsLocale()
})
testFunction()
