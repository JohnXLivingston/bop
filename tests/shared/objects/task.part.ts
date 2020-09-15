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
      const taskpart = new TaskPartObject(task1allocation1part1, task1allocation1part2.start)
      expect(taskpart, 'instanceOf').to.be.instanceOf(TaskPartObject)
      expect(taskpart.id, 'project.id').to.be.equal(0)
      expect(taskpart.end, 'end').to.be.equal(task1allocation1part2.start)

      const taskpart2 = new TaskPartObject(task1allocation1part2, null)
      expect(taskpart2.end, 'end').to.be.equal('9999-12-31')
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const taskpart1 = new TaskPartObject(task1allocation1part1, task1allocation1part2.start)
      expect(taskpart1.toFormattedJSON())
        .to.be.deep.equal(task1allocation1part1)
    })
  })

  describe('static toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const taskpart1 = new TaskPartObject(task1allocation1part1, task1allocation1part2.start)
      const taskpart2 = new TaskPartObject(task1allocation1part2, null)
      expect(TaskPartObject.toFormattedJSON([taskpart1, taskpart2]))
        .to.be.deep.equal([task1allocation1part1, task1allocation1part2])
    })
  })
})
