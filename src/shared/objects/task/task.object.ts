import { BaseObject } from '../base.object'
import { TaskAllocationObject } from './task.allocation.object'
import { TaskPartObject } from './task.part.object'
import type { DateLayout } from 'bop/shared/utils/date-layout'
import { ensureId, EnsurableId } from 'bop/shared/utils/object-id'

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

  toCalendarContent (_dateLayout: DateLayout, _allocationId: number): NodeContent.Calendar {
    // TODO.
    return {
      items: []
    }
  }

  isResourceAllocated (resource: EnsurableId): boolean {
    const resourceId = ensureId('resource', resource)
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

  resourceParts (resource: EnsurableId): TaskPartObject[] {
    const resourceId = ensureId('resource', resource)
    const r: TaskPartObject[] = []
    for (let i = 0; i < this.allocations.length; i++) {
      const allocation = this.allocations[i]
      if (allocation.resourceId === resourceId) {
        const parts = allocation.parts
        r.push(...parts)
      }
    }
    return r
  }
}
