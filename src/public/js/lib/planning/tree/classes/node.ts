import { PlanningTree } from './tree'
import { BopObject, MessageObject, MessagesObject } from '../../../../../../shared/objects'
import { NodeRenderVars } from '../../../../../../shared/templates/planning/types'
import { Template } from '../../../../utils/nunjucks'
import getLogger from '../../../../utils/logger'

const logger = getLogger('lib/planning/tree/classes/node')

abstract class PlanningNode {
  tree!: PlanningTree
  path: string
  key: string
  parent?: PlanningNode
  protected childsByKey: { [key: string]: PlanningNode }
  protected childsSorted: PlanningNode[]

  private _needRender: boolean = true
  private _needDomInsert: boolean = true
  protected template?: Template
  protected dom?: JQuery

  constructor (key: string, parent?: PlanningNode) {
    this.key = key
    this.parent = parent
    this.path = parent ? parent.path + '>' + key : 'path:' + key
    if (parent) { this.tree = parent.tree }
    this.childsByKey = {}
    this.childsSorted = []
  }

  get needRender () {
    return this._needRender
  }

  get needDomInsert () {
    return this._needDomInsert
  }

  getChilds (): PlanningNode[] {
    return [...this.childsSorted]
  }

  object (key: string): BopObject | null {
    return this.tree.objects[key] || null
  }

  dispatch (messages: MessagesObject) {
    logger.debug('Creating missing childs...')
    this.createMissingChilds(messages)
    logger.debug('Removing deprecated childs...')
    this.removeDeprecatedChilds(messages)
    logger.debug('Updating childs...')
    this.updateChilds(messages)
  }

  createMissingChilds (messages: MessagesObject): void {
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

  removeDeprecatedChilds (_messages: MessagesObject): void {
    // TODO: remove unnecessary childs (deleted nodes, ...)
  }

  updateChilds (_messages: MessagesObject): void {
    // TODO
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

  abstract childKeyClassForMessage (message: MessageObject): NodeKeyClass | null

  render (): void {
    if (!this._needRender) {
      return
    }
    this._needRender = false
    if (!this.template) {
      return
    }
    logger.debug('Rendering the node ' + this.key)
    this._needDomInsert = true
    this.dom = this.tree.renderTemplate(this.template, this.renderVars())
  }

  renderVars (): NodeRenderVars {
    return {
      planningProperties: this.tree.planningProperties
    }
  }

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
