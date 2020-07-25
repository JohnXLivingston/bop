/// <reference path="./sidebar.d.ts" />

require('@dcdeiv/simpler-sidebar/dist/jquery.simpler-sidebar.js')

require('../../scss/widgets/sidebar.scss')

declare global {
  interface JQuery {
    bopSidebar (): JQuery
  }
}

$.widget('bop.bopSidebar', $.bop.bop, {
  _create: function () {
    this._super()
    const content = $(this.element)
    content.removeClass('hidden')
    content.simplerSidebar({
      selectors: {
        trigger: content.attr('data-widget-sidebar-open'),
        quitter: content.attr('data-widget-sidebar-close')
      },
      animation: {
        easing: 'easeOutQuint'
      }
    })
  }
})

export {}
