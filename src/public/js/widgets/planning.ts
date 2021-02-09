import { nunjucksContext, Template } from 'bop/public/js/utils/nunjucks'
import { parseWidgets } from 'bop/public/js/utils/widgets'

import { PlanningTree, getPlanningTree } from 'bop/public/js/lib/planning'

import 'bop/public/scss/widgets/planning.scss'

import getLogger from 'bop/public/js/utils/logger'

const logger = getLogger('widget/planning')

declare global {
  interface JQuery {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    bopPlanning(): JQuery
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    bopPlanning(options: BopPlanningOptions): JQuery

    // eslint-disable-next-line @typescript-eslint/method-signature-style
    bopPlanning(methodName: 'getTree'): PlanningTree
  }
}

interface BopPlanningOptions {
  display: string
  nbWeeks?: number
}
const defaultBopPlanningOptions: BopPlanningOptions = {
  display: 'resource-task',
  nbWeeks: 2
}

let tpl: Template

interface BopPlanningAttributes {
  options: BopPlanningOptions
  tree?: PlanningTree
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JQueryUI {
    interface Widget {
      // eslint-disable-next-line @typescript-eslint/prefer-function-type
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
      tpl = require('bop/shared/templates/planning/widget.njk')
    }
    logger.error('TODO: compute cell width from CSS...')
    const planningProperties: PlanningProperties = {
      cellWidth: this.__getCellWidth(),
      nbWeeks: options.nbWeeks ?? 1
    }
    const widget = $(tpl.render(nunjucksContext({
      planningProperties
    })))
    parseWidgets(content.empty().append(widget))

    this.tree = getPlanningTree(options.display, {
      widget: content,
      planningProperties
    })

    this.requestData()
  },

  __getCellWidth: function (): number {
    const el = $(this.element).find('.widget-planning-week-days>*:first')
    if (el.length > 0) {
      const width = el.width()
      if (width) {
        return width
      }
    }
    logger.error('Can\'t compute cellWidth.')
    return 45
  },

  getTree: function (): PlanningTree {
    if (!this.tree) {
      throw new Error('Calling getTree too early')
    }
    return this.tree
  },

  createTestData: function (): void {
    $.ajax('/api/v1/planning/test-data', {
      method: 'POST'
    }).then(
      () => logger.info('Test data correctly created.'),
      () => logger.error('Failed creating test data.')
    )
  },

  requestData: function (): void {
    // TODO: error handling.
    // TODO: waiting indicator, and clean this code.
    $.ajax('/api/v1/planning/all').then(
      (data) => {
        this.getTree().process(data)
      },
      () => {
        logger.error('Failed retrieving data.')
      }
    )
  }
})

export {}
