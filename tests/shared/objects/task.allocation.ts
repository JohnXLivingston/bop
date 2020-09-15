/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { task1allocation1 } from '../../test-utils/examples'

import { TaskAllocationObject } from '../../../src/shared/objects/task/task.allocation.object'

const expect = chai.expect

describe('shared/objects/task/task.allocation.object.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct task', function () {
      const taskallocation = new TaskAllocationObject(task1allocation1)
      expect(taskallocation, 'instanceOf').to.be.instanceOf(TaskAllocationObject)
      expect(taskallocation.id, 'project.id').to.be.equal(0)
    })

    it('should fail if parts are not in a correct order.', function () {
      const data = { ...task1allocation1 }
      data.parts = [...data.parts].reverse()
      expect(() => new TaskAllocationObject(data)).to.be.throw()
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const taskallocation = new TaskAllocationObject(task1allocation1)
      expect(taskallocation.toFormattedJSON()).to.be.deep.equal(task1allocation1)
    })
  })
})
