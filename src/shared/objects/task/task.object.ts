import { BaseObject } from '../base.object'
import { ResourceObject } from '../resource/resource.object'
import { TaskAllocationObject } from './task.allocation.object'

export class TaskObject extends BaseObject {
  version: number
  name: string
  readonly projectId: number
  start: string
  end: string
  work: number
  allocations: TaskAllocationObject[]

  constructor (task: Task) {
    super('task', task.id)
    this.version = task.version
    this.name = task.name
    this.projectId = task.projectId
    this.start = task.start
    this.end = task.end
    this.work = task.work
    this.allocations = []
    for (let i = 0; i < task.allocations.length; i++) {
      this.allocations.push(new TaskAllocationObject(task.allocations[i]))
    }
  }

  toFormattedJSON (): Task {
    if (!this.allocations) {
      throw new Error('You cant call taskobject.toFormattedJSON if allocations are not loaded.')
    }
    const allocationsJSON: TaskAllocation[] = []
    for (let i = 0; i < this.allocations.length; i++) {
      const allocation = this.allocations[i]
      allocationsJSON.push(allocation.toFormattedJSON())
    }
    const json: Task = {
      id: this.id,
      type: 'task',
      version: this.version,
      name: this.name,
      projectId: this.projectId,
      start: this.start,
      end: this.end,
      work: this.work,
      allocations: allocationsJSON
    }
    return json
  }

  isResourceAllocated (resource: undefined | number | ResourceObject | string): boolean {
    let resourceId: number | undefined
    if (typeof resource === 'object') {
      resourceId = resource.id
    } else if (typeof resource === 'string') {
      const m = resource.match(/^resource\/(\d+)$/)
      if (m) {
        resourceId = +m[1]
      } else {
        throw new Error(`Can't convert the string ${resource} to a resource ID`)
      }
    } else {
      resourceId = resource
    }
    if (resourceId === 0) {
      // id=0 means 'unsaved'. If you call this method with an unsaved resource,
      // it is probably a bug.
      throw new Error('You can\'t call isResourceAllocated with the value 0.')
    }

    for (let i = 0; i < this.allocations.length; i++) {
      if (this.allocations[i].resourceId === resourceId) {
        return true
      }
    }
    return false
  }
}
