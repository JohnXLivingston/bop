import type { BopObject, BopObjectType } from 'bop/shared/objects/'

type EnsurableId = BopObject | null | string | number

function ensureId (type: BopObjectType, p: EnsurableId): number | null {
  if (p === null) {
    return null
  }
  if (typeof p === 'number') {
    return p
  }
  if (typeof p === 'object') {
    if (p.type !== type) {
      throw new Error(`The parameter object type is ${p.type}, not ${type}.`)
    }
    return p.id
  }
  if (typeof p === 'string') {
    const m = p.match('^' + type + '\\/(\\d+)$')
    if (m) {
      return +m[1]
    } else {
      throw new Error(`Can't convert the string '${p}' to a resource ID`)
    }
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Don't know how get an id from ${p}.`)
}

export {
  ensureId,
  EnsurableId
}
