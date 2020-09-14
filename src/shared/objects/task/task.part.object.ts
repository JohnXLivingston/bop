import { TaskPart } from '../../models/task'

export class TaskPartObject {
  readonly id: number
  readonly type: string = 'taskpart'
  start: string
  end: string
  load: number
  autoMerge: boolean

  constructor (part: TaskPart) {
    this.id = part.id
    this.start = part.start
    this.end = part.end
    this.load = part.load
    this.autoMerge = part.autoMerge
  }

  static toFormattedJSON (parts: TaskPartObject[]): TaskPart[] {
    const result: TaskPart[] = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]
      if (nextPart && nextPart.start <= part.start) {
        throw new Error('It seems that task parts are not correctly sorted.')
      }
      result.push({
        id: part.id,
        type: 'taskpart',
        start: part.start,
        end: nextPart ? nextPart.start : '9999-12-31',
        load: part.load,
        autoMerge: part.autoMerge
      })
    }
    return result
  }
}
