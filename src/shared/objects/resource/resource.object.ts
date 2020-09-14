import { Resource } from '../../models/resource'

export class ResourceObject {
  readonly id: number
  readonly type: string = 'resource'
  readonly key: string
  version: number
  name: string
  resourceType: string

  constructor (resource: Resource) {
    this.id = resource.id
    this.key = resource.key
    this.version = resource.version
    this.name = resource.name
    this.resourceType = resource.resourceType
  }

  toFormattedJSON (): Resource {
    return {
      id: this.id,
      type: 'resource',
      key: this.key,
      version: this.version,
      name: this.name,
      resourceType: this.resourceType
    }
  }
}
