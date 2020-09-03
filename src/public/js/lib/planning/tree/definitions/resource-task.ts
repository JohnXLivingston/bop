import { PlanningTree } from '../classes/tree'
import { NodeKeyClass, PlanningNode } from '../classes/node'
import { Message } from '../../../../../../shared/models/message'

class PlanningTreeResourceTask extends PlanningTree {
  childKeyClassForMessage (message: Message): NodeKeyClass | null {
    if (message.object?.type !== 'resource') { return null }
    return {
      key: message.object.key,
      Class: NodeResource
    }
  }
}

class NodeResource extends PlanningNode {
  childKeyClassForMessage (message: Message): NodeKeyClass | null {
    if (message.object?.type !== 'task') { return null }
    const task = message.object
    // TODO: check if this resource is assigned to the task.
    return {
      key: task.key,
      Class: NodeResourceTask
    }
  }
}

class NodeResourceTask extends PlanningNode {
  childKeyClassForMessage (message: Message): NodeKeyClass | null {
    return null
  }
}

export {
  PlanningTreeResourceTask
}
