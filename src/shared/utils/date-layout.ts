import { dateToDay } from 'bop/shared/utils/date'

interface DateLayoutOptions {
  cellWidth: number
  start: string
  nbWeeks: number
}

interface DateLayoutAttributes {
  left: number
  width: number
}

class DateLayout {
  readonly startDay: number
  readonly endDay: number
  readonly cellWidth: number

  constructor (options: DateLayoutOptions) {
    this.startDay = dateToDay(options.start)
    this.endDay = this.startDay + (options.nbWeeks * 7)
    this.cellWidth = options.cellWidth
  }

  /**
   * Compute CSS width and left for a segment
   * @param start start date included
   * @param end end date excluded. Undefined <=> segment that goes to infinity
   */
  computeAttributes (start: string, end?: string): DateLayoutAttributes {
    const startDay: number = dateToDay(start)
    const endDay: number = end ? dateToDay(end) : this.endDay
    if (endDay <= startDay) {
      throw new Error(`The date ${end ?? this.endDay} is less or equal the date ${start}.`)
    }
    const left = (startDay - this.startDay) * this.cellWidth
    const width = (endDay - startDay) * this.cellWidth
    return {
      left,
      width
    }
  }

  /**
   * Return true if the segment intersects the display range.
   * @param start start date included. Undefined <=> unplanned task => always false
   * @param end end date excluded. Undefined <=> segment that goes to infinity
   */
  isInRange (start?: string, end?: string): boolean {
    if (!start) {
      // Not planned, so...
      return false
    }
    if (dateToDay(start) > this.endDay) {
      // Outside on the right.
      return false
    }
    if (end && dateToDay(end) <= this.startDay) {
      return false
    }
    return true
  }
}

export {
  DateLayout,
  DateLayoutOptions,
  DateLayoutAttributes
}
