/// <reference path="./sidebar.d.ts" />

require('@dcdeiv/simpler-sidebar/dist/jquery.simpler-sidebar.js')

function initWidgetsSidebar () {
  $('body').find('[widget-sidebar]:not([widget-sidebar-initialized])').each((i, html) => {
    const widget = $(html)
    widget.attr('widget-sidebar-initialized', '')
    widget.removeClass('hidden')
    widget.simplerSidebar({
      selectors: {
        trigger: widget.attr('widget-sidebar-open'),
        quitter: widget.attr('widget-sidebar-close')
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
