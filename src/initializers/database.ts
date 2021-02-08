import { Sequelize as SequelizeTypescript } from 'sequelize-typescript'
import { Transaction } from 'sequelize'
import { CONFIG, isProduction, isTest } from '../helpers/config'
import { logger } from '../helpers/log'
import {
  ApplicationModel,
  ProjectModel,
  TaskModel,
  TaskAllocationModel,
  TaskPartModel,
  UserModel,
  ResourceModel
} from '../models'

// Please update this version on each new migration file.
const LAST_MIGRATION_VERSION = 1

const benchmark = !isProduction

if (
  !CONFIG.DATABASE.TYPE || !CONFIG.DATABASE.DBNAME ||
  !CONFIG.DATABASE.HOSTNAME || !CONFIG.DATABASE.PORT ||
  !CONFIG.DATABASE.USERNAME || !CONFIG.DATABASE.PASSWORD
) {
  throw new Error('Missing database settings.')
}
const sequelizeTypescript = new SequelizeTypescript({
  dialect: CONFIG.DATABASE.TYPE,
  database: CONFIG.DATABASE.DBNAME,
  host: CONFIG.DATABASE.HOSTNAME,
  port: CONFIG.DATABASE.PORT,
  username: CONFIG.DATABASE.USERNAME,
  password: CONFIG.DATABASE.PASSWORD,
  pool: {
    max: CONFIG.DATABASE.POOL.MAX
  },
  isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB'
  },
  benchmark,
  logging: (message: string, ms?: number) => {
    if (!CONFIG.DATABASE.LOG) { return }
    let newMessage = message
    if (benchmark && ms !== undefined) {
      newMessage += ' | ' + ms.toString() + 'ms'
    }
    logger.debug(newMessage)
  }
})

let alreadyInitialized = false
async function initDatabaseModels (): Promise<void> {
  if (alreadyInitialized && !isTest) {
    throw new Error('Calling twice initDatabaseModels. Should not happend.')
  }
  alreadyInitialized = true
  sequelizeTypescript.addModels([
    ApplicationModel,
    ProjectModel,
    TaskModel,
    TaskAllocationModel,
    TaskPartModel,
    UserModel,
    ResourceModel
  ])
  logger.info('Database %s is ready.', CONFIG.DATABASE.DBNAME)
}

export {
  initDatabaseModels,
  LAST_MIGRATION_VERSION,
  sequelizeTypescript
}
