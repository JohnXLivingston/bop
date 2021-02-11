/* eslint-disable @typescript-eslint/no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests } from '../../test-utils'
import { ensureId } from 'bop/shared/utils/object-id'
import { task1 } from '../../test-utils/examples'
import { TaskObject } from 'bop/shared/objects'

const expect = chai.expect

describe('shared/objects/utils/object-id.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('ensureId', function () {
    it('should return correct value for null', function () {
      expect(ensureId('user', null)).to.be.null
    })
    it('should return correct value for a number', function () {
      expect(ensureId('user', 12)).to.be.equal(12)
    })
    it('should return correct value for an object', function () {
      const task = new TaskObject(task1)
      expect(ensureId('task', task)).to.be.equal(task.id)
    })
    it('should fail with an object of the wrong type', function () {
      const task = new TaskObject(task1)
      expect(() => ensureId('user', task)).to.throw()
    })
    it('should return correct value for a string', function () {
      expect(ensureId('task', 'task/2345')).to.be.equal(2345)
    })
    it('should fail with an incorrect string', function () {
      expect(() => ensureId('task', 'user/123')).to.throw()
    })
    it('should fail with an incorrect value type', function () {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(() => ensureId('task', { not: 'good' } as any)).to.throw()
    })
    it('should fail with undefined', function () {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(() => ensureId('task', undefined!)).to.throw()
    })
  })
})
