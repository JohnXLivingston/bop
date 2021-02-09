/* eslint-disable @typescript-eslint/no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests } from '../../test-utils'
import { DateLayout } from 'bop/shared/utils/date-layout'
import { dateToDay, dayToDate } from 'bop/shared/utils/date'

const expect = chai.expect

const nbWeeks = 6
const cellWidth = 45
const start: string = '2021-02-01' // monday
const end: string = dayToDate(dateToDay(start) + (7 * nbWeeks)) // 2021-03-22
const startP1: string = dayToDate(dateToDay(start) + 1) // 2021-02-02
const startP4: string = dayToDate(dateToDay(start) + 4) // 2021-02-05
const startP20: string = dayToDate(dateToDay(start) + 20) // 2021-02-21
const startM2: string = dayToDate(dateToDay(start) - 2) // 2021-01-30
const startM4: string = dayToDate(dateToDay(start) - 4) // 2021-01-28
const endP1: string = dayToDate(dateToDay(end) + 1)
const endP2: string = dayToDate(dateToDay(end) + 2)
const endM1: string = dayToDate(dateToDay(end) - 1)
let dateLayout: DateLayout

describe('shared/objects/utils/date-layout.ts', function () {
  before(flushTests)
  after(flushTests)

  describe('constructor', function () {
    it('should instanciate the correct dateLayout', function () {
      dateLayout = new DateLayout({
        cellWidth,
        nbWeeks,
        start
      })
      expect(dateLayout, 'instanceOf').to.be.instanceOf(DateLayout)
      expect(dateLayout.startDay, 'startDay').to.be.equal(18659)
      expect(dateLayout.endDay, 'endDay').to.be.equal(18659 + (nbWeeks * 7))
      expect(dateLayout.cellWidth, 'cellWidth').to.be.equal(cellWidth)
    })
  })

  describe('computeAttributes', function () {
    it('should compute correctly with both start and end date', function () {
      expect(dateLayout.computeAttributes(start, end), start + ' -> ' + end).to.be.deep.equal({
        left: 0,
        width: nbWeeks * 7 * cellWidth
      })
      expect(dateLayout.computeAttributes(startP1, end), `${startP1} -> ${end}`).to.be.deep.equal({
        left: cellWidth,
        width: nbWeeks * 7 * cellWidth - cellWidth
      })
      expect(dateLayout.computeAttributes(start, startP1), `${start} -> ${startP1}`).to.be.deep.equal({
        left: 0,
        width: cellWidth
      })
      expect(dateLayout.computeAttributes(start, startP4), `${start} -> ${startP4}`).to.be.deep.equal({
        left: 0,
        width: cellWidth * 4
      })
      expect(dateLayout.computeAttributes(startP1, startP4), `${startP1} -> ${startP4}`).to.be.deep.equal({
        left: cellWidth,
        width: cellWidth * 3
      })
      expect(dateLayout.computeAttributes(startM2, startP1), `${start} -> ${end}`).to.be.deep.equal({
        left: -2 * cellWidth,
        width: 3 * cellWidth
      })
      expect(dateLayout.computeAttributes(start, startP20), `${start} -> ${startP20}`).to.be.deep.equal({
        left: 0,
        width: cellWidth * 20
      })
    })
    it('should compute correctly with only a start date', function () {
      expect(dateLayout.computeAttributes(start), start).to.be.deep.equal({
        left: 0,
        width: nbWeeks * 7 * cellWidth
      })
      expect(dateLayout.computeAttributes(startP1), startP1).to.be.deep.equal({
        left: cellWidth,
        width: nbWeeks * 7 * cellWidth - cellWidth
      })
      expect(dateLayout.computeAttributes(startM2), startM2).to.be.deep.equal({
        left: -2 * cellWidth,
        width: nbWeeks * 7 * cellWidth + 2 * cellWidth
      })
    })
    it('should fail when start and end date are equal', function () {
      expect(
        () => dateLayout.computeAttributes(startP4, startP4),
        `${startP4} -> ${startP4}`
      ).to.throw()
    })
    it('should fail when start and end date are inverted', function () {
      expect(
        () => dateLayout.computeAttributes(startP4, startP1),
        `${startP4} -> ${startP1}`
      ).to.throw()
    })
  })

  describe('isInRange', function () {
    it('should be true for both date inside range', function () {
      expect(dateLayout.isInRange(startP1, startP4), `${startP1} -> ${startP4}`).to.be.true
      expect(dateLayout.isInRange(start, end), `${start} -> ${end}`).to.be.true
    })
    it('should be true for the start date', function () {
      expect(dateLayout.isInRange(start, startP4), `${startP1} -> ${start}`).to.be.true
    })
    it('should be true for the end date', function () {
      expect(dateLayout.isInRange(startP1, end), `${startP1} -> ${end}`).to.be.true
    })
    it('should be false for both dates before', function () {
      expect(dateLayout.isInRange(startM4, startM2), `${startM4} -> ${startM2}`).to.be.false
    })
    it('should be false for both dates after', function () {
      expect(dateLayout.isInRange(endP1, endP2), `${endP1} -> ${endP2}`).to.be.false
    })
    it('should be true for start date before and end date inside', function () {
      expect(dateLayout.isInRange(startM2, startP4), `${startM2} -> ${startP4}`).to.be.true
    })
    it('should be true for start date inside and end date after', function () {
      expect(dateLayout.isInRange(startP1, endP2), `${startP1} -> ${endP2}`).to.be.true
    })
    it('should be true for start date before and end date after', function () {
      expect(dateLayout.isInRange(startM2, endP2), `${startM2} -> ${endP2}`).to.be.true
    })
    it('should work when no end date', function () {
      expect(dateLayout.isInRange(startM2), startM2).to.be.true // no end => goes to infinity
      expect(dateLayout.isInRange(start), start).to.be.true
      expect(dateLayout.isInRange(startP1), startP1).to.be.true
      expect(dateLayout.isInRange(endM1), endM1).to.be.true
      expect(dateLayout.isInRange(end), end).to.be.true
      expect(dateLayout.isInRange(endP1), endP1).to.be.false
    })
    it('should always be false when no start date (unplanned)', function () {
      expect(dateLayout.isInRange(undefined), 'undefined').to.be.false
      expect(dateLayout.isInRange(undefined, start), `undefined -> ${start}`).to.be.false
    })
  })
})
