import { ProjectObject } from 'bop/shared/objects/project/project.object'
import { BaseCrud, CrudConnection } from '../base'

export class ProjectCrud extends BaseCrud<Project, ProjectObject> {
  constructor (connection?: CrudConnection) {
    super(ProjectObject, connection)
  }

  public async insert (project: Project): Promise<void> {
    return this.query({
      sql: `INSERT INTO \`${this.tablePrefix}project\`
        (name, color, createdAt, updatedAt, version)
        VALUES
        (:name, :color, NOW(), NOW(), 0)`,
      namedPlaceholders: true
    }, project)
  }

  public async update (project: Project): Promise<void> {
    return this.query({
      sql: `UPDATE \`${this.tablePrefix}project
        set name=:name, color=:color, updatedAt=NOW(), version= version+1
        WHERE id=:id`,
      namedPlaceholders: true
    }, project)
  }

  public async findAll (): Promise<Project[]> {
    const rows = await this.query(
      `SELECT * from \`${this.tablePrefix}project\``
    )
    const projects: Project[] = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      projects.push({
        id: row.id,
        type: 'project',
        color: row.color,
        name: row.name,
        version: row.version
      })
    }
    return projects
  }
}
