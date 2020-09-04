export interface Task {
  id: number,
  type: 'task',
  key: string,
  version: number,
  name: string,
  projectId: number,
  start: string,
  end: string,
  work: number,
  allocations: TaskAllocation[]
}

export interface TaskAllocation {
  id: number,
  type: 'taskallocation',
  resourceId?: number,
  order: number,
  start: string,
  end: string,
  work: number,
  parts: TaskPart[]
}

export interface TaskPart {
  id: number,
  type: 'taskpart',
  start: string,
  end: string,
  load: number,
  autoMerge: boolean
}
