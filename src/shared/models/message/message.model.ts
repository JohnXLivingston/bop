import { Project } from '../project'
import { Task } from '../task'
import { User } from '../user'

type MessageObject = Project | Task | User

/**
 * A newly created object.
 */
export interface MessageCreation {
  type: 'create',
  object: MessageObject,
  /**
   * The user that created the object
   */
  user?: User
}

/**
 * An updated object.
 */
export interface MessageUpdate {
  type: 'update',
  object: MessageObject,
  /**
   * The user that modified the object
   */
  user?: User
}

/**
 * A deleted object.
 */
export interface MessageDeletion {
  type: 'delete',
  // FIXME: a soft deleted object, or an objectId?
  object: MessageObject,
  /**
   * The user that deleted the object
   */
  user?: User
}

/**
 * An existing object retrieved by API, or automatically
 * added by the backend.
 */
export interface MessageRetrieved {
  type: 'retrieved',
  object: MessageObject
}

export type Message = MessageCreation | MessageUpdate | MessageDeletion | MessageRetrieved

export type Messages = Message[]
