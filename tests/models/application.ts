/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'

import { ApplicationModel } from '../../src/models/application'
import { LAST_MIGRATION_VERSION } from '../../src/initializers/database'

const expect = chai.expect

describe('models/application/application.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  it('should create a line in the application table.', async function () {
    const application = await ApplicationModel.findAll()
    expect(application).to.be.an('array').lengthOf(1)
    expect(application[0]).to.deep.include({
      id: 1,
      migrationVersion: LAST_MIGRATION_VERSION
    })
  })
})
