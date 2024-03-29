/// <reference path="./sidebar.d.ts" />

require('@ctrlmaniac/simpler-sidebar/lib/jquery.simpler-sidebar.js')

require('bop/public/scss/widgets/sidebar.scss')

declare global {
  interface JQuery {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    bopSidebar (): JQuery
  }
}

$.widget('bop.bopSidebar', $.bop.bop, {
  _create: function () {
    this._super()
    const content = $(this.element)
    content.removeClass('hidden')
    content.simplerSidebar({
      align: 'right',
      toggler: content.attr('data-widget-sidebar-open'),
      quitter: content.attr('data-widget-sidebar-close'),
      animation: {
        easing: 'easeOutQuint'
      }
    })
  }
})

export {}
