import { describe, before, after, it } from 'mocha'
import { flushTests } from '../../test-utils'
import * as chai from 'chai'
import { dateToDay, dayToDate } from '../../../src/shared/utils/date'

const expect = chai.expect

describe('shared/utils/date.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('dateToDay', function () {
    it('should return 0', function () {
      expect(dateToDay('1970-01-01')).to.be.equal(0)
    })
    it('should fail with incorrect inputs', function () {
      expect(() => dateToDay('this_is_not_a_date'), 'string').to.throw()
      expect(() => dateToDay('2020-13-10'), 'month').to.throw()
      expect(() => dateToDay('2020-12-32'), 'day').to.throw()
    })
    it('should return correct values for month first and last day', function () {
      expect(dateToDay('2020-01-01'), '2020-01-01').to.be.equal(18262)
      expect(dateToDay('2020-01-31'), '2020-01-31').to.be.equal(18292)
      expect(dateToDay('2020-02-01'), '2020-02-01').to.be.equal(18293)
      expect(dateToDay('2020-02-29'), '2020-02-29').to.be.equal(18321)
      expect(dateToDay('2020-03-01'), '2020-03-01').to.be.equal(18322)
      expect(dateToDay('2020-03-31'), '2020-03-31').to.be.equal(18352)
      expect(dateToDay('2020-04-01'), '2020-04-01').to.be.equal(18353)
      expect(dateToDay('2020-04-30'), '2020-04-30').to.be.equal(18382)
      expect(dateToDay('2020-05-01'), '2020-05-01').to.be.equal(18383)
      expect(dateToDay('2020-05-31'), '2020-05-31').to.be.equal(18413)
      expect(dateToDay('2020-06-01'), '2020-06-01').to.be.equal(18414)
      expect(dateToDay('2020-06-30'), '2020-06-30').to.be.equal(18443)
      expect(dateToDay('2020-07-01'), '2020-07-01').to.be.equal(18444)
      expect(dateToDay('2020-07-31'), '2020-07-31').to.be.equal(18474)
      expect(dateToDay('2020-08-01'), '2020-08-01').to.be.equal(18475)
      expect(dateToDay('2020-08-31'), '2020-08-31').to.be.equal(18505)
      expect(dateToDay('2020-09-01'), '2020-09-01').to.be.equal(18506)
      expect(dateToDay('2020-09-30'), '2020-09-30').to.be.equal(18535)
      expect(dateToDay('2020-10-01'), '2020-10-01').to.be.equal(18536)
      expect(dateToDay('2020-10-31'), '2020-10-31').to.be.equal(18566)
      expect(dateToDay('2020-11-01'), '2020-11-01').to.be.equal(18567)
      expect(dateToDay('2020-11-30'), '2020-11-30').to.be.equal(18596)
      expect(dateToDay('2020-12-01'), '2020-12-01').to.be.equal(18597)
      expect(dateToDay('2020-12-31'), '2020-12-31').to.be.equal(18627)

      expect(dateToDay('2019-02-28'), '2019-02-28').to.be.equal(17955)

      expect(dateToDay('9999-12-31'), '9999-12-31').to.be.equal(2932896)
    })
    it('should return correct values for each day in a month', function () {
      for (let i = 1; i <= 31; i++) {
        const date: string = '2020-12-' + (i < 10 ? '0' + i : i)
        expect(dateToDay(date), date).to.be.equal(18597 + i - 1)
      }
    })
    it('should also work for negative values', function () {
      expect(dateToDay('1960-01-01')).to.be.equal(-3653)
    })
  })

  describe('dayToDate', function () {
    it('should fail with incorrect inputs', function () {
      expect(() => dayToDate(+'this_is_not_a_date'), 'string').to.throw()
      expect(() => dayToDate(1.2), 'month').to.throw()
    })
    it('should return 1970-01-01', function () {
      expect(dayToDate(0)).to.be.equal('1970-01-01')
    })
    it('should return correct values for month first and last day', function () {
      expect(dayToDate(18262), '2020-01-01').to.be.equal('2020-01-01')
      expect(dayToDate(18292), '2020-01-31').to.be.equal('2020-01-31')
      expect(dayToDate(18293), '2020-02-01').to.be.equal('2020-02-01')
      expect(dayToDate(18321), '2020-02-29').to.be.equal('2020-02-29')
      expect(dayToDate(18322), '2020-03-01').to.be.equal('2020-03-01')
      expect(dayToDate(18352), '2020-03-31').to.be.equal('2020-03-31')
      expect(dayToDate(18353), '2020-04-01').to.be.equal('2020-04-01')
      expect(dayToDate(18382), '2020-04-30').to.be.equal('2020-04-30')
      expect(dayToDate(18383), '2020-05-01').to.be.equal('2020-05-01')
      expect(dayToDate(18413), '2020-05-31').to.be.equal('2020-05-31')
      expect(dayToDate(18414), '2020-06-01').to.be.equal('2020-06-01')
      expect(dayToDate(18443), '2020-06-30').to.be.equal('2020-06-30')
      expect(dayToDate(18444), '2020-07-01').to.be.equal('2020-07-01')
      expect(dayToDate(18474), '2020-07-31').to.be.equal('2020-07-31')
      expect(dayToDate(18475), '2020-08-01').to.be.equal('2020-08-01')
      expect(dayToDate(18505), '2020-08-31').to.be.equal('2020-08-31')
      expect(dayToDate(18506), '2020-09-01').to.be.equal('2020-09-01')
      expect(dayToDate(18535), '2020-09-30').to.be.equal('2020-09-30')
      expect(dayToDate(18536), '2020-10-01').to.be.equal('2020-10-01')
      expect(dayToDate(18566), '2020-10-31').to.be.equal('2020-10-31')
      expect(dayToDate(18567), '2020-11-01').to.be.equal('2020-11-01')
      expect(dayToDate(18596), '2020-11-30').to.be.equal('2020-11-30')
      expect(dayToDate(18597), '2020-12-01').to.be.equal('2020-12-01')
      expect(dayToDate(18627), '2020-12-31').to.be.equal('2020-12-31')

      expect(dayToDate(17955), '2019-02-28').to.be.equal('2019-02-28')

      expect(dayToDate(2932896), '9999-12-31').to.be.equal('9999-12-31')
    })
    it('should return correct values for each day in a month', function () {
      for (let i = 1; i <= 31; i++) {
        const date: string = '2020-12-' + (i < 10 ? '0' + i : i)
        expect(dayToDate(18597 + i - 1), date).to.be.equal(date)
      }
    })
    it('should also work for negative values', function () {
      expect(dayToDate(-3653)).to.be.equal('1960-01-01')
    })
  })

  describe('dateToDay(dayToDate)', function () {
    it('should return the entry value.', function () {
      for (let i = 18262; i <= 18262 + 2 * 365; i++) {
        expect(dateToDay(dayToDate(i)), '' + i).to.be.equal(i)
      }
    })
  })

  describe('dayToDate(dateToDay)', function () {
    it('should return the entry value.', function () {
      let date = new Date(2020, 0, 1)
      for (let i = 0; i <= 2 * 365; i++) {
        const s = date.toISOString().substr(0, 10)
        expect(dayToDate(dateToDay(s)), date.toISOString()).to.be.equal(s)
        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDay() + 1)
      }
    })
  })
})
