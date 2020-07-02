import { planningTestSet } from '../../../shared/test'
import { nunjucksContext, Template } from '../utils/nunjucks'

import '../../scss/widgets/planning.scss'

declare global {
  interface JQuery {
    BopPlanning(): JQuery,
    BopPlanning(options: BopPlanningOptions): JQuery
  }
}

interface BopPlanningOptions {}

let tpl: Template

$.widget('bop.BopPlanning', {
  _create: function () {
    const content = $(this.element)
    if (!tpl) {
      tpl = require('../../../shared/templates/planning/widget.njk')
    }
    const widget = $(tpl.render(nunjucksContext({
      nodes: planningTestSet(),
      planningProperties: { nbWeeks: 9 }
    })))
    content.empty().append(widget)
  }
})

export {}
