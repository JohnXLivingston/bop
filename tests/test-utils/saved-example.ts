import {
  ProjectModel,
  ResourceModel,
  TaskModel,
  TaskAllocationModel,
  TaskPartModel
} from 'bop/models'
import * as examples from './examples'

interface SavedExamples {
  project1: ProjectModel
  project2: ProjectModel
  resource1: ResourceModel
  resource2: ResourceModel
  resource3: ResourceModel
  task1: TaskModel
  taskWithUnallocatedLines: TaskModel
}

async function saveExamples (): Promise<SavedExamples> {
  const project1 = new ProjectModel(examples.project1)
  const project2 = new ProjectModel(examples.project2)
  const resource1 = new ResourceModel(examples.resource1)
  const resource2 = new ResourceModel(examples.resource2)
  const resource3 = new ResourceModel(examples.resource3)
  await Promise.all([
    project1.save(),
    project2.save(),
    resource1.save(),
    resource2.save(),
    resource3.save()
  ])
  const resourceIdMap: {[keys: number]: number} = {
    1: resource1.id,
    2: resource2.id,
    3: resource3.id
  }

  const tasks: Array<{
    model: TaskModel
    data: Task
  }> = []
  let task1 = new TaskModel({
    ...examples.task1,
    projectId: project1.id
  })
  tasks.push({
    model: task1,
    data: examples.task1
  })
  let taskWithUnallocatedLines = new TaskModel({
    ...examples.taskWithUnallocatedLines,
    projectId: project1.id
  })
  tasks.push({
    model: taskWithUnallocatedLines,
    data: examples.taskWithUnallocatedLines
  })
  await Promise.all([
    task1.save(),
    taskWithUnallocatedLines.save()
  ])

  for (let i = 0; i < tasks.length; i++) {
    const taskModel = tasks[i].model
    const taskData = tasks[i].data
    for (let j = 0; taskData.allocations && j < taskData.allocations.length; j++) {
      const allocation = new TaskAllocationModel({
        ...taskData.allocations[j],
        taskId: taskModel.id,
        resourceId: resourceIdMap[taskData.allocations[j].resourceId ?? 0] ?? null
      })
      await allocation.save()
      for (let k = 0; allocation.parts && k < allocation.parts.length; k++) {
        const part = new TaskPartModel({
          ...allocation.parts[k],
          allocationId: allocation.id
        })
        await part.save()
      }
    }
  }

  // reload tasks with allocations and parts
  task1 = await TaskModel.findByPk(task1.id)
  taskWithUnallocatedLines = await TaskModel.findByPk(taskWithUnallocatedLines.id)

  return {
    project1,
    project2,
    resource1,
    resource2,
    resource3,
    task1,
    taskWithUnallocatedLines
  }
}

export {
  saveExamples,
  SavedExamples
}
