import { PlanningTree } from '../classes/tree'
import { NodeKeyClass } from '../classes/node'
import { PlanningNodeObject } from '../classes/node-object'
import { MessageObject } from '../../../../../../shared/objects/message/message.object'
import { TaskObject } from '../../../../../../shared/objects/task/task.object'

class PlanningTreeResourceTask extends PlanningTree {
  childKeyClassForMessage (message: MessageObject): NodeKeyClass | null {
    // TODO: have a child for unallocated tasks.
    if (message.object?.type !== 'resource') { return null }
    return {
      key: message.object.key,
      Class: NodeResource
    }
  }
}

class NodeResource extends PlanningNodeObject {
  childKeyClassForMessage (message: MessageObject): NodeKeyClass | null {
    if (message.object?.type !== 'task') { return null }
    const task: TaskObject = message.object as TaskObject
    if (!task.isResourceAllocated(this.key)) { return null }
    return {
      key: task.key,
      Class: NodeResourceTask
    }
  }
}

class NodeResourceTask extends PlanningNodeObject {
  childKeyClassForMessage (_message: MessageObject): NodeKeyClass | null {
    return null
  }
}

export {
  PlanningTreeResourceTask
}
