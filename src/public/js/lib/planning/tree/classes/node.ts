import { PlanningTree } from './tree'
import { Message, Messages } from '../../../../../../shared/models/message'
import { BopObject } from '../../../../../../shared/models/bop-object.model'
import getLogger from '../../../../utils/logger'

const logger = getLogger('lib/planning/tree/classes/node')

abstract class PlanningNode {
  tree!: PlanningTree
  path: string
  key: string
  parent?: PlanningNode
  childsByKey: { [key: string]: PlanningNode }
  childsSorted: PlanningNode[]

  constructor (key: string, parent?: PlanningNode) {
    this.key = key
    this.parent = parent
    this.path = parent ? parent.path + '>' + key : 'path:' + key
    if (parent) { this.tree = parent.tree }
    this.childsByKey = {}
    this.childsSorted = []
  }

  object (key: string): BopObject | null {
    return this.tree.objects[key] || null
  }

  dispatch (messages: Messages) {
    // Creating missing childs...
    this.createMissingChilds(messages)
    // TODO: remove/disable deprecated childs
    // TODO: update nodes.
    logger.error('Not implemented yet')
  }

  createMissingChilds (messages: Messages): void {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (message.messageType === 'delete') { continue }
      const childKeyClass = this.childKeyClassForMessage(message)
      if (!childKeyClass) { continue }
      if (childKeyClass.key in this.childsByKey) { continue }
      const child: PlanningNode = new childKeyClass.Class(childKeyClass.key, this)
      this.registerChild(child)
    }

    for (let i = 0; i < this.childsSorted.length; i++) {
      const child = this.childsSorted[i]
      child.createMissingChilds(messages)
    }
  }

  registerChild (child: PlanningNode): void {
    this.childsByKey[child.key] = child
    // FIXME: insert the child in correct place.
    this.childsSorted.push(child)
  }

  unregisterChild (child: PlanningNode): void {
    delete this.childsByKey[child.key]
    const sortedIdx = this.childsSorted.indexOf(child)
    if (sortedIdx >= 0) {
      this.childsSorted.splice(sortedIdx, 1)
    }
  }

  abstract childKeyClassForMessage (message: Message): NodeKeyClass | null

  destroy (): void {
    // TODO: remove node from DOM.
    if (this.parent) {
      this.parent.unregisterChild(this)
    }
  }
}

type NodeKeyClass = {
  key: string,
  Class: {new(key: string, parent?: PlanningNode): PlanningNode}
}

export {
  PlanningNode,
  // eslint-disable-next-line no-undef
  NodeKeyClass
}
