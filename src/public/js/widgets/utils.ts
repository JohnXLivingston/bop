/* This is a workaround, because @types/jqueryui does not declare these methods. */
type JQueryUIHandler = (ev: JQuery.TriggeredEvent) => void | boolean
type JQUeryUIHandlers = {[key: string]: JQueryUIHandler}
interface JQueryUIOn {
  (handlers: JQUeryUIHandlers): void
  <T>(el: JQuery<T>, handlers: JQUeryUIHandlers): void
}
declare global {
  namespace JQueryUI {
    interface WidgetCommonProperties {
      _on: JQueryUIOn,
      _super: Function
    }
  }
}

require('jquery-ui/ui/widget') // we must ensure this is loaded before.
$.widget('bop.bop', {
  _create: function () {
    const widget = $(this.element)
    if (!widget.is('[data-widget]')) {
      widget.attr('data-widget', this.widgetFullName.replace(/^bop-/, ''))
      widget.bopDataBoolean('data-widget-parsed', true)
    }
  }
})

export {}
