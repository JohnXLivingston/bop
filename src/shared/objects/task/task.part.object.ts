export class TaskPartObject {
  readonly id: number
  readonly type: string = 'taskpart'
  start: string
  end: string
  load: number
  autoMerge: boolean

  constructor (part: TaskPart, end: string | null) {
    this.id = part.id
    this.start = part.start
    this.end = end || '9999-12-31'
    this.load = part.load
    this.autoMerge = part.autoMerge
  }

  toFormattedJSON (): TaskPart {
    return {
      id: this.id,
      type: 'taskpart',
      start: this.start,
      load: this.load,
      autoMerge: this.autoMerge
    }
  }

  static toFormattedJSON (parts: TaskPartObject[]): TaskPart[] {
    return parts.map(p => p.toFormattedJSON())
  }
}
