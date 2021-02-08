export abstract class BaseObject {
  /**
   * The id 0 is a special id for unsaved objects.
   */
  readonly id: number
  readonly type: string
  readonly key: string

  constructor (type: string, id?: number) {
    this.type = type
    this.id = id ?? 0
    this.key = type + '/' + this.id.toString()
  }
}
