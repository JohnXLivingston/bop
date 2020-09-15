/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { user1 } from '../../test-utils/examples'

import { UserObject } from '../../../src/shared/objects/user/user.object'

const expect = chai.expect

describe('shared/objects/user/user.object.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct user', function () {
      const user = new UserObject(user1)
      expect(user, 'instanceOf').to.be.instanceOf(UserObject)
      expect(user.id, 'user.id').to.be.equal(0)
      expect(user.key, 'user.key').to.be.equal('user/0')
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const user = new UserObject(user1)
      expect(user.toFormattedJSON()).to.be.deep.equal(user1)
    })
  })
})
