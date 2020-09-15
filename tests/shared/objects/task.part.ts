/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { task1allocation1part1, task1allocation1part2 } from '../../test-utils/examples'

import { TaskPartObject } from '../../../src/shared/objects/task/task.part.object'

const expect = chai.expect

describe('shared/objects/task/task.part.object.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct task', function () {
      const taskpart = new TaskPartObject(task1allocation1part1)
      expect(taskpart, 'instanceOf').to.be.instanceOf(TaskPartObject)
      expect(taskpart.id, 'project.id').to.be.equal(0)
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const taskpart1 = new TaskPartObject(task1allocation1part1)
      const taskpart2 = new TaskPartObject(task1allocation1part2)
      expect(TaskPartObject.toFormattedJSON([taskpart1, taskpart2]))
        .to.be.deep.equal([task1allocation1part1, task1allocation1part2])
    })
  })
})
