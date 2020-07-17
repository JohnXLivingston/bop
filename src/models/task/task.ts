import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsDate,
  IsInt,
  Length,
  Model,
  Table
} from 'sequelize-typescript'
import { ProjectModel } from '../project'
import { Task } from '../../shared/models/task'
import { CONSTRAINTS } from '../../helpers/config'

@Table({
  tableName: 'task',
  timestamps: true,
  version: true
})
export class TaskModel extends Model<TaskModel> {
  @ForeignKey(() => ProjectModel)
  projectId!: number

  @BelongsTo(() => ProjectModel, {
    foreignKey: {
      allowNull: false
    }
  })
  project!: ProjectModel

  @AllowNull(false)
  @Length(CONSTRAINTS.TASK.NAME)
  @Column({
    type: DataType.STRING(120)
  })
  name!: string

  @AllowNull(false)
  @IsDate
  @Column({
    comment: 'The start date for this task.',
    type: DataType.DATEONLY
  })
  start!: string

  @AllowNull(false)
  @IsDate
  @Column({
    comment: 'The ending date for this task.',
    type: DataType.DATEONLY
  })
  end!: string

  @AllowNull(false)
  @IsInt
  @Column({
    comment: 'Working time in minutes.',
    type: DataType.INTEGER
  })
  work!: number

  toFormattedJSON (): Task {
    const json: Task = {
      id: this.id,
      version: this.version,
      name: this.name,
      projectId: this.projectId,
      start: this.start,
      end: this.end,
      work: this.work
    }
    return json
  }
}
