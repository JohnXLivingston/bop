import getLogger from '../utils/logger'

const logger = getLogger('jquery/utils')

interface BopDataMethod<T> {
  (this: JQuery, name: string): T
  (this: JQuery, name: string, value: T): JQuery
}

declare global {
  interface JQuery {
    bopDataString: BopDataMethod<string>
    bopDataBoolean : BopDataMethod<boolean>
    bopDataObject: BopDataMethod<object>
    bopDataArray: BopDataMethod<Array<any>>
    bopDataAny: BopDataMethod<any>

    /**
     * Like jQuery.find, but can also find the element itself.
     * @param el The selector, or the JQuery element where to search.
     * @param selector the selector to search.
     */
    bopFindSelf: (selector: JQuery.Selector) => JQuery,

    isBopWidget: (this: JQuery, name: string) => boolean
  }
  
  interface JQueryStatic {
    /**
     * This is the bop namespace.
     * Widgets will be there.
     */
    bop: { [key: string]: Function }
  }
}

const bopDataString: BopDataMethod<string> = function (this: JQuery, name: string, value?: string): any {
  const el = $(this)
  if (arguments.length <= 1) {
    return el.attr(name) || ''
  }
  return el.attr(name, '' + value)
}

const bopDataBoolean: BopDataMethod<boolean> = function (this: JQuery, name: string, value?: boolean): any {
  const el = $(this)
  if (arguments.length <= 1) {
    const s = el.attr(name)
    return s && s !== '0' && s !== 'false'
  }
  return el.attr(name, value ? 1 : null)
}

const bopDataObject: BopDataMethod<object> = function (this: JQuery, name: string, value?: object): any {
  if (arguments.length <= 1) {
    const r = (bopDataAny as (this: JQuery, name: string) => any).call(this, name)
    if (r === null) {
      // This case is not an error.
      return {}
    }
    if (typeof r !== 'object') {
      logger.error('bopDataObject: Attribute ' + name + ' is not an object, but a ' + (typeof r), $(this))
      return {}
    }
    if (Array.isArray(r)) {
      logger.error('bopDataObject: Attribute ' + name + ' is an array. Not valid.', $(this))
      return {}
    }
    return r
  }

  if (typeof value !== 'object') {
    logger.error('bopDataObject: the value is not an object. This is not valid.', value)
    value = {}
  }
  if (Array.isArray(value)) {
    logger.error('bopDataObject: the value is an array. This is not valid.', value)
    value = {}
  }
  return bopDataAny.call(this, name, value)
}

const bopDataArray: BopDataMethod<Array<any>> = function (this: JQuery, name: string, value?: Array<any>): any {
  if (arguments.length <= 1) {
    const r = (bopDataAny as (this: JQuery, name: string) => any).call(this, name)
    if (r === null || r === undefined) {
      // This case is not an error.
      return []
    }
    if (typeof r !== 'object') {
      logger.error('bopDataArray: Attribute ' + name + ' is not an object, but a ' + (typeof r), $(this))
      return []
    }
    if (!Array.isArray(r)) {
      logger.error('bopDataObject: Attribute ' + name + ' is not an array. Not valid.', $(this))
      return []
    }
    return r
  }

  if (typeof value !== 'object') {
    logger.error('bopDataArray: the value is not an object. This is not valid.', value)
    value = []
  }
  if (!Array.isArray(value)) {
    logger.error('bopDataArray: the value is not an array. This is not valid.', value)
    value = []
  }
  return bopDataAny.call(this, name, value)
}

const bopDataAny: BopDataMethod<any> = function (this: JQuery, name: string, value?: any): any {
  const el = $(this)
  if (arguments.length <= 1) {
    const s = el.attr(name)
    if (s === undefined) {
      return undefined
    }
    let o
    try {
      o = JSON.parse(s)
    } catch (e) {
      logger.error('bopDataAny: Can\'t parse JSON in attribute ' + name, el)
      return {}
    }
    return o
  }

  return el.attr(name, JSON.stringify(value))
}

const isBopWidget = function (this: JQuery, name: string): boolean {
  return this.is(makeAttributeSelector('data-widget', name))
}

function makeAttributeSelector (attr: string, value?: string, test?: string): string {
  if (value === undefined && test === undefined) {
    return '[' + attr + ']'
  }
  if (test === undefined) {
    test = '='
  }
  if (value === undefined) {
    value = ''
  }
  let armored = value.replace( /\\/g,'\\\\');
	armored = armored.replace( /"/g,'\\"');
	return '[' + attr + test + '"' + armored + '"]';
}

jQuery.fn.extend({
  bopDataString,
  bopDataBoolean,
  bopDataObject,
  bopDataArray,
  bopDataAny,

  bopFindSelf: function bopFindSelf (this: JQuery, selector: string): JQuery {
    const el = $(this)
    return el.filter(selector).add(el.find(selector))
  },

  isBopWidget
})

export {
  makeAttributeSelector
}
