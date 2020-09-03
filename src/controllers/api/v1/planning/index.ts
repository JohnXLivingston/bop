import * as express from 'express'
import { logger } from '../../../../helpers/log'
import {
  ProjectModel,
  UserModel,
  ResourceModel,
  TaskModel
} from '../../../../models'
import { Messages } from '../../../../shared/models/message'

const asyncHandler = require('express-async-handler')
const planningRouter = express.Router()

function toRetrievedMessages (messages: Messages, objects: {toFormattedJSON(): any}[]): void {
  for (let i = 0; i < objects.length; i++) {
    messages.push({
      messageType: 'retrieved',
      type: 'message',
      object: objects[i].toFormattedJSON()
    })
  }
}

planningRouter.get('/all', asyncHandler(async (req: express.Request, res: express.Response) => {
  logger.error('This entry point is temporary for developing purpose. Must be removed.')

  const messages: Messages = []
  const [projects, users, resources, tasks] = await Promise.all([
    ProjectModel.findAll(),
    UserModel.findAll(),
    ResourceModel.findAll(),
    TaskModel.findAll()
  ])
  toRetrievedMessages(messages, projects)
  toRetrievedMessages(messages, users)
  toRetrievedMessages(messages, resources)
  toRetrievedMessages(messages, tasks)

  res.json(messages)
}))

planningRouter.post('/test-data', asyncHandler(async (req: express.Request, res: express.Response) => {
  logger.error('This entry point is temporary for developing purpose. Must be removed.')

  await ResourceModel.findOrCreate({
    where: {
      name: 'Resource A'
    },
    defaults: {
      resourceType: 'person'
    }
  })
  await ResourceModel.findOrCreate({
    where: {
      name: 'Resource B'
    },
    defaults: {
      resourceType: 'person'
    }
  })

  const [project1] = await ProjectModel.findOrCreate({
    where: {
      name: 'Project 1'
    },
    defaults: {}
  })

  await TaskModel.findOrCreate({
    where: {
      name: 'Task 1',
      projectId: project1.id
    },
    defaults: {
      start: '2020-09-01',
      end: '2020-09-04',
      work: 4 * 60 * 7
    }
  })
  await TaskModel.findOrCreate({
    where: {
      name: 'Task 2',
      projectId: project1.id
    },
    defaults: {
      start: '2020-09-01',
      end: '2020-09-03',
      work: 3 * 60 * 7
    }
  })

  res.json(true)
}))

export {
  planningRouter
}
