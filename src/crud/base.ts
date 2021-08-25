import type { QueryOptions, Connection, PoolConnection } from 'mariadb'
import { CONFIG } from '../helpers/config'
import { getPool } from '../helpers/database/connection'

type CrudConnection = Connection | PoolConnection
interface CrudData {
  id: number
}

interface CrudBaseConstructorArgs {
  ObjectType: new(data: T) => O,
  tableName: string,
  fields: CrudField[],
  connection?: Connection
}

interface CrudField {
  name: string
}

abstract class BaseCrud<T extends CrudData, O> {
  protected readonly ObjectType: new(data: T) => O
  protected readonly connection?: Connection
  protected readonly tableName: string
  protected readonly fields: CrudField[]
  private readonly insertSql: string

  constructor (options: CrudBaseConstructorArgs) {
    this.ObjectType = options.ObjectType
    this.connection = options.connection
    const tablePrefix = CONFIG.DATABASE.PREFIX ? CONFIG.DATABASE.PREFIX + '_' : ''
    this.tableName = tablePrefix + options.tableName
    this.fields = options.fields

    this.insertSql = `INSERT INTO \`${this.tableName}\` `
    this.insertSql+= ' ( '
    ...
    this.insertSql+= ' ) '
  }

  protected async _insert (data: T): Promise<number> {
    let sql = `INSERT INTO \`${this.tableName}\` `
    return this.query({
      sql: `INSERT INTO \`${this.tablePrefix}project\`
        (name, color, createdAt, updatedAt, version)
        VALUES
        (:name, :color, NOW(), NOW(), 0)`,
      namedPlaceholders: true
    }, data)
  }

  // public abstract insert (data: T): Promise<void>
  // public abstract update (data: T): Promise<void>

  public abstract findAll (): Promise<T[]>

  public async save (data: T): Promise<void> {
    if ('id' in data && data.id) {
      return this.update(data)
    } else {
      return this.insert(data)
    }
  }

  public toObject (data: T): O
  public toObject (data: T[]): O[]
  public toObject (data: T | T[]): O | O[] {
    if (!Array.isArray(data)) {
      return new this.ObjectType(data)
    }
    return data.map(d => new this.ObjectType(d))
  }

  protected async query (sql: string | QueryOptions, values?: any): Promise<any> {
    const db = this.connection ?? await getPool()
    return db.query(sql, values)
  }
}

export {
  BaseCrud,
  CrudConnection
}
