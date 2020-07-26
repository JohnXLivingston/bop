import { planningTestSet } from '../../../shared/test'
import { nunjucksContext, Template } from '../utils/nunjucks'
import { parseWidgets } from '../widgets/utils'

import { PlanningTree, getPlanningTree } from '../lib/planning'

import '../../scss/widgets/planning.scss'

declare global {
  interface JQuery {
    bopPlanning(): JQuery,
    bopPlanning(options: BopPlanningOptions): JQuery,

    bopPlanning(methodName: 'getTree'): PlanningTree
  }
}

interface BopPlanningOptions {
  display: string,
  nbWeeks?: number
}
const defaultBopPlanningOptions: BopPlanningOptions = {
  display: 'user-task',
  nbWeeks: 2
}

let tpl: Template

interface BopPlanning extends JQueryUI.WidgetCommonProperties {
  options: BopPlanningOptions,
  tree: PlanningTree,

  getTree: () => PlanningTree
}

$.widget('bop.bopPlanning', $.bop.bop, {
  options: defaultBopPlanningOptions,

  _create: function (this: BopPlanning) {
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

    this.tree = getPlanningTree(options.display, {
      dom: content
    })
  },

  getTree: function (this: BopPlanning): PlanningTree {
    return this.tree
  }
})

export {}
