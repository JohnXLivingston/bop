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

  static async countTotal (): Promise<number> {
    return ApplicationModel.count()
  }

  static async load (): Promise<ApplicationModel | null> {
    return ApplicationModel.findOne()
  }
}
