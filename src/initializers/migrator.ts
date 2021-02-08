import { QueryTypes } from 'sequelize'
import { initDatabaseModels, sequelizeTypescript, LAST_MIGRATION_VERSION } from './database'
import { CONFIG, isProduction } from '../helpers/config'
import { generateRandomPassword } from '../helpers/crypto'
import { logger } from '../helpers/log'
import { ApplicationModel, UserModel } from '../models'

async function migrate (options?: { forceSync?: boolean }): Promise<void> {
  await _migrateDatabase(options?.forceSync)
  await _seeds()
}

async function _migrateDatabase (forceSync?: boolean): Promise<void> {
  const tables = await sequelizeTypescript.getQueryInterface().showAllTables()

  // No tables, we don't need to migrate anything
  // The installer will do that
  if (tables.length === 0) {
    logger.info('There is no tables in models. We are going to do the first installation.')
    await initDatabaseModels()
    logger.info('Syncing...')
    await sequelizeTypescript.sync()
    logger.info('Database as been created.')
    if (!await ApplicationModel.countTotal()) {
      logger.info('Creating the application entry.')
      await ApplicationModel.create({
        migrationVersion: LAST_MIGRATION_VERSION
      })
    }
    return
  }

  // We cannot use ApplicationModel for now, we havent called initDatabaseModels yet.
  logger.debug('Checking application version...')
  if (CONFIG.DATABASE.TYPE !== 'mariadb' && CONFIG.DATABASE.TYPE !== 'mysql') {
    throw new Error('The migrator is not compatible with this type of database.')
  }
  const query = 'SELECT migrationVersion FROM application'
  const options = {
    type: QueryTypes.SELECT as QueryTypes.SELECT
  }
  const rows = await sequelizeTypescript.query<{ migrationVersion: number }>(query, options)
  const currentVersion: number | null = rows?.[0]?.migrationVersion
  if (currentVersion === null) {
    throw new Error(
      'Database contains some tables, but no application. This is unexpected, please check the database manually.'
    )
  }

  await initDatabaseModels() // Needed for _seeds and .sync().
  // FIXME: this function begins to be messy. Find a better way to install/migrate.
  if (currentVersion === LAST_MIGRATION_VERSION) {
    logger.debug('Current version is ok.')
    if (forceSync) {
      logger.info('The caller requested a forced database sync...')
      logger.info('Syncing...')
      // FIXME: use a transaction?
      await sequelizeTypescript.sync()
      logger.info('Database Sync done.')
    }
    return
  }
  if (currentVersion > LAST_MIGRATION_VERSION) {
    throw new Error('Database downgrade: Not Implemented Yet.')
  }

  throw new Error('Database upgrade: Not Implemented Yet.')
}

async function _seeds (): Promise<void> {
  logger.debug('Adding database seeds...')
  if (!await UserModel.countTotal()) {
    logger.info('No user in database. Creating the first user...')
    let password: string
    if (isProduction) {
      password = await generateRandomPassword()
      logger.info('The admin user password will be "%s". Please change it after login.', password)
    } else {
      password = 'password'
    }
    const data = {
      login: 'admin',
      password,
      username: 'Administrator'
    }
    const user = new UserModel(data)

    await user.save()
  }
}

export {
  migrate
}
