/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests, testNunjucksTemplate } from '../../../test-utils'
import { planningTestSet } from '../../../../src/shared/test'

chai.use(require('chai-match'))
const expect = chai.expect

describe('Shared templates/planning/render', function () {
  before(flushTests)
  after(flushTests)

  it('Should render correct html', async function () {
    const html = await testNunjucksTemplate('shared/templates/planning/render.njk', planningTestSet())

    expect(html, 'Template rendered content').not.to.be.equal('')
  })

  it('TODO: test the template content.')
})
