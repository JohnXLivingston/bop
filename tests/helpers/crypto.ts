/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../test-utils'
import { generateRandomPassword, cryptPassword, comparePassword } from '../../src/helpers/crypto'

chai.use(require('chai-match'))
const expect = chai.expect

describe('Helpers / Crypto', function () {
  before(flushTests)
  after(flushTests)

  describe('generateRandomPassword', function () {
    it('Should generate a valid random password', async function () {
      const pwd = await generateRandomPassword()
      expect(pwd, 'String').to.be.a('string')
      expect(pwd, 'Length').to.have.lengthOf(20)
      expect(pwd, 'Regexp').to.match(/^[a-zA-Z?,.;:!%*&-_@]+$/)
    })

    it('Should generated different password when called multiple times', async function () {
      const pwd = await generateRandomPassword()
      const pwd2 = await generateRandomPassword()
      expect(pwd2).to.not.equal(pwd)
    })
  })

  describe('cryptPassword', function () {
    it('Should generated a bcrypt hash', async function () {
      const hash = await cryptPassword('this_is_a_password')
      expect(hash, 'String').to.be.a('string')
      expect(hash, 'Length').to.have.lengthOf(60)
      expect(hash.startsWith('$2b$10$'), 'Begins with $2b$10$').to.be.true
    })

    it('Should generate different hash with the same password', async function () {
      const hash = await cryptPassword('this_is_a_password')
      const hash2 = await cryptPassword('this_is_a_password')
      expect(hash).to.not.equal(hash2)
    })
  })

  describe('comparePassword', function () {
    it('Should return true with correct password', async function () {
      const pwd = 'this_is_*_password'
      const hash = await cryptPassword(pwd)
      const r = await comparePassword(pwd, hash)
      expect(r).to.be.true
    })

    it('Should return false with incorrect password', async function () {
      const pwd = 'this_is_*_password'
      const hash = await cryptPassword(pwd)
      const r = await comparePassword(pwd + '.', hash)
      expect(r).to.be.false
    })
  })
})
