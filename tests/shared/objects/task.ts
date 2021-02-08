/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { task1, taskWithUnallocatedLines, resource1 } from '../../test-utils/examples'

import { TaskObject } from '../../../src/shared/objects/task/task.object'
import { ResourceObject } from '../../../src/shared/objects/resource/resource.object'

const expect = chai.expect

describe('shared/objects/task/task.object.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct task', function () {
      const task = new TaskObject(task1)
      expect(task, 'instanceOf').to.be.instanceOf(TaskObject)
      expect(task.id, 'project.id').to.be.equal(0)
      expect(task.key, 'project.key').to.be.equal('task/0')
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const task = new TaskObject(task1)
      expect(task.toFormattedJSON()).to.be.deep.equal(task1)
    })
  })

  describe('isResourceAllocated', function () {
    it('should find unallocated resources', function () {
      const task = new TaskObject(taskWithUnallocatedLines)
      expect(task.isResourceAllocated(undefined)).to.be.true
    })
    it('should not find unallocated resources if there is none', function () {
      const task = new TaskObject(task1)
      expect(task.isResourceAllocated(undefined)).to.be.false
    })
    it('should not accept the 0 value', function () {
      const task = new TaskObject(task1)
      expect(() => task.isResourceAllocated(0)).to.throw()
    })
    it('should find resource by numerical id', function () {
      const task = new TaskObject(task1)
      expect(task.isResourceAllocated(2)).to.be.true
    })
    it('should not find resource by numerical id if not present', function () {
      const task = new TaskObject(task1)
      expect(task.isResourceAllocated(3)).to.be.false
    })
    it('should find resource by key string', function () {
      const task = new TaskObject(task1)
      expect(task.isResourceAllocated('resource/2')).to.be.true
    })
    it('should not find resource by key string if not present', function () {
      const task = new TaskObject(task1)
      expect(task.isResourceAllocated('resource/3')).to.be.false
    })
    it('should find resource by resource object', function () {
      const task = new TaskObject(task1)
      const r = { ...resource1, id: 2, key: 'resource/2' }
      const resource = new ResourceObject(r)
      expect(task.isResourceAllocated(resource)).to.be.true
    })
    it('should not find resource by resource object if not present', function () {
      const task = new TaskObject(task1)
      const r = { ...resource1, id: 3, key: 'resource/3' }
      const resource = new ResourceObject(r)
      expect(task.isResourceAllocated(resource)).to.be.false
    })
  })
})
