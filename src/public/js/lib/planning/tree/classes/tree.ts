import { PlanningNode } from './node'

interface PlanningTreeOptions {
  dom: JQuery
}

abstract class PlanningTree extends PlanningNode {
  private readonly dom: JQuery

  constructor (options: PlanningTreeOptions) {
    super()
    this.dom = options.dom
  }
}

export {
  PlanningTree
}
