import { PlanningTree } from './tree'
import { Messages } from '../../../../../../shared/models/message'

export abstract class PlanningNode {
  tree!: PlanningTree

  constructor (parent?: PlanningNode) {
    if (parent) { this.tree = parent.tree }
  }

  dispatch (messages: Messages) {
    // TODO: create missing childs
    // TODO: remove/disable deprecated childs
    // TODO: update nodes.
    throw new Error('Not implemented yet')
  }
}
