import { BaseObject } from '../base.object'

export class UserObject extends BaseObject {
  version: number
  username: string

  constructor (user: User) {
    super('user', user.id)
    this.version = user.version
    this.username = user.username
  }

  toFormattedJSON (): User {
    return {
      id: this.id,
      type: 'user',
      version: this.version,
      username: this.username
    }
  }
}
