import { Model, Table, Column, AllowNull, Default, IsInt } from 'sequelize-typescript'

@Table({
  tableName: 'application',
  timestamps: false
})
export class ApplicationModel extends Model<ApplicationModel> {
  @AllowNull(false)
  @Default(0)
  @IsInt
  @Column
  migrationVersion!: number

  static async countTotal () {
    return ApplicationModel.count()
  }

  static async load () {
    return ApplicationModel.findOne()
  }
}
