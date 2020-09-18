const ymdRegexp = /^(\d{4})-(\d{2})-(\d{2})$/
const dateToDayMonthTable = [-1, 30, 58, 89, 119, 150, 180, 211, 242, 272, 303, 333]

function _modulo (a: number, b: number): number {
  const r = a % b
  if (r < 0) {
    return r + b
  }
  return r
}

function _pad4 (v: number): string {
  if (v < 1000) {
    return '0' + v
  }
  if (v < 100) {
    return '00' + v
  }
  if (v < 10) {
    return '000' + v
  }
  return '' + v
}

function _pad2 (v: number): string {
  if (v < 10) {
    return '0' + v
  }
  return '' + v
}

/**
 * Convert a date string in the number of days since 1970.
 * @param date The date string in ISO format (YYYY-MM-DD)
 */
function dateToDay (date: string): number {
  const m = date.match(ymdRegexp)
  if (!m) {
    throw new Error(`Incorrect date format for the string '${date}'.`)
  }
  const year: number = +m[1]
  const month: number = +m[2]
  const day: number = +m[3]

  if (month > 12) {
    throw new Error(`Incorrect month number in date string '${date}'.`)
  }
  if (day > 31) {
    // NB: we don't check that day is < to the month's length, it's not worth it.
    throw new Error(`Incorrect day number in date string '${date}'.`)
  }

  let result: number = day + dateToDayMonthTable[month - 1]
  result += 365 * (year - 1970)
  const x = (month <= 2 ? year - 1 : year)
  result += Math.floor((x - 1968) / 4)
  result -= Math.floor((x - 1900) / 100)
  result += Math.floor((x - 1600) / 400)
  return result
}

/**
 * Convert a number of days since 1970 to an ISO date string.
 * @param day number of days since 1970-01-01
 */
function dayToDate (day: number): string {
  if (day !== Math.floor(day)) {
    throw new Error(`Please provide an integer, '${day}' is not one.`)
  }
  // Shift frame of reference from 1 Jan 1970 to (the imaginary) 1 Mar 0AD.
  let tmp: number = day + 719468

  // Do the math.
  let year = 400 * Math.floor(tmp / 146097)
  let month: number
  let dday: number
  tmp = _modulo(tmp, 146097)
  if (tmp === 146096) {
    // Handle 29 Feb 2000, 2400, ...
    year += 400
    month = 2
    dday = 29
  } else {
    year += 100 * Math.floor(tmp / 36524)
    tmp = _modulo(tmp, 36524)
    year += 4 * Math.floor(tmp / 1461)
    tmp = _modulo(tmp, 1461)
    if (tmp === 1460) {
      year += 4
      month = 2
      dday = 29
    } else {
      year += Math.floor(tmp / 365)
      tmp = _modulo(tmp, 365)
      month = Math.floor(tmp / 31)
      tmp = _modulo(tmp, 31)
      dday = tmp + [1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5][month]
      tmp = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28][month]
      if (dday > tmp) {
        dday -= tmp
        month += 1
      }
      if (month > 9) {
        month -= 9
        year += 1
      } else {
        month += 3
      }
    }
  }

  return _pad4(year) + '-' + _pad2(month) + '-' + _pad2(dday)
}

export {
  dateToDay,
  dayToDate
}
