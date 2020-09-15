import { BaseObject } from '../base.object'
import { Project } from '../../models/project'

export class ProjectObject extends BaseObject {
  name: string
  version: number

  constructor (project: Project) {
    super('project', project.id)
    this.name = project.name
    this.version = project.version
  }

  toFormattedJSON (): Project {
    return {
      id: this.id,
      type: 'project',
      name: this.name,
      version: this.version
    }
  }
}
