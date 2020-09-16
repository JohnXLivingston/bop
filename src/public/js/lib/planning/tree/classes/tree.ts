import { PlanningNode } from './node'
import { Messages } from '../../../../../../shared/models/message'
import { BopObject, MessageObject, MessagesObject } from '../../../../../../shared/objects'
import getLogger from '../../../../utils/logger'

const logger = getLogger('lib/planning/tree/classes/tree')

interface PlanningTreeOptions {
  dom: JQuery
}

abstract class PlanningTree extends PlanningNode {
  private readonly dom: JQuery
  objects: {[key: string]: BopObject} = {}

  constructor (options: PlanningTreeOptions) {
    super('root', undefined)
    this.tree = this
    this.dom = options.dom
  }

  process (messages: Messages) {
    let messagesObject = MessageObject.fromFormattedJSON(messages)
    messagesObject = this.removeDeprecatedMessages(messagesObject)
    this.registerObjects(messagesObject)
    messagesObject = this.removeOutOfScopeMessages(messagesObject)
    this.dispatch(messagesObject)
  }

  /**
   * Removes from a message list all messages concerning old objects versions.
   * Usefull in case of wrong updates order.
   * Also removes versions that are already known.
   * @param messages messages to filter
   */
  private removeDeprecatedMessages (messagesObject: MessagesObject): MessagesObject {
    return messagesObject.filter((message) => {
      const object = message.object
      if (!object) { return true }
      if (!('version' in object)) { return true }
      if (!this.objects[object.key]) { return true }
      if (this.objects[object.key].version <= object.version) { return true }
      return false
    })
  }

  private registerObjects (messagesObject: MessagesObject): void {
    for (let i = 0; i < messagesObject.length; i++) {
      const message = messagesObject[i]
      const object = message.object
      if (!object) { continue }
      this.objects[object.key] = object
    }
  }

  /**
   * Removes messages that don't concern this tree.
   * For example, for some trees, we are only concerned by tasks that
   * are inside the planning boundaries.
   * @param messages messages to filter
   */
  private removeOutOfScopeMessages (messagesObject: MessagesObject): MessagesObject {
    // TODO
    logger.error('Not implemented yet')
    return messagesObject
  }
}

export {
  PlanningTree
}
