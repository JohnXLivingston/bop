import { BopObject } from '../bop-object.model'
import { User } from '../user'

/**
 * A newly created object.
 */
export interface MessageCreation {
  type: 'message',
  messageType: 'create',
  object: BopObject,
  /**
   * The user that created the object
   */
  user?: User
}

/**
 * An updated object.
 */
export interface MessageUpdate {
  type: 'message',
  messageType: 'update',
  object: BopObject,
  /**
   * The user that modified the object
   */
  user?: User
}

/**
 * A deleted object.
 */
export interface MessageDeletion {
  type: 'message',
  messageType: 'delete',
  // FIXME: a soft deleted object, or an objectId?
  object: BopObject,
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
  type: 'message',
  messageType: 'retrieved',
  object: BopObject
}

export type Message = MessageCreation | MessageUpdate | MessageDeletion | MessageRetrieved

export type Messages = Message[]
