/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'
import * as dbTest from '../test-utils/database'

import { ProjectModel } from '../../src/models/project'
import { CONSTRAINTS } from '../../src/helpers/config/constants'

const expect = chai.expect
chai.use(require('chai-as-promised'))
let projectCounter = 1

describe('models/project/project.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  const project1Id = 1
  const project1Data = {
    name: 'My first project',
    color: '1'
  }

  dbTest.testModelCreationAndDeletion<ProjectModel>({
    name: 'Project',
    ObjectClass: ProjectModel,
    data: project1Data,
    mandatoryFields: ['name'], // FIXME: Add 'color'. I dont know why, but it does not work for now
    expectedObjectId: project1Id,
    optimisticLocking: true
  })

  dbTest.testModelUpdate<ProjectModel>({
    name: 'Project',
    data: project1Data,
    ObjectClass: ProjectModel,
    optimisticLocking: true,
    updateTests: [
      { name: 'Another name' },
      { color: '2' }
    ]
  })

  dbTest.testModelConstraint<ProjectModel>({
    name: 'Project',
    ObjectClass: ProjectModel,
    data: () => {
      return {
        name: 'My ' + (projectCounter++).toString() + ' project'
      }
    },
    constraintTests: [
      {
        type: 'unique',
        name: 'name',
        data1: { name: 'Project name', color: '1' },
        data2: { name: 'Project name', color: '2' }
      },
      {
        type: 'too_short',
        field: 'name',
        minLength: CONSTRAINTS.PROJECT.NAME.min
      },
      {
        type: 'too_long',
        field: 'name',
        maxLength: CONSTRAINTS.PROJECT.NAME.max
      },
      {
        type: 'too_short',
        field: 'color',
        minLength: 1
      },
      {
        type: 'too_long',
        field: 'color',
        maxLength: 2
      }
    ]
  })

  describe('Project methods', function () {
    describe('toFormattedJSON and toObject', function () {
      it('Should work', async function () {
        let project: ProjectModel | null = new ProjectModel(project1Data)
        await project.save()
        const projectId = project?.id
        project = await ProjectModel.findByPk(projectId)
        const expectedResult = {
          id: projectId,
          type: 'project',
          color: '1',
          version: 0,
          name: project1Data.name
        }
        expect(project?.toFormattedJSON(), 'toFormattedJSON').to.be.deep.equal(expectedResult)
        // NB: Project.toFormattedJSON is tested in another file. We can consider it as working here.
        expect(project?.toObject().toFormattedJSON(), 'toObject').to.be.deep.equal(expectedResult)
      })
    })
  })
})
