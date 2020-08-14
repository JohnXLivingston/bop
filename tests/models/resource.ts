/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'
import * as dbTest from '../test-utils/database'

import { ResourceModel } from '../../src/models/resource'
import { CONSTRAINTS } from '../../src/helpers/config/constants'

const expect = chai.expect
chai.use(require('chai-as-promised'))

describe('models/resource/resource.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  const resource1Id = 1
  const resource1Data = {
    name: 'My first resource',
    resourceType: 'person'
  }

  dbTest.testModelCreationAndDeletion<ResourceModel>({
    name: 'Resource',
    ObjectClass: ResourceModel,
    data: resource1Data,
    mandatoryFields: ['name', 'resourceType'],
    expectedObjectId: resource1Id,
    optimisticLocking: true
  })

  dbTest.testModelUpdate<ResourceModel>({
    name: 'Resource',
    data: resource1Data,
    ObjectClass: ResourceModel,
    optimisticLocking: true,
    updateTests: [
      { name: 'Another name' },
      { resourceType: 'room' }
    ]
  })

  dbTest.testModelConstraint<ResourceModel>({
    name: 'Resource',
    ObjectClass: ResourceModel,
    data: {
      name: 'My second resource',
      resourceType: 'room'
    },
    constraintTests: [
      {
        type: 'too_short',
        field: 'name',
        minLength: CONSTRAINTS.RESOURCE.NAME.min
      },
      {
        type: 'too_long',
        field: 'name',
        maxLength: CONSTRAINTS.RESOURCE.NAME.max
      }
    ]
  })

  describe('Resource methods', function () {
    describe('toFormattedJSON', function () {
      it('Should work', async function () {
        let resource: ResourceModel | null = new ResourceModel(resource1Data)
        await resource.save()
        const resourceId = resource?.id
        resource = await ResourceModel.findByPk(resourceId)
        expect(resource?.toFormattedJSON()).to.be.deep.equal({
          id: resourceId,
          type: 'resource',
          key: 'resource/' + resourceId,
          version: 0,
          name: resource1Data.name,
          resourceType: resource1Data.resourceType
        })
      })
    })
  })
})
