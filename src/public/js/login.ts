import { parseWidgets } from './utils/widgets'

require('./common')
require('../scss/login.scss')
require('./widgets/locale')

$(() => {
  parseWidgets()
})
