import { parseWidgets } from './utils/widgets'
import { initI18n } from './utils/i18n'

require('./common')
require('../scss/login.scss')
require('./widgets/locale')

const pJquery = new Promise((resolve) => {
  $(() => {
    resolve()
  })
})

const pI18n = initI18n()

Promise.all([pJquery, pI18n]).then(() => {
  parseWidgets()
}, () => {})
