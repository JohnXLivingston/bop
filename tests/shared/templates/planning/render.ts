/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests, testNunjucksTemplate } from '../../../test-utils'
import { TaskObject } from 'bop/shared/objects'
import { task1, planningProperties, dateLayout } from '../../../test-utils/examples'

chai.use(require('chai-match'))
const expect = chai.expect

describe('Shared templates/planning/render', function () {
  before(flushTests)
  after(flushTests)

  it('Should render correct html', async function () {
    const task = new TaskObject(task1)
    const vars: NodeRenderVars = {
      planningProperties,
      node: {
        type: 'object',
        object: task,
        calendarContent: task.toCalendarContent(dateLayout, task.allocations[0]?.id)
      }
    }
    const html = await testNunjucksTemplate('shared/templates/planning/render.njk', vars)

    expect(html, 'Template rendered content').not.to.be.equal('')
  })

  it('TODO: test the template content.')
  it('TODO: test with various object types.')
  it('TODO: test with various node type.')
})
