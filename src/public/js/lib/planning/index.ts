import { PlanningTreeUserTask } from './tree/definitions/user-task'

export { PlanningTree } from './tree/classes/tree'

function getPlanningTree (display: string, options: any) {
  if (display === 'user-task') {
    return new PlanningTreeUserTask(options)
  }
  throw new Error('Unknown display ' + display)
}

export {
  getPlanningTree
}
