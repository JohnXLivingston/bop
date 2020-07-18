import {
  AllowNull,
  Column,
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

  toFormattedJSON (): Project {
    const json: Project = {
      id: this.id,
      type: 'project',
      key: 'project/' + this.id,
      name: this.name,
      version: this.version
    }
    return json
  }
}
