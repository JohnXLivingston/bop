/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'

import { UserModel } from '../../src/models/user'

const expect = chai.expect

describe('models/user/user.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  describe('The default admin user', function () {
    it('There should be an admin user', async function () {
      const user = await UserModel.findByPk(1)
      it('The admin user must be found and have valid data.', function () {
        expect(user).to.not.to.be.null
      })
      it('The admin user has the correct password.', function () {
        expect(user?.isPasswordMatch('password')).to.be.true
        expect(user?.isPasswordMatch('not this one')).to.be.false
      })
    })
  })

  it('TODO: complete test for user model')
})
