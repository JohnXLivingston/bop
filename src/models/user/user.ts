import {
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  IsAlphanumeric,
  IsEmail,
  IsIn,
  Length,
  Model,
  Table,
  Unique
} from 'sequelize-typescript'
import { CONSTRAINTS } from '../../helpers/config'
import { comparePassword, cryptPassword } from '../../helpers/crypto'
import { logger } from '../../helpers/log'
// import { throwIfNotValid } from '../utils'

@Table({
  tableName: 'user',
  timestamps: true
})
export class UserModel extends Model<UserModel> {
  @AllowNull(false)
  @IsAlphanumeric
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
    comment: 'This indicates how the user is authenticated. Will be used in future releases. For now the only value is "password".',
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
  @Column({
    comment: 'Email is optional.',
    type: DataType.STRING(191) // must be <=191, because of InnoDB+utf8bm and unique constraint.
  })
  email!: string

  @BeforeCreate
  @BeforeUpdate
  static async cryptPasswordIfNeeded (instance: UserModel) {
    if (instance.changed('password') && instance.password) {
      instance.password = await cryptPassword(instance.password)
    }
  }

  async isPasswordMatch (password: string) {
    if (this.authenticationType !== 'password') {
      logger.debug('Calling isPasswordMatch, but the authenticationType is not password but %s', this.authenticationType)
      return false
    }
    if (!this.password) {
      logger.debug('Calling isPasswordMatch but the user as no password in database...')
      return false
    }
    return comparePassword(password, this.password)
  }

  static async countTotal () {
    return UserModel.count()
  }
}
