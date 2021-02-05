/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests, testNunjucksTemplate } from '../../../test-utils'

chai.use(require('chai-match'))
const expect = chai.expect

describe('Shared templates/planning/widget', function () {
  before(flushTests)
  after(flushTests)

  it('Should render correct html', async function () {
    const planningProperties: PlanningProperties = {
      nbWeeks: 2
    }
    const vars = {
      planningProperties
    }
    const html = await testNunjucksTemplate('shared/templates/planning/widget.njk', vars)

    expect(html, 'Template rendered content').not.to.be.equal('')
  })

  it('TODO: test the template content.')
})
