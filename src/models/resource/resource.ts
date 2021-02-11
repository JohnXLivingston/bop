import { Model, Table, AllowNull, IsIn, Column, DataType, Length, HasMany } from 'sequelize-typescript'
import { CONSTRAINTS } from '../../helpers/config'
import { TaskAllocationModel } from '../task/task'
import { ResourceObject } from 'bop/shared/objects/resource/resource.object'

@Table({
  tableName: 'resource',
  timestamps: true,
  version: true
})
export class ResourceModel extends Model<ResourceModel> {
  @AllowNull(false)
  @IsIn([['person', 'room']])
  @Column({
    comment: 'The type of resource.',
    type: DataType.STRING(10)
  })
  resourceType!: string

  @AllowNull(false)
  @Length(CONSTRAINTS.RESOURCE.NAME)
  @Column({
    type: DataType.STRING(CONSTRAINTS.RESOURCE.NAME.max)
  })
  name!: string

  @HasMany(() => TaskAllocationModel, {
    foreignKey: {
      allowNull: true
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  })
  taskAllocations!: TaskAllocationModel[]

  toFormattedJSON (): Resource {
    return {
      id: this.id,
      type: 'resource',
      version: this.version,
      name: this.name,
      resourceType: this.resourceType
    }
  }

  toObject (): ResourceObject {
    return new ResourceObject(this.toFormattedJSON())
  }
}
