import { DateLayout } from 'bop/shared/utils/date-layout'

const originDate = '2020-08-31'

const planningProperties: PlanningProperties = {
  nbWeeks: 2,
  cellWidth: 45
}
const dateLayout = new DateLayout({
  cellWidth: planningProperties.cellWidth,
  nbWeeks: planningProperties.cellWidth,
  start: originDate
})

const user1: User = {
  type: 'user',
  id: 0,
  username: 'User A.',
  version: 1
}

const project1: Project = {
  type: 'project',
  id: 0,
  color: '1',
  name: 'Project A',
  version: 1
}

const project2: Project = {
  type: 'project',
  id: 0,
  color: '2',
  name: 'Project B',
  version: 1
}

const resource1: Resource = {
  type: 'resource',
  id: 0,
  name: 'Resouce 1',
  resourceType: 'person',
  version: 1
}

const resource2: Resource = {
  type: 'resource',
  id: 0,
  name: 'Resouce 2',
  resourceType: 'person',
  version: 1
}

const resource3: Resource = {
  type: 'resource',
  id: 0,
  name: 'Resouce 3',
  resourceType: 'person',
  version: 1
}

const task1allocation1part1: TaskPart = {
  type: 'taskpart',
  id: 0,
  start: '2021-01-01',
  load: 60,
  autoMerge: true
}
const task1allocation1part2: TaskPart = {
  type: 'taskpart',
  id: 0,
  start: '2021-01-31',
  load: 0,
  autoMerge: true
}
const task1allocation2part1: TaskPart = {
  type: 'taskpart',
  id: 0,
  start: '2021-01-01',
  load: 120,
  autoMerge: true
}
const task1allocation2part2: TaskPart = {
  type: 'taskpart',
  id: 0,
  start: '2021-01-15',
  load: 0,
  autoMerge: true
}

const task1allocation1: TaskAllocation = {
  type: 'taskallocation',
  id: 0,
  resourceId: 1,
  order: 1,
  start: '2021-01-01',
  end: '2021-01-15',
  work: 14 * 20 * 60 / 2,
  parts: [
    task1allocation1part1,
    task1allocation1part2
  ]
}
const task1allocation2: TaskAllocation = {
  type: 'taskallocation',
  id: 0,
  resourceId: 2,
  order: 2,
  start: '2021-01-01',
  end: '2021-01-31',
  work: 14 * 20 * 60 / 2,
  parts: [
    task1allocation2part1,
    task1allocation2part2
  ]
}

const task1: Task = {
  type: 'task',
  id: 0,
  start: '2020-09-01',
  end: '2020-09-30',
  name: 'Task 1',
  projectId: 1,
  work: 60,
  allocations: [
    task1allocation1,
    task1allocation2
  ],
  version: 1
}

const taskWithUnallocatedLines: Task = {
  type: 'task',
  id: 0,
  start: '2020-09-01',
  end: '2020-09-30',
  name: 'Task with unallocated lines',
  projectId: 1,
  work: 60,
  allocations: [
    {
      type: 'taskallocation',
      id: 0,
      resourceId: 1,
      order: 3,
      start: '2021-01-01',
      end: '2021-01-31',
      work: 14 * 20 * 60 / 2,
      parts: [
        {
          type: 'taskpart',
          id: 0,
          start: '2021-01-01',
          load: 120,
          autoMerge: true
        },
        {
          type: 'taskpart',
          id: 0,
          start: '2021-01-15',
          load: 0,
          autoMerge: true
        }
      ]
    },
    {
      type: 'taskallocation',
      id: 0,
      resourceId: null,
      order: 4,
      start: '2021-01-01',
      end: '2021-01-31',
      work: 14 * 20 * 60 / 2,
      parts: [
        {
          type: 'taskpart',
          id: 0,
          start: '2021-01-01',
          load: 120,
          autoMerge: true
        },
        {
          type: 'taskpart',
          id: 0,
          start: '2021-01-15',
          load: 0,
          autoMerge: true
        }
      ]
    }
  ],
  version: 1
}

export {
  originDate,
  planningProperties,
  dateLayout,
  user1,
  project1,
  project2,
  resource1,
  resource2,
  resource3,
  task1,
  task1allocation1,
  task1allocation2,
  task1allocation1part1,
  task1allocation1part2,
  task1allocation2part1,
  task1allocation2part2,
  taskWithUnallocatedLines
}
