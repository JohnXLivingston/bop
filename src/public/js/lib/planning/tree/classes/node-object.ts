import { PlanningNode } from './node'
import { NodeRenderVars } from 'bop/shared/templates/planning/types'

export abstract class PlanningNodeObject extends PlanningNode {
  constructor (key: string, parent?: PlanningNode) {
    super(key, parent)
    this.template = require('bop/shared/templates/planning/render.njk')
  }

  renderVars (): NodeRenderVars {
    const commonVars = super.commonRenderVars()
    const object = this.tree.object(this.key)
    if (!object) {
      throw new Error('Can\'t find the object ' + this.key)
    }
    const vars: NodeRenderVars = {
      ...commonVars,
      node: {
        type: 'object',
        object: object
      }
    }
    return vars
  }
}
