/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { resource1 } from '../../test-utils/examples'

import { ResourceObject } from '../../../src/shared/objects/resource/resource.object'

const expect = chai.expect

describe('shared/objects/resource/resource.object.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct resource', function () {
      const resource = new ResourceObject(resource1)
      expect(resource, 'instanceOf').to.be.instanceOf(ResourceObject)
      expect(resource.id, 'project.id').to.be.equal(0)
      expect(resource.key, 'project.key').to.be.equal('resource/0')
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const resource = new ResourceObject(resource1)
      expect(resource.toFormattedJSON()).to.be.deep.equal(resource1)
    })
  })
})
