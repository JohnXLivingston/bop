declare interface Task {
  id: number,
  type: 'task',
  version: number,
  name: string,
  projectId: number,
  start: string,
  end: string,
  work: number,
  allocations: TaskAllocation[]
}

declare interface TaskAllocation {
  id: number,
  type: 'taskallocation',
  resourceId?: number,
  order: number,
  start: string,
  end: string,
  work: number,
  parts: TaskPart[]
}

declare interface TaskPart {
  id: number,
  type: 'taskpart',
  start: string,
  load: number,
  autoMerge: boolean
}
