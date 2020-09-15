/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests } from '../../test-utils'
import { user1, project1, resource1, task1 } from '../../test-utils/examples'
import { Message } from '../../../src/shared/models/message'
import { MessageObject } from '../../../src/shared/objects/message/message.object'
import { UserObject } from '../../../src/shared/objects/user/user.object'
import { ProjectObject } from '../../../src/shared/objects/project/project.object'
import { ResourceObject } from '../../../src/shared/objects/resource/resource.object'
import { TaskObject } from '../../../src/shared/objects/task/task.object'

const expect = chai.expect

describe('shared/objects/message/message.object.ts', function () {
  before(flushTests)
  after(flushTests)

  const testData: Message[] = [
    {
      type: 'message',
      messageType: 'create',
      object: user1,
      userId: 1
    },
    {
      type: 'message',
      messageType: 'update',
      object: project1,
      userId: 1
    },
    {
      type: 'message',
      messageType: 'delete',
      object: resource1,
      userId: 1
    },
    {
      type: 'message',
      messageType: 'retrieved',
      object: task1
    }
  ]

  describe('constructor', function () {
    it('should instanciate the correct message with a user', function () {
      const message = new MessageObject({
        type: 'message',
        messageType: 'create',
        object: user1,
        userId: 1
      })
      expect(message, 'instanceOf').to.be.instanceOf(MessageObject)
      expect(message.object, 'object.instanceOf').to.be.instanceOf(UserObject)
    })

    it('should instanciate the correct message with a project', function () {
      const message = new MessageObject({
        type: 'message',
        messageType: 'create',
        object: project1,
        userId: 1
      })
      expect(message, 'instanceOf').to.be.instanceOf(MessageObject)
      expect(message.object, 'object.instanceOf').to.be.instanceOf(ProjectObject)
    })

    it('should instanciate the correct message with a resource', function () {
      const message = new MessageObject({
        type: 'message',
        messageType: 'create',
        object: resource1,
        userId: 1
      })
      expect(message, 'instanceOf').to.be.instanceOf(MessageObject)
      expect(message.object, 'object.instanceOf').to.be.instanceOf(ResourceObject)
    })

    it('should instanciate the correct message with a task', function () {
      const message = new MessageObject({
        type: 'message',
        messageType: 'create',
        object: task1,
        userId: 1
      })
      expect(message, 'instanceOf').to.be.instanceOf(MessageObject)
      expect(message.object, 'object.instanceOf').to.be.instanceOf(TaskObject)
    })

    it('should work on all test data', function () {
      for (let i = 0; i < testData.length; i++) {
        const message = new MessageObject(testData[i])
        expect(message, 'instanceOf #' + i).to.be.instanceOf(MessageObject)
      }
    })
  })

  describe('fromFormattedJSON', function () {
    it('should correctly decode a message array', function () {
      const messages = MessageObject.fromFormattedJSON(testData)
      expect(messages, 'array').to.be.an('array').lengthOf(testData.length)
      expect(messages[0], 'instanceOf').to.be.instanceOf(MessageObject)
    })
  })

  describe('toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      for (let i = 0; i < testData.length; i++) {
        const message = new MessageObject(testData[i])
        expect(message.toFormattedJSON(), 'test #' + i).to.be.deep.equal(testData[i])
      }
    })
  })

  describe('static toFormattedJSON', function () {
    it('should return an object deeply equal to the original', function () {
      const messages = MessageObject.fromFormattedJSON(testData)
      expect(MessageObject.toFormattedJSON(messages)).to.be.deep.equal(testData)
    })
  })
})
