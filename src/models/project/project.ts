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
import { CONSTRAINTS } from 'bop/helpers/config'
import { ProjectObject } from 'bop/shared/objects/project/project.object'

@Table({
  tableName: 'project',
  timestamps: true,
  version: true
})
export class ProjectModel extends Model {
  @AllowNull(false)
  @Length(CONSTRAINTS.PROJECT.NAME)
  @Unique
  @Column({
    type: DataType.STRING(120)
  })
  name!: string

  @AllowNull(false)
  @Default('1')
  @Length({ min: 1, max: 2 })
  @Column({
    type: DataType.STRING(2)
  })
  color!: BopProjectColor

  toFormattedJSON (): Project {
    const json: Project = {
      id: this.id,
      type: 'project',
      color: this.color,
      name: this.name,
      version: this.version
    }
    return json
  }

  toObject (): ProjectObject {
    return new ProjectObject(this.toFormattedJSON())
  }
}
