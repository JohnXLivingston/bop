import { TaskPartObject } from './task.part.object'

export class TaskAllocationObject {
  readonly id: number
  readonly type: string = 'taskallocation'
  resourceId?: number
  order: number
  start: string
  end: string
  work: number
  parts: TaskPartObject[]

  constructor (allocation: TaskAllocation) {
    this.id = allocation.id
    this.resourceId = allocation.resourceId
    this.order = allocation.order
    this.start = allocation.start
    this.end = allocation.end
    this.work = allocation.work
    this.parts = []
    for (let i = 0; i < allocation.parts.length; i++) {
      const part = allocation.parts[i]
      const nextPart = allocation.parts[i + 1]
      if (nextPart) {
        if (nextPart.start <= part.start) {
          throw new Error('It seems that task parts are not correctly sorted.')
        }
      }
      this.parts.push(new TaskPartObject(part, nextPart?.start))
    }
  }

  toFormattedJSON (): TaskAllocation {
    if (!this.parts) {
      throw new Error('You cant call taskallocationobject.toFormattedJSON if allocation parts are not loaded.')
    }

    return {
      id: this.id,
      type: 'taskallocation',
      start: this.start,
      end: this.end,
      order: this.order,
      work: this.work,
      resourceId: this.resourceId,
      parts: TaskPartObject.toFormattedJSON(this.parts)
    }
  }
}
