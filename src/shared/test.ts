// This module is just an test file for testing webpack/babel configuration.
// It will be remove when real code will be ready.
import { logger } from './utils/logger'

function testFunction (): void {
  logger.debug('yes, the test function works')
}

export {
  testFunction
}
