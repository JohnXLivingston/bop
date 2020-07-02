declare global {
  interface JQuery {
    /**
     * Like jQuery.find, but can also find the element itself.
     * @param el The selector, or the JQuery element where to search.
     * @param selector the selector to search.
     */
    bopFindSelf: (selector: JQuery.Selector) => JQuery
  }
  
  interface JQueryStatic {
    /**
     * This is the bop namespace.
     * Widgets will be there.
     */
    bop: { [key: string]: Function }
  }
}

/**
 * Like jQuery.find, but can also find the element itself.
 * @param el The selector, or the JQuery element where to search.
 * @param selector the selector to search.
 */
jQuery.fn.extend({
  bopFindSelf: function bopFindSelf (selector: string): JQuery {
    const el = $(this as JQuery)
    return el.filter(selector).add(el.find(selector))
  }
})

export {}
