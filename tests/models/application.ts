/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'

import { flushTests, flushTestsAndInitDB } from '../test-utils'

describe('models/application/application.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  it('TODO: test application model')
})
