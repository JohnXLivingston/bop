/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'
import * as dbTest from '../test-utils/database'

import {
  ProjectModel,
  ResourceModel,
  TaskModel,
  TaskAllocationModel,
  TaskPartModel
} from '../../src/models'
import { CONSTRAINTS } from '../../src/helpers/config/constants'

const expect = chai.expect
chai.use(require('chai-as-promised'))

describe('models/task/task.ts', function () {
  let project1: ProjectModel
  let project2: ProjectModel
  let resource1: ResourceModel
  let resource2: ResourceModel
  const task1Id = 1
  const task1Data = {
    name: 'My first task',
    projectId: null,
    start: '2020-01-01',
    end: '2020-01-31',
    work: 7 * 20 * 60
  }
  before(flushTestsAndInitDB)
  before(async function () {
    // Creating a project
    project1 = new ProjectModel({
      name: 'Project 1'
    })
    project2 = new ProjectModel({
      name: 'Project 2'
    })
    resource1 = new ResourceModel({
      name: 'Resource 1',
      resourceType: 'person'
    })
    resource2 = new ResourceModel({
      name: 'Resource 2',
      resourceType: 'person'
    })
    await Promise.all([
      project1.save(),
      project2.save(),
      resource1.save(),
      resource2.save()
    ])
    task1Data.projectId = project1.id
  })
  after(flushTests)

  describe('task table', function () {
    dbTest.testModelCreationAndDeletion<TaskModel>({
      name: 'Task',
      ObjectClass: TaskModel,
      data: task1Data,
      mandatoryFields: ['name', 'projectId', 'start', 'end', 'work'],
      expectedObjectId: task1Id,
      optimisticLocking: true
    })

    dbTest.testModelUpdate<TaskModel>({
      name: 'Task',
      ObjectClass: TaskModel,
      data: task1Data,
      optimisticLocking: true,
      updateTests: [
        { name: 'Anoter name' },
        { start: '2020-06-01', end: '2020-06-30', work: 7 * 19 * 60 },
        { testName: 'projectId', testFunc: () => { return { projectId: project2.id } } }
      ]
    })

    dbTest.testModelConstraint<TaskModel>({
      name: 'Task',
      ObjectClass: TaskModel,
      data: {
        name: 'My second task',
        projectId: 1,
        start: '2020-01-01',
        end: '2020-01-31',
        work: 7 * 20 * 60
      },
      constraintTests: [
        {
          type: 'foreign_key',
          field: 'projectId'
        },
        {
          type: 'too_short',
          field: 'name',
          minLength: CONSTRAINTS.TASK.NAME.min
        },
        {
          type: 'too_long',
          field: 'name',
          maxLength: CONSTRAINTS.TASK.NAME.max
        },
        {
          type: 'dateonly',
          field: 'start'
        },
        {
          type: 'dateonly',
          field: 'end'
        },
        {
          type: 'integer',
          field: 'work'
        }
      ]
    })
  })

  describe('taskallocation table', function () {
    let task: TaskModel
    before(async function () {
      task = new TaskModel(task1Data)
      await task.save()
    })
    // taskallocation1Data must be a function, because resource1 will only be
    // instanciated in «it» calls.
    const taskallocation1Data = (): any => {
      if (!resource1.id) {
        throw new Error('Test incorrect, missing resource id')
      }
      return {
        taskId: task.id,
        order: 1,
        resourceId: resource1.id,
        start: '2020-09-01',
        end: '2020-09-30',
        work: 8 * 20 * 60
      }
    }
    dbTest.testModelCreationAndDeletion<TaskAllocationModel>({
      name: 'TaskAllocation',
      ObjectClass: TaskAllocationModel,
      data: taskallocation1Data,
      mandatoryFields: ['order', 'start', 'end', 'work'],
      optimisticLocking: false
    })

    dbTest.testModelUpdate<TaskAllocationModel>({
      name: 'TaskAllocation',
      ObjectClass: TaskAllocationModel,
      data: taskallocation1Data,
      optimisticLocking: false,
      updateTests: [
        { order: 2 },
        { resourceId: null },
        { start: '2020-06-01', end: '2020-06-30', work: 7 * 19 * 60 }
      ]
    })

    dbTest.testModelConstraint<TaskAllocationModel>({
      name: 'TaskAllocation',
      ObjectClass: TaskAllocationModel,
      data: () => {
        return {
          taskId: task.id,
          order: 2,
          resourceId: resource1.id,
          start: '2020-09-01',
          end: '2020-09-30',
          work: 8 * 20 * 60
        }
      },
      constraintTests: [
        {
          type: 'foreign_key',
          field: 'taskId'
        },
        {
          type: 'nullable_foreign_key',
          field: 'resourceId'
        },
        {
          type: 'unsigned_integer',
          field: 'order'
        },
        {
          type: 'dateonly',
          field: 'start'
        },
        {
          type: 'dateonly',
          field: 'end'
        },
        {
          type: 'integer',
          field: 'work'
        }
      ]
    })
  })

  describe('Test taskpart table.', function () {
    let task: TaskModel
    let allocation: TaskAllocationModel
    before(async function () {
      task = new TaskModel(task1Data)
      await task.save()
      allocation = new TaskAllocationModel({
        taskId: task.id,
        order: 1,
        resourceId: resource1.id,
        start: '2020-09-01',
        end: '2020-09-30',
        work: 8 * 20 * 60
      })
      await allocation.save()
    })
    // taskpart1Data must be a function, because resource1 will only be
    // instanciated in «it» calls.
    const taskpart1Data = (): any => {
      return {
        allocationId: allocation.id,
        start: '2020-09-01',
        load: 8 * 60,
        autoMerge: true
      }
    }
    dbTest.testModelCreationAndDeletion<TaskPartModel>({
      name: 'TaskPart',
      ObjectClass: TaskPartModel,
      data: taskpart1Data,
      mandatoryFields: ['start', 'load', 'autoMerge'],
      optimisticLocking: false
    })

    dbTest.testModelUpdate<TaskPartModel>({
      name: 'TaskPart',
      ObjectClass: TaskPartModel,
      data: taskpart1Data,
      optimisticLocking: false,
      updateTests: [
        { autoMerge: false },
        { start: '2020-06-01', load: 7 * 60 }
      ]
    })

    dbTest.testModelConstraint<TaskPartModel>({
      name: 'TaskPart',
      ObjectClass: TaskPartModel,
      data: () => {
        return {
          allocationId: allocation.id,
          start: '2020-09-01',
          load: 8 * 60,
          autoMerge: true
        }
      },
      constraintTests: [
        {
          type: 'foreign_key',
          field: 'allocationId'
        },
        {
          type: 'dateonly',
          field: 'start'
        },
        {
          type: 'integer',
          field: 'load'
        },
        {
          type: 'boolean',
          field: 'autoMerge'
        }
      ]
    })
  })

  describe('Task methods', function () {
    describe('toFormattedJSON', function () {
      it('Should work', async function () {
        let task: TaskModel | null = new TaskModel({
          name: 'This is a task',
          projectId: project2.id,
          start: '2021-01-01',
          end: '2021-01-31',
          work: 14 * 20 * 60,
          allocations: [
            // allocations are not is the correct order here
            {
              // allocation2
              resourceId: resource2.id,
              order: 2,
              start: '2021-01-01',
              end: '2021-01-31',
              work: 14 * 20 * 60 / 2,
              parts: [
                {
                  // allocation2part1
                  start: '2021-01-01',
                  load: 60,
                  autoMerge: true
                },
                {
                  // allocation2part2
                  start: '2021-01-31',
                  load: 0,
                  autoMerge: true
                }
              ]
            },
            {
              // allocation1
              resourceId: resource1.id,
              order: 1,
              start: '2021-01-01',
              end: '2021-01-15',
              work: 14 * 20 * 60 / 2,
              parts: [
                // parts are not is the correct order here
                {
                  // allocation1part2
                  start: '2021-01-15',
                  load: 0,
                  autoMerge: true
                },
                {
                  // allocation1part1
                  start: '2021-01-01',
                  load: 120,
                  autoMerge: true
                }
              ]
            }
          ]
        }, {
          // TODO: use a transaction?
          include: [{
            association: 'allocations',
            include: [{
              association: 'parts'
            }]
          }]
        })
        await task.save()
        const taskId = task.id
        const allocation1 = task.allocations ? task.allocations[1] : null
        const allocation2 = task.allocations ? task.allocations[0] : null
        const allocation1Id = allocation1?.id
        const allocation2Id = allocation2?.id
        const allocation1part1 = allocation1?.parts ? allocation1.parts[1] : null
        const allocation1part2 = allocation1?.parts ? allocation1.parts[0] : null
        const allocation2part1 = allocation2?.parts ? allocation2.parts[0] : null
        const allocation2part2 = allocation2?.parts ? allocation2.parts[1] : null
        const allocation1part1Id = allocation1part1?.id
        const allocation1part2Id = allocation1part2?.id
        const allocation2part1Id = allocation2part1?.id
        const allocation2part2Id = allocation2part2?.id
        expect(taskId, 'Should have an id').to.not.be.null
        task = await TaskModel.findByPk(taskId)
        expect(task, 'Should be able to retrieve the task').to.not.be.null
        expect(task?.toFormattedJSON(), 'Calling toFormattedJSON').to.be.deep.equal({
          id: taskId,
          type: 'task',
          version: 0,
          name: 'This is a task',
          projectId: project2.id,
          start: '2021-01-01',
          end: '2021-01-31',
          work: 14 * 20 * 60,
          allocations: [
            {
              id: allocation1Id,
              resourceId: resource1.id,
              type: 'taskallocation',
              order: 1,
              start: '2021-01-01',
              end: '2021-01-15',
              work: 14 * 20 * 60 / 2,
              parts: [
                {
                  id: allocation1part1Id,
                  type: 'taskpart',
                  start: '2021-01-01',
                  load: 120,
                  autoMerge: true
                },
                {
                  id: allocation1part2Id,
                  type: 'taskpart',
                  start: '2021-01-15',
                  load: 0,
                  autoMerge: true
                }
              ]
            },
            {
              id: allocation2Id,
              resourceId: resource2.id,
              type: 'taskallocation',
              order: 2,
              start: '2021-01-01',
              end: '2021-01-31',
              work: 14 * 20 * 60 / 2,
              parts: [
                {
                  id: allocation2part1Id,
                  type: 'taskpart',
                  start: '2021-01-01',
                  load: 60,
                  autoMerge: true
                },
                {
                  id: allocation2part2Id,
                  type: 'taskpart',
                  start: '2021-01-31',
                  load: 0,
                  autoMerge: true
                }
              ]
            }
          ]
        })
      })
    })
  })
})
