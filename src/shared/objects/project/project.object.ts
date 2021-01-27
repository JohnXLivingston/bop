import { BaseObject } from '../base.object'
import { Project } from '../../models/project'

export class ProjectObject extends BaseObject {
  color: BopProjectColor
  name: string
  version: number

  constructor (project: Project) {
    super('project', project.id)
    this.color = project.color
    this.name = project.name
    this.version = project.version
  }

  toFormattedJSON (): Project {
    return {
      id: this.id,
      type: 'project',
      color: this.color,
      name: this.name,
      version: this.version
    }
  }
}
