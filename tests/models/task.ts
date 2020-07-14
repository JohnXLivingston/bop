/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'
import * as dbTest from '../test-utils/database'

import { TaskModel, ProjectModel } from '../../src/models'
import { CONSTRAINTS } from '../../src/helpers/config/constants'

const expect = chai.expect
chai.use(require('chai-as-promised'))

describe('models/task/task.ts', function () {
  let project1: ProjectModel
  let project2: ProjectModel
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
    await Promise.all([project1.save(), project2.save()])
    task1Data.projectId = project1.id
  })
  after(flushTests)

  dbTest.testModelCreationAndDeletion<TaskModel>({
    name: 'Task',
    ObjectClass: TaskModel,
    data: task1Data,
    mandatoryFields: ['name', 'projectId', 'start', 'end', 'work'],
    expectedObjectId: task1Id
  })

  dbTest.testModelUpdate<TaskModel>({
    name: 'Task',
    ObjectClass: TaskModel,
    data: task1Data,
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

  describe('Task methods', function () {
    describe('toFormattedJSON', function () {
      it('Should work', async function () {
        let task: TaskModel | null = new TaskModel({
          name: 'This is a task',
          projectId: project2.id,
          start: '2021-01-01',
          end: '2021-01-31',
          work: 14 * 20 * 60
        })
        await task.save()
        const taskId = task?.id
        expect(taskId, 'Should have an id').to.not.be.null
        task = await TaskModel.findByPk(taskId)
        expect(task, 'Should be able to retrieve the task').to.not.be.null
        expect(task?.toFormattedJSON(), 'Calling toFormattedJSON').to.be.deep.equal({
          id: taskId,
          name: 'This is a task',
          projectId: project2.id,
          start: '2021-01-01',
          end: '2021-01-31',
          work: 14 * 20 * 60
        })
      })
    })
  })
})
