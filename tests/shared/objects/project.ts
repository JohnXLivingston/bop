/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { project1 } from '../../test-utils/examples'

import { ProjectObject } from '../../../src/shared/objects/project/project.object'

const expect = chai.expect

describe('shared/objects/project/project.object.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct project', function () {
      const project = new ProjectObject(project1)
      expect(project, 'instanceOf').to.be.instanceOf(ProjectObject)
      expect(project.id, 'project.id').to.be.equal(0)
      expect(project.key, 'project.key').to.be.equal('project/0')
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const project = new ProjectObject(project1)
      expect(project.toFormattedJSON()).to.be.deep.equal(project1)
    })
  })
})
