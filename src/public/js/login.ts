import { parseWidgets } from './widgets/utils'

require('./common')
require('../scss/login.scss')
require('./widgets/locale')

$(() => {
  parseWidgets()
})
