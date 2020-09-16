import { BopElement } from '../bop-element.model'

/**
 * A newly created object.
 */
export interface MessageCreation {
  type: 'message',
  messageType: 'create',
  object: BopElement,
  /**
   * The userId from the user that created the object
   */
  userId?: number
}

/**
 * An updated object.
 */
export interface MessageUpdate {
  type: 'message',
  messageType: 'update',
  object: BopElement,
  /**
   * The userId from the user that modified the object
   */
  userId?: number
}

/**
 * A deleted object.
 */
export interface MessageDeletion {
  type: 'message',
  messageType: 'delete',
  // FIXME: a soft deleted object, or an objectId?
  // NB: I think it should be a soft deleted object,
  // with an incremented version number.
  object: BopElement,
  /**
   * The userId from the user that deleted the object
   */
  userId?: number
}

/**
 * An existing object retrieved by API, or automatically
 * added by the backend.
 */
export interface MessageRetrieved {
  type: 'message',
  messageType: 'retrieved',
  object: BopElement
}

/**
 * Message for an action that can be done by a user.
 */
export type MessageAction = MessageCreation | MessageUpdate | MessageDeletion
/**
 * All types of message.
 */
export type Message = MessageAction | MessageRetrieved

export type Messages = Message[]
