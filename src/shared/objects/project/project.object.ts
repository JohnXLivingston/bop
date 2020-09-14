import { Project } from '../../models/project'

export class ProjectObject {
  readonly id: number
  readonly type: string = 'project'
  key: string
  name: string
  version: number

  constructor (project: Project) {
    this.id = project.id
    this.key = project.key
    this.name = project.name
    this.version = project.version
  }

  toFormattedJSON (): Project {
    return {
      id: this.id,
      type: 'project',
      key: this.key,
      name: this.name,
      version: this.version
    }
  }
}
