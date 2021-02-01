// first initialize logger
import getLogger from './utils/logger'
// polyfill: ECMASCRIPT features
import 'core-js/stable'
// polyfill: needed to use transpiled generator functions
import 'regenerator-runtime/runtime'

import { setSharedLogger } from 'bop/shared/utils/logger'

setSharedLogger(getLogger('shared'))

require('./utils/i18n')

require('jquery')

require('jquery-ui/themes/base/core.css')
require('jquery-ui/themes/base/theme.css')

require('jquery-ui/ui/widget')

require('jquery-ui/themes/base/accordion.css')
require('jquery-ui/ui/widgets/accordion')

require('jquery-ui/themes/base/draggable.css')
require('jquery-ui/ui/widgets/draggable')

require('jquery-ui/themes/base/resizable.css')
require('jquery-ui/ui/widgets/resizable')

require('jquery-ui/themes/base/dialog.css')
require('jquery-ui/ui/widgets/dialog')

require('jquery-ui/ui/effect')

require('jquery-ui/ui/position')

require('./jquery/utils')

// bop.svg is needed for the favicon.
require('../images/bop.svg')

require('./widgets/utils')
