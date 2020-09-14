import { User } from '../../models/user'

export class UserObject {
  readonly id: number
  readonly type: string = 'user'
  readonly key: string
  version: number
  username: string

  constructor (user: User) {
    this.id = user.id
    this.key = user.key
    this.version = user.version
    this.username = user.username
  }

  toFormattedJSON (): User {
    return {
      id: this.id,
      type: 'user',
      key: this.key,
      version: this.version,
      username: this.username
    }
  }
}
