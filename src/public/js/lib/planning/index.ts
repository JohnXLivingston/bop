import { PlanningTreeOptions } from './tree/classes/tree'
import { PlanningTreeResourceTask } from './tree/definitions/resource-task'
import type { PlanningTree } from './tree/classes/tree'

export { PlanningTree } from './tree/classes/tree'

function getPlanningTree (display: string, options: PlanningTreeOptions): PlanningTree {
  if (display === 'resource-task') {
    return new PlanningTreeResourceTask(options)
  }
  throw new Error('Unknown display ' + display)
}

export {
  getPlanningTree
}
