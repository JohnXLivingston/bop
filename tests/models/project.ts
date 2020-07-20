/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'
import * as dbTest from '../test-utils/database'

import { ProjectModel } from '../../src/models/project'
import { CONSTRAINTS } from '../../src/helpers/config/constants'

const expect = chai.expect
chai.use(require('chai-as-promised'))

describe('models/project/project.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  const project1Id = 1
  const project1Data = {
    name: 'My first project'
  }

  dbTest.testModelCreationAndDeletion<ProjectModel>({
    name: 'Project',
    ObjectClass: ProjectModel,
    data: project1Data,
    mandatoryFields: ['name'],
    expectedObjectId: project1Id,
    optimisticLocking: true
  })

  dbTest.testModelUpdate<ProjectModel>({
    name: 'Project',
    data: project1Data,
    ObjectClass: ProjectModel,
    optimisticLocking: true,
    updateTests: [
      { name: 'Anoter name' }
    ]
  })

  dbTest.testModelConstraint<ProjectModel>({
    name: 'Project',
    ObjectClass: ProjectModel,
    data: {
      name: 'My second project'
    },
    constraintTests: [
      {
        type: 'unique',
        name: 'name',
        data1: { name: 'Project name' },
        data2: { name: 'Project name' }
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
      }
    ]
  })

  describe('Project methods', function () {
    describe('toFormattedJSON', function () {
      it('Should work', async function () {
        let project: ProjectModel | null = new ProjectModel(project1Data)
        await project.save()
        const projectId = project?.id
        project = await ProjectModel.findByPk(projectId)
        expect(project?.toFormattedJSON()).to.be.deep.equal({
          id: projectId,
          version: 0,
          name: project1Data.name
        })
      })
    })
  })
})