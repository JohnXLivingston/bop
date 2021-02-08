import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  Is,
  IsDate,
  IsInt,
  Length,
  Min,
  Model,
  Table
} from 'sequelize-typescript'
import { ProjectModel } from '../project'
import { CONSTRAINTS } from 'bop/helpers/config'
import { ResourceModel } from '../resource/resource'

@DefaultScope(() => ({
  include: [{
    model: TaskAllocationModel,
    as: 'allocations',
    order: [['order', 'ASC']],
    separate: true
  }]
}))
@Table({
  tableName: 'task',
  timestamps: true,
  version: true
})
class TaskModel extends Model<TaskModel> {
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
    comment: 'The start date for this task. Included.',
    type: DataType.DATEONLY
  })
  start!: string

  @AllowNull(false)
  @IsDate
  @Column({
    comment: 'The ending date for this task. Excluded.',
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

  @HasMany(() => TaskAllocationModel, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  allocations?: TaskAllocationModel[]

  toFormattedJSON (): Task {
    if (!this.allocations) {
      throw new Error('You cant call task.toFormattedJSON if allocations are not loaded.')
    }
    const allocationsJSON: TaskAllocation[] = []
    for (let i = 0; i < this.allocations.length; i++) {
      const allocation = this.allocations[i]
      allocationsJSON.push(allocation.toFormattedJSON())
    }
    const json: Task = {
      id: this.id,
      type: 'task',
      version: this.version,
      name: this.name,
      projectId: this.projectId,
      start: this.start,
      end: this.end,
      work: this.work,
      allocations: allocationsJSON
    }
    return json
  }
}

@DefaultScope(() => ({
  include: [{
    model: TaskPartModel,
    as: 'parts',
    order: [['start', 'ASC']],
    separate: true
  }]
}))
@Table({
  tableName: 'taskallocation',
  timestamps: false,
  version: false
})
class TaskAllocationModel extends Model<TaskAllocationModel> {
  @ForeignKey(() => TaskModel)
  @Column
  taskId!: number

  @AllowNull(false)
  @IsInt
  @Min(0)
  @Column({
    comment: 'The allocation position on the task.',
    type: DataType.INTEGER.UNSIGNED
  })
  order!: number

  @ForeignKey(() => ResourceModel)
  @AllowNull(true)
  @Column({
    comment: 'An optional allocated resource.'
  })
  resourceId?: number

  @AllowNull(false)
  @IsDate
  @Column({
    comment: 'The start date for this allocation. Included.',
    type: DataType.DATEONLY
  })
  start!: string

  @AllowNull(false)
  @IsDate
  @Column({
    comment: 'The ending date for this allocation. Excluded.',
    type: DataType.DATEONLY
  })
  end!: string

  @AllowNull(false)
  @IsInt
  @Column({
    comment: 'Working time in minutes for this line.',
    type: DataType.INTEGER
  })
  work!: number

  @HasMany(() => TaskPartModel, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  parts?: TaskPartModel[]

  toFormattedJSON (): TaskAllocation {
    if (!this.parts) {
      throw new Error('You cant call taskallocation.toFormattedJSON if allocation parts are not loaded.')
    }

    return {
      id: this.id,
      type: 'taskallocation',
      start: this.start,
      end: this.end,
      order: this.order,
      work: this.work,
      resourceId: this.resourceId,
      parts: TaskPartModel.toFormattedJSON(this.parts)
    }
  }
}

@Table({
  tableName: 'taskpart',
  timestamps: false,
  version: false
})
class TaskPartModel extends Model<TaskPartModel> {
  @ForeignKey(() => TaskAllocationModel)
  @Column
  allocationId!: number

  @AllowNull(false)
  @IsDate
  @Column({
    comment: 'The starting date of this part. It ends at the next part ' +
              '(with same assigned resource).',
    type: DataType.DATEONLY
  })
  start!: string

  @AllowNull(false)
  @IsInt
  @Column({
    comment: 'The work load in minutes per day.',
    type: DataType.INTEGER
  })
  load!: number

  @AllowNull(false)
  @Is('Boolean', (value) => {
    if (typeof value !== 'boolean') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`"${value}" is not a boolean.`)
    }
  })
  @Column({
    comment: 'Indicates if this part should be automatically merged ' +
              'with adjacent parts. It meens that it is not a requested ' +
              'division (ex: week-ends).',
    type: DataType.BOOLEAN
  })
  autoMerge!: boolean

  toFormattedJSON (): TaskPart {
    return {
      id: this.id,
      type: 'taskpart',
      start: this.start,
      load: this.load,
      autoMerge: this.autoMerge
    }
  }

  static toFormattedJSON (parts: TaskPartModel[]): TaskPart[] {
    return parts.map(p => p.toFormattedJSON())
  }

  // TODO: unique index for task+allocation+start?
}

export {
  TaskModel,
  TaskAllocationModel,
  TaskPartModel
}
