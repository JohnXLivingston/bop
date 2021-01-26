import { PlanningTreeOptions } from './tree/classes/tree'
import { PlanningTreeResourceTask } from './tree/definitions/resource-task'

export { PlanningTree } from './tree/classes/tree'

function getPlanningTree (display: string, options: PlanningTreeOptions) {
  if (display === 'resource-task') {
    return new PlanningTreeResourceTask(options)
  }
  throw new Error('Unknown display ' + display)
}

export {
  getPlanningTree
}
