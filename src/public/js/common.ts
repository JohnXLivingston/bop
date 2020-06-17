// first initialize logger
import getLogger from './utils/logger'
// polyfill: ECMASCRIPT features
import 'core-js/stable'
// polyfill: needed to use transpiled generator functions
import 'regenerator-runtime/runtime'

import { setSharedLogger } from '../../shared/utils/logger'

setSharedLogger(getLogger('shared'))
