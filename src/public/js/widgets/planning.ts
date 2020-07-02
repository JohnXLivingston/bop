import { planningTestSet } from '../../../shared/test'
import { nunjucksContext, Template } from '../utils/nunjucks'

import '../../scss/widgets/planning.scss'

function initWidgetsPlanning () {
  const widgets = $('[data-widget=planning]:not([data-widget-initialized])')
  let tpl: Template
  widgets.each((i, html) => {
    const target = $(html)
    if (!tpl) {
      tpl = require('../../../shared/templates/planning/widget.njk')
    }
    const widget = $(tpl.render(nunjucksContext({
      nodes: planningTestSet(),
      planningProperties: { nbWeeks: 9 }
    })))
    widget.attr('data-widget', 'planning')
    widget.attr('data-widget-initialized', '')
    target.replaceWith(widget)
  })
}

export {
  initWidgetsPlanning
}
