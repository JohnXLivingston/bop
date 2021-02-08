import * as express from 'express'
import { logger } from 'bop/helpers/log'
import {
  ProjectModel,
  UserModel,
  ResourceModel,
  TaskModel,
  TaskAllocationModel,
  TaskPartModel
} from 'bop/models'

import { asyncMiddleware } from 'bop/middlewares/async'
const planningRouter = express.Router()

function toRetrievedMessages (messages: Messages, objects: Array<{toFormattedJSON: () => any}>): void {
  for (let i = 0; i < objects.length; i++) {
    messages.push({
      messageType: 'retrieved',
      type: 'message',
      object: objects[i].toFormattedJSON()
    })
  }
}

planningRouter.get('/all', asyncMiddleware(async (req: express.Request, res: express.Response) => {
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

planningRouter.post('/test-data', asyncMiddleware(async (req: express.Request, res: express.Response) => {
  logger.error('This entry point is temporary for developing purpose. Must be removed.')

  const [resource1] = await ResourceModel.findOrCreate({
    where: {
      name: 'Resource A'
    },
    defaults: {
      resourceType: 'person'
    }
  })
  const [resource2] = await ResourceModel.findOrCreate({
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

  const [task1] = await TaskModel.findOrCreate({
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
  const [task1allocation1] = await TaskAllocationModel.findOrCreate({
    where: {
      taskId: task1.id,
      resourceId: resource1.id
    },
    defaults: {
      order: 1,
      start: '2020-09-01',
      end: '2020-09-04',
      work: 4 * 60 * 7
    }
  })
  await TaskPartModel.findOrCreate({
    where: {
      allocationId: task1allocation1.id,
      start: '2020-09-01'
    },
    defaults: {
      load: 4 * 60,
      autoMerge: true
    }
  })
  await TaskPartModel.findOrCreate({
    where: {
      allocationId: task1allocation1.id,
      start: '2020-09-04'
    },
    defaults: {
      load: 0,
      autoMerge: true
    }
  })

  const [task2] = await TaskModel.findOrCreate({
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
  const [task2allocation1] = await TaskAllocationModel.findOrCreate({
    where: {
      taskId: task2.id,
      resourceId: resource2.id
    },
    defaults: {
      order: 1,
      start: '2020-09-01',
      end: '2020-09-03',
      work: 3 * 60 * 7
    }
  })
  await TaskPartModel.findOrCreate({
    where: {
      allocationId: task2allocation1.id,
      start: '2020-09-01'
    },
    defaults: {
      load: 3 * 60,
      autoMerge: true
    }
  })
  await TaskPartModel.findOrCreate({
    where: {
      allocationId: task2allocation1.id,
      start: '2020-09-03'
    },
    defaults: {
      load: 0,
      autoMerge: true
    }
  })

  res.json(true)
}))

export {
  planningRouter
}
