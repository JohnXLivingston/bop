/// <reference path="./sidebar.d.ts" />

require('@dcdeiv/simpler-sidebar/dist/jquery.simpler-sidebar.js')

function initWidgetsSidebar () {
  $('body').find('[data-widget-sidebar]:not([data-widget-sidebar-initialized])').each((i, html) => {
    const widget = $(html)
    widget.attr('data-widget-sidebar-initialized', '')
    widget.removeClass('hidden')
    widget.simplerSidebar({
      selectors: {
        trigger: widget.attr('data-widget-sidebar-open'),
        quitter: widget.attr('data-widget-sidebar-close')
      },
      animation: {
        easing: 'easeOutQuint'
      }
    })
  })
}

export {
  initWidgetsSidebar
}
