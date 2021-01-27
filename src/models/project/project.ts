import {
  AllowNull,
  Column,
  Default,
  DataType,
  Length,
  Model,
  Table,
  Unique
} from 'sequelize-typescript'
import { CONSTRAINTS } from '../../helpers/config'
import { Project } from '../../shared/models/project'

@Table({
  tableName: 'project',
  timestamps: true,
  version: true
})
export class ProjectModel extends Model<ProjectModel> {
  @AllowNull(false)
  @Length(CONSTRAINTS.PROJECT.NAME)
  @Unique
  @Column({
    type: DataType.STRING(120)
  })
  name!: string

  @AllowNull(false)
  @Length({ min: 1, max: 2 })
  @Default('1')
  @Column({
    type: DataType.STRING(2)
  })
  color!: string // FIXME: use BopProjectColor

  toFormattedJSON (): Project {
    const json: Project = {
      id: this.id,
      type: 'project',
      color: this.color as BopProjectColor,
      name: this.name,
      version: this.version
    }
    return json
  }
}
