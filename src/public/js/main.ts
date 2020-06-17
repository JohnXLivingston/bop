import getLogger from './utils/logger'
import { notifications } from './lib/notifications'
import { testFunction } from '../../shared/test'
import '../scss/main.scss'

require('./common')

require('jquery-ui/themes/base/core.css')
require('jquery-ui/themes/base/theme.css')

require('jquery-ui/ui/widget')

require('jquery-ui/themes/base/accordion.css')
require('jquery-ui/ui/widgets/accordion')

require('jquery-ui/themes/base/draggable.css')
require('jquery-ui/ui/widgets/draggable')

require('jquery-ui/ui/position')

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
})
testFunction()
