import {
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  Is,
  IsEmail,
  IsIn,
  Length,
  Model,
  Table,
  Unique
} from 'sequelize-typescript'
import { CONSTRAINTS } from 'bop/helpers/config'
import { comparePassword, cryptPassword } from 'bop/helpers/crypto'
import { logger } from 'bop/helpers/log'
import { UserObject } from 'bop/shared/objects/user/user.object'

@Table({
  tableName: 'user',
  timestamps: true,
  version: true
})
export class UserModel extends Model {
  @AllowNull(false)
  @Is(/^[a-zA-Z0-9_-]+$/)
  @Length(CONSTRAINTS.USER.LOGIN)
  @Unique
  @Column({
    type: DataType.STRING(191) // must be <=191, because of InnoDB+utf8bm and unique constraint.
  })
  login!: string

  @AllowNull(false)
  @IsIn([['password']])
  @Default('password')
  @Column({
    comment:
      'This indicates how the user is authenticated. Will be used in future releases. ' +
      'For now the only value is "password".',
    type: DataType.STRING(10)
  })
  authenticationType!: string

  @AllowNull(true)
  @Length(CONSTRAINTS.USER.PASSWORD)
  @Column({
    comment: 'Password can be null, depending on the authenticationType.'
  })
  password?: string

  @AllowNull(true)
  @IsEmail
  @Unique
  @Length({ max: 191 })
  @Column({
    comment: 'Email is optional.',
    type: DataType.STRING(191) // must be <=191, because of InnoDB+utf8bm and unique constraint.
  })
  email?: string

  @AllowNull(false)
  @Length(CONSTRAINTS.USER.USERNAME)
  @Column({
    type: DataType.STRING(CONSTRAINTS.USER.USERNAME.max)
  })
  username!: string

  @BeforeCreate
  @BeforeUpdate
  static async cryptPasswordIfNeeded (instance: UserModel): Promise<void> {
    if (instance.changed('password') && instance.password) {
      instance.password = await cryptPassword(instance.password)
    }
  }

  async isPasswordMatch (password: string): Promise<boolean> {
    if (this.authenticationType !== 'password') {
      logger.debug(
        'Calling isPasswordMatch, but the authenticationType is not password but %s',
        this.authenticationType
      )
      return false
    }
    if (!this.password) {
      logger.debug('Calling isPasswordMatch but the user as no password in database...')
      return false
    }
    return comparePassword(password, this.password)
  }

  static async countTotal (): Promise<number> {
    return UserModel.count()
  }

  /**
   * Returns a User, that can be JSON.stringified for the
   * frontend. Should not contain any value that other users
   * can't see for privacy reason.
   * FIXME: we should perhaps have several format,
   * including private informations for the user itself,
   * or for admins.
   */
  toFormattedJSON (): User {
    const json: User = {
      id: this.id,
      type: 'user',
      version: this.version,
      username: this.username
    }
    return json
  }

  toObject (): UserObject {
    return new UserObject(this.toFormattedJSON())
  }
}
