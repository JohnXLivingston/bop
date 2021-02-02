import { PlanningNode } from './node'
import { Messages } from 'bop/shared/models/message'
import { BopObject, MessageObject, MessagesObject } from 'bop/shared/objects'
import { PlanningProperties } from 'bop/shared/templates/planning/types'
import { nunjucksContext, Template } from 'bop/public/js/utils/nunjucks'
import { parseWidgets } from 'bop/public/js/utils/widgets'
import getLogger from 'bop/public/js/utils/logger'

const logger = getLogger('lib/planning/tree/classes/tree')

export interface PlanningTreeOptions {
  widget: JQuery,
  planningProperties: PlanningProperties
}

abstract class PlanningTree extends PlanningNode {
  private readonly widget: JQuery
  private readonly _planningProperties: PlanningProperties
  objects: {[key: string]: BopObject} = {}

  constructor (options: PlanningTreeOptions) {
    super('root', undefined)
    this.tree = this
    this.widget = options.widget
    this._planningProperties = options.planningProperties
  }

  get planningProperties (): PlanningProperties {
    return this._planningProperties
  }

  process (messages: Messages) {
    let messagesObject = MessageObject.fromFormattedJSON(messages)
    messagesObject = this.removeDeprecatedMessages(messagesObject)
    this.registerObjects(messagesObject)
    messagesObject = this.removeOutOfScopeMessages(messagesObject)
    this.dispatch(messagesObject)

    // Now we are going to run through nodes breadth first.
    // Note: the tree is cycleless, so there are no risk for infinite loop
    const queue: PlanningNode[] = [this]
    let i = 0
    while (i < queue.length) {
      const node = queue[i++]
      if (node.needRender) {
        node.render()
      }
      if (node.needDomInsert && node.parent) {
        node.insertIntoDom()
      }
      const childs = node.getChilds()
      for (let i = 0; i < childs.length; i++) {
        queue.push(childs[i])
      }
    }

    parseWidgets(this.widget)
  }

  childsDomContainer () {
    return this.widget.find('.widget-planning-content')
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

  renderTemplate (template: Template, vars: any): JQuery {
    const html = $.trim(template.render(nunjucksContext({
      ...vars,
      planningProperties: this._planningProperties
    })))
    const div = document.createElement('div')
    div.innerHTML = html
    return $(div).children().detach()
  }
}

export {
  PlanningTree
}
