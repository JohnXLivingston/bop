import { BaseObject } from '../base.object'

export class ResourceObject extends BaseObject {
  version: number
  name: string
  resourceType: string

  constructor (resource: Resource) {
    super('resource', resource.id)
    this.version = resource.version
    this.name = resource.name
    this.resourceType = resource.resourceType
  }

  toFormattedJSON (): Resource {
    return {
      id: this.id,
      type: 'resource',
      version: this.version,
      name: this.name,
      resourceType: this.resourceType
    }
  }
}
