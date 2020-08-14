import { Model, Table, AllowNull, IsIn, Column, DataType, Length } from 'sequelize-typescript'
import { CONSTRAINTS } from '../../helpers/config'
import { Resource } from '../../shared/models/resource'

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

  toFormattedJSON (): Resource {
    return {
      id: this.id,
      type: 'resource',
      key: 'resource/' + this.id,
      version: this.version,
      name: this.name,
      resourceType: this.resourceType
    }
  }
}
