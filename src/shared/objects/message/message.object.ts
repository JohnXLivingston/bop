import { ProjectObject } from '../project/project.object'
import { ResourceObject } from '../resource/resource.object'
import { TaskObject } from '../task/task.object'
import { UserObject } from '../user/user.object'
import { BopObject } from '../bop.object'

export class MessageObject {
  readonly type: string = 'message'
  readonly messageType: 'update' | 'create' | 'delete' | 'retrieved'
  object: BopObject
  userId?: number

  constructor (message: Message) {
    this.type = message.type
    this.messageType = message.messageType
    this.userId = 'userId' in message ? message.userId : undefined
    switch (message.object.type) {
      case 'task':
        this.object = new TaskObject(message.object)
        break
      case 'resource':
        this.object = new ResourceObject(message.object)
        break
      case 'user':
        this.object = new UserObject(message.object)
        break
      case 'project':
        this.object = new ProjectObject(message.object)
        break
      default:
        throw new Error('Unknown object type.')
    }
  }

  static fromFormattedJSON (messages: Message[]): MessagesObject {
    const result: MessagesObject = []
    for (let i = 0; i < messages.length; i++) {
      result.push(new MessageObject(messages[i]))
    }
    return result
  }

  toFormattedJSON (): Message {
    const r = {
      type: 'message',
      messageType: this.messageType,
      object: this.object.toFormattedJSON()
    }
    if (this.messageType === 'retrieved') {
      return r as MessageRetrieved
    }
    (r as MessageAction).userId = this.userId
    return r as MessageAction
  }

  static toFormattedJSON (messages: MessagesObject): Message[] {
    const result: Message[] = []
    for (let i = 0; i < messages.length; i++) {
      result.push(messages[i].toFormattedJSON())
    }
    return result
  }
}

export type MessagesObject = MessageObject[]
