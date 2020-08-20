import { PlanningTree } from './tree'
import { Messages } from '../../../../../../shared/models/message'
import { BopObject } from '../../../../../../shared/models/bop-object.model'

export abstract class PlanningNode {
  tree!: PlanningTree

  constructor (parent?: PlanningNode) {
    if (parent) { this.tree = parent.tree }
  }

  object (key: string): BopObject | null {
    return this.tree.objects[key] || null
  }

  dispatch (messages: Messages) {
    // TODO: create missing childs
    // TODO: remove/disable deprecated childs
    // TODO: update nodes.
    throw new Error('Not implemented yet')
  }
}
