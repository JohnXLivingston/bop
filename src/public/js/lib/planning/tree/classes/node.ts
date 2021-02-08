import { PlanningTree } from './tree'
import { BopObject, MessageObject, MessagesObject } from 'bop/shared/objects'
import { Template } from 'bop/public/js/utils/nunjucks'
import getLogger from 'bop/public/js/utils/logger'

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

  get needRender (): boolean {
    return this._needRender
  }

  get needDomInsert (): boolean {
    return this._needDomInsert
  }

  getChilds (): PlanningNode[] {
    return [...this.childsSorted]
  }

  object (key: string): BopObject | null {
    return this.tree.objects[key] || null
  }

  dispatch (messages: MessagesObject): void {
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
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
    const vars = this.renderVars()
    if (!vars) {
      throw new Error(`The node ${this.path} tries to render, but has no renderVars.`)
    }
    logger.debug(`Rendering the node ${this.path}.`)
    const dom = this.tree.renderTemplate(this.template, vars)
    if (!this.dom) {
      this._needDomInsert = true
      this.dom = dom
    } else {
      logger.debug(`The node ${this.path} had already a dom, updating smartly without loosing childs content.`)
      const newAttributes: {[key: string]: true} = {}
      for (let i = 0; i < dom[0].attributes.length; i++) {
        const attribute = dom[0].attributes[i]
        newAttributes[attribute.name] = true
        this.dom.attr(attribute.name, dom.attr(attribute.name) ?? '')
      }
      for (let i = 0; i < this.dom[0].attributes.length; i++) {
        const attribute = this.dom[0].attributes[i]
        if (!(attribute.name in newAttributes)) {
          this.dom.removeAttr(attribute.name)
        }
      }
      this.dom.find('>.widget-planning-node-content').replaceWith(dom.find('>.widget-planning-node-content'))
    }
  }

  renderVars (): NodeRenderVars | null {
    return null
  }

  commonRenderVars (): NodeRenderVarsPartial {
    return {
      planningProperties: this.tree.planningProperties
    }
  }

  insertIntoDom (): void {
    if (!this._needDomInsert) {
      return
    }
    this._needDomInsert = false
    if (!this.parent) {
      return
    }
    if (!this.dom) {
      throw new Error('Trying to insert a node before his dom is computed.')
    }
    logger.debug(`Inserting the node ${this.path} in the dom.`)
    const parent = this.parent
    const container = parent.childsDomContainer()
    if (!container) {
      throw new Error('Trying to insert a node in a parent without childsDomContainer.')
    }
    // FIXME: insert in right place.
    container.after(this.dom)
  }

  childsDomContainer (): JQuery | null {
    if (!this.dom) {
      return null
    }
    const dom = this.dom.find('>.widget-planning-node-childs')
    if (!dom.length) {
      return null
    }
    return dom
  }

  destroy (): void {
    // TODO: remove node from DOM.
    if (this.parent) {
      this.parent.unregisterChild(this)
    }
  }
}

interface NodeKeyClass {
  key: string
  Class: new(key: string, parent?: PlanningNode) => PlanningNode
}

export {
  PlanningNode,
  // eslint-disable-next-line no-undef
  NodeKeyClass
}
