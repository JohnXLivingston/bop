import { PlanningTree } from '../classes/tree'
import { NodeKeyClass } from '../classes/node'
import { PlanningNodeObject } from '../classes/node-object'
import { PlanningNodeObjectTask } from '../classes/node-object-task'
import { MessageObject } from 'bop/shared/objects/message/message.object'
import { TaskObject } from 'bop/shared/objects/task/task.object'

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

class NodeResourceTask extends PlanningNodeObjectTask {
  childKeyClassForMessage (_message: MessageObject): NodeKeyClass | null {
    return null
  }
}

export {
  PlanningTreeResourceTask
}
