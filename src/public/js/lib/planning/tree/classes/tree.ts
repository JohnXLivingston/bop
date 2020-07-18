import { PlanningNode } from './node'
import { BopObject } from '../../../../../../shared/models/bop-object.model'
import { Messages } from '../../../../../../shared/models/message'

interface PlanningTreeOptions {
  dom: JQuery
}

abstract class PlanningTree extends PlanningNode {
  private readonly dom: JQuery
  objects: {[key: string]: BopObject} = {}

  constructor (options: PlanningTreeOptions) {
    super(undefined)
    this.tree = this
    this.dom = options.dom
  }

  dispatch (messages: Messages) {
    messages = this.tree.removeDeprecatedMessages(messages)
    super.dispatch(messages)
  }

  removeDeprecatedMessages (messages: Messages): Messages {
    return messages.filter((message) => {
      const object = message.object
      if (!object) { return true }
      if (!('version' in object)) { return true }
      if (!this.objects[object.key]) { return true }
      if (this.objects[object.key].version < object.version) { return true }
      return false
    })
  }
}

export {
  PlanningTree
}
