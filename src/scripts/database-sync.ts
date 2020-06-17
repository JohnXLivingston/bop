import { migrate } from '../initializers/migrator'
import { activateCLIMode, logger } from '../helpers/log'
import { setSharedLogger } from '../shared/utils/logger'

activateCLIMode()
setSharedLogger(logger)

async function go () {
  logger.info('Forcing a database update.')
  try {
    await migrate({ forceSync: true })
  } catch (err) {
    logger.error('Failed to update database with the following error: ', err)
    process.exit(1)
  }
  logger.info('Database updated.')
  process.exit(0)
}
go().catch(err => {
  logger.error('Catching an error: ', err)
  process.exit(1)
})
