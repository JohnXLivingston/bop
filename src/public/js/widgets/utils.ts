import getLogger from '../utils/logger'

const logger = getLogger('widgets/common')

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

function parseWidgets (dom?: JQuery): void {
  if (!dom) { dom = $('body') }
  logger.debug('Parsing widgets...')
  const widgets = dom.bopFindSelf('[data-widget]:not([data-widget-parsed])')
  widgets.each((i, html) => {
    const widget: JQuery = $(html)
    if (widget.bopDataBoolean('data-widget-parsed')) {
      logger.debug('This widget was already parsed, skipping...')
      return
    }
    const name: any = widget.attr('data-widget') || ''
    if (!name) {
      logger.error('There is a data-widget with no value.')
      return
    }
    if (!(name in $.bop)) {
      logger.error(`Can't find widget ${name}.`)
      return
    }
    if (!(name in widget) || typeof widget[name] !== 'function') {
      logger.error(`The widget ${name} is in the namespace, but the method is not on the dom element.`)
      return
    }

    widget.bopDataBoolean('data-widget-parsed', true)
    logger.debug('Initializing the widget...')
    const options: any = widget.is('[data-widget-options]')
      ? widget.bopDataObject('data-widget-options')
      : undefined
    const method: Function = (widget as any)[name] as Function
    method.call(widget, options)
  })
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

export {
  parseWidgets
}
