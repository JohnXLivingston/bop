/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests, testNunjucksTemplate } from '../../../test-utils'
import { NodeRenderVars, PlanningProperties } from '../../../../src/shared/templates/planning/types'
import { TaskObject } from '../../../../src/shared/objects'
import { task1 } from '../../../test-utils/examples'

chai.use(require('chai-match'))
const expect = chai.expect

describe('Shared templates/planning/render', function () {
  before(flushTests)
  after(flushTests)

  it('Should render correct html', async function () {
    const task = new TaskObject(task1)
    const planningProperties: PlanningProperties = {
      nbWeeks: 2
    }
    const vars: NodeRenderVars = {
      planningProperties,
      node: {
        type: 'object',
        object: task
      }
    }
    const html = await testNunjucksTemplate('shared/templates/planning/render.njk', vars)

    expect(html, 'Template rendered content').not.to.be.equal('')
  })

  it('TODO: test the template content.')
  it('TODO: test with various object types.')
  it('TODO: test with various node type.')
})
