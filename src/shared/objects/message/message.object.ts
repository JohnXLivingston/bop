import { Message } from '../../models/message'
import { ProjectObject } from '../project/project.object'
import { ResourceObject } from '../resource/resource.object'
import { TaskObject } from '../task/task.object'
import { UserObject } from '../user/user.object'

export class MessageObject {
  readonly type: string = 'message'
  readonly messageType: 'update' | 'create' | 'delete' | 'retrieved'
  object: UserObject | ProjectObject | TaskObject | ResourceObject
  userId?: number

  constructor (message: Message) {
    this.type = message.type
    this.messageType = message.messageType
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

  static fromFormattedJSON (messages: Message[]): MessageObject[] {
    const result: MessageObject[] = []
    for (let i = 0; i < messages.length; i++) {
      result.push(new MessageObject(messages[i]))
    }
    return result
  }

  toFormattedJSON (): Message {
    return {
      type: 'message',
      messageType: this.messageType,
      object: this.object.toFormattedJSON(),
      userId: this.userId
    }
  }

  static toFormattedJSON (messages: MessageObject[]): Message[] {
    const result: Message[] = []
    for (let i = 0; i < messages.length; i++) {
      result.push(messages[i].toFormattedJSON())
    }
    return result
  }
}
