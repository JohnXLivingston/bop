import { PlanningNode } from './node'
import { BopObject } from '../../../../../../shared/models/bop-object.model'
import { Messages } from '../../../../../../shared/models/message'
import { MessageObject } from '../../../../../../shared/objects/message/message.object'
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
    messages = this.removeDeprecatedMessages(messages)
    this.registerObjects(messages)
    messages = this.removeOutOfScopeMessages(messages)
    this.dispatch(MessageObject.fromFormattedJSON(messages))
  }

  /**
   * Removes from a message list all messages concerning old objects versions.
   * Usefull in case of wrong updates order.
   * Also removes versions that are already known.
   * @param messages messages to filter
   */
  private removeDeprecatedMessages (messages: Messages): Messages {
    return messages.filter((message) => {
      const object = message.object
      if (!object) { return true }
      if (!('version' in object)) { return true }
      if (!this.objects[object.key]) { return true }
      if (this.objects[object.key].version <= object.version) { return true }
      return false
    })
  }

  private registerObjects (messages: Messages): void {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
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
  private removeOutOfScopeMessages (messages: Messages): Messages {
    // TODO
    logger.error('Not implemented yet')
    return messages
  }
}

export {
  PlanningTree
}
