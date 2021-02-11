/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../../test-utils'
import {
  task1,
  taskWithUnallocatedLines,
  resource1,
  dateLayout,
  task1allocation2
} from '../../test-utils/examples'

import { TaskObject } from 'bop/shared/objects/task/task.object'
import { TaskPartObject } from 'bop/shared/objects/task/task.part.object'
import { ResourceObject } from 'bop/shared/objects/resource/resource.object'
import { saveExamples, SavedExamples } from '../../test-utils/saved-example'

const expect = chai.expect
let savedExamples: SavedExamples

describe('shared/objects/task/task.object.ts', function () {
  before(flushTestsAndInitDB)
  before(async () => {
    savedExamples = await saveExamples()
  })
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct task', function () {
      const task = new TaskObject(task1)
      expect(task, 'instanceOf').to.be.instanceOf(TaskObject)
      expect(task.id, 'project.id').to.be.equal(0)
      expect(task.key, 'project.key').to.be.equal('task/0')
    })
    it('should instanciate the correct task from the db', function () {
      const task = new TaskObject(savedExamples.task1.toFormattedJSON())
      expect(task, 'instanceOf').to.be.instanceOf(TaskObject)
      expect(task.id, 'project.id').to.be.equal(savedExamples.task1.id)
      expect(task.key, 'project.key').to.be.equal('task/' + task.id?.toString())
    })
    it('should correctly handle unallocated allocations', function () {
      const task = new TaskObject(savedExamples.taskWithUnallocatedLines.toFormattedJSON())
      expect(task, 'instanceOf').to.be.instanceOf(TaskObject)
      expect(task.id, 'project.id').to.be.equal(savedExamples.taskWithUnallocatedLines.id)
      expect(task.key, 'project.key').to.be.equal('task/' + task.id?.toString())
      expect(task.allocations[1].resourceId, 'allocations[1].resourceId').to.be.null
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const task = new TaskObject(task1)
      expect(task.toFormattedJSON()).to.be.deep.equal(task1)
    })
    it('should return an object deeply equal to the original for a saved task', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      expect(task.toFormattedJSON()).to.be.deep.equal(savedExamples.task1.toFormattedJSON())
    })
    it('should return an object deeply equal to the original for a saved task with unallocated lines', function () {
      const task: TaskObject = savedExamples.taskWithUnallocatedLines.toObject()
      expect(task.toFormattedJSON()).to.be.deep.equal(savedExamples.taskWithUnallocatedLines.toFormattedJSON())
    })
  })

  describe('isResourceAllocated', function () {
    it('should find unallocated resources', function () {
      const task: TaskObject = savedExamples.taskWithUnallocatedLines.toObject()
      expect(task.isResourceAllocated(null)).to.be.true
    })
    it('should not find unallocated resources if there is none', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      expect(task.isResourceAllocated(null)).to.be.false
    })
    it('should not accept the 0 value', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      expect(() => task.isResourceAllocated(0)).to.throw()
    })
    it('should find resource by numerical id', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      expect(task.isResourceAllocated(savedExamples.resource2.id)).to.be.true
    })
    it('should not find resource by numerical id if not present', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      expect(task.isResourceAllocated(13464641)).to.be.false
    })
    it('should find resource by key string', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      const resource = savedExamples.resource2
      expect(task.isResourceAllocated(`resource/${resource.id as number}`)).to.be.true
    })
    it('should not find resource by key string if not present', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      expect(task.isResourceAllocated('resource/135463431')).to.be.false
    })
    it('should find resource by resource object', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      const resource: ResourceObject = savedExamples.resource2.toObject()
      expect(task.isResourceAllocated(resource)).to.be.true
    })
    it('should not find resource by resource object if not present', function () {
      const task: TaskObject = savedExamples.task1.toObject()
      const resource: ResourceObject = savedExamples.resource3.toObject()
      expect(task.isResourceAllocated(resource)).to.be.false
    })
  })

  describe('resourceParts', function () {
    it('should return correct part for an allocated resource', function () {
      const task = new TaskObject(task1)
      const r = { ...resource1, id: 2, key: 'resource/2' }
      const resource = new ResourceObject(r)
      const parts = task.resourceParts(resource)
      expect(parts).to.be.an('array').lengthOf(2)
      expect(parts[0], 'instanceOf 1').to.be.instanceOf(TaskPartObject)
      expect(parts[1], 'instanceOf 1').to.be.instanceOf(TaskPartObject)
      expect(parts[0].start, 'correct part 1').to.be.equal(task1allocation2.parts[0].start)
      expect(parts[1].start, 'correct part 2').to.be.equal(task1allocation2.parts[1].start)
    })
    it('should return empty list for an unallocated resource', function () {
      const task = new TaskObject(task1)
      const parts = task.resourceParts(12345)
      expect(parts).to.be.an('array').lengthOf(0)
    })
    it('should return correct allocations for null', function () {
      const task = new TaskObject(taskWithUnallocatedLines)
      const parts = task.resourceParts(null)
      expect(parts).to.be.an('array').lengthOf(2)
      expect(parts[0], 'instanceOf 1').to.be.instanceOf(TaskPartObject)
      expect(parts[1], 'instanceOf 1').to.be.instanceOf(TaskPartObject)
      expect(parts[0].start, 'correct part 1').to.be.equal(taskWithUnallocatedLines.allocations[1].parts[0].start)
      expect(parts[1].start, 'correct part 2').to.be.equal(taskWithUnallocatedLines.allocations[1].parts[1].start)
    })
  })

  describe('toCalendarContent', function () {
    it('should return an object deeply equal to what is expected', function () {
      const task = new TaskObject(task1)
      expect(task.toCalendarContent(dateLayout, task.allocations[0]?.id)).to.be.deep.equal({
        items: []
      })
    })
  })
})
