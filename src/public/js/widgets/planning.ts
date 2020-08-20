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
  display: 'resource-task',
  nbWeeks: 2
}

let tpl: Template

interface BopPlanningAttributes {
  options: BopPlanningOptions,
  tree?: PlanningTree
}

declare global {
  namespace JQueryUI {
    interface Widget {
      <T>(
        name: 'bop.bopPlanning',
        base: Function,
        prototype: T & ThisType<T & WidgetCommonProperties & BopPlanningAttributes>
      ): JQuery
    }
  }
}

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

    this.tree = getPlanningTree(options.display, {
      dom: content
    })
  },

  getTree: function (): PlanningTree {
    if (!this.tree) {
      throw new Error('Calling getTree too early')
    }
    return this.tree
  }
})

export {}
