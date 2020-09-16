import { PlanningNode } from './node'
import { NodeRenderVars } from '../../../../../../shared/templates/planning/types'

export abstract class PlanningNodeObject extends PlanningNode {
  constructor (key: string, parent?: PlanningNode) {
    super(key, parent)
    this.template = require('../../../../../../shared/templates/planning/render-object.njk')
  }

  renderVars (): NodeRenderVars {
    const vars = super.renderVars()
    const object = this.tree.object(this.key)
    if (!object) {
      throw new Error('Can\'t find the object ' + this.key)
    }
    if (!vars.node) {
      vars.node = {
        type: 'object'
      }
    } else {
      vars.node.type = 'object'
    }
    vars.node.object = object
    return vars
  }
}
