import { planningTestSet } from '../../../shared/test'
import { nunjucksContext, Template } from '../utils/nunjucks'
import { parseWidgets } from '../widgets/utils'

import '../../scss/widgets/planning.scss'

declare global {
  interface JQuery {
    bopPlanning(): JQuery,
    bopPlanning(options: BopPlanningOptions): JQuery
  }
}

interface BopPlanningOptions {
  nbWeeks?: number
}
const defaultBopPlanningOptions: BopPlanningOptions = {
  nbWeeks: 2
}

let tpl: Template

$.widget('bop.bopPlanning', $.bop.bop, {
  options: defaultBopPlanningOptions,

  _create: function () {
    this._super()
    const content = $(this.element)
    const options = this.options
    if (!tpl) {
      tpl = require('../../../shared/templates/planning/widget.njk')
    }
    const widget = $(tpl.render(nunjucksContext({
      nodes: planningTestSet(),
      planningProperties: { nbWeeks: options.nbWeeks }
    })))
    parseWidgets(content.empty().append(widget))
  }
})

export {}
