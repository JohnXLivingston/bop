import * as repl from 'repl'
import { isProduction, CONFIG, checkConfig } from '../helpers/config'
import { activateCLIMode, logger } from '../helpers/log'
import { setSharedLogger } from '../shared/utils/logger'
import * as models from '../models'
import { initDatabaseModels, sequelizeTypescript } from '../initializers'

activateCLIMode()
setSharedLogger(logger)

const start = async () => {
  const packageJson = require('./../../package.json')
  const version = packageJson.version
  const name = packageJson.name

  // NB: I will not call initConfig here, to avoid any problem.
  // So if you never launched the server, the checkConfig can fail.
  const configErrors = checkConfig()
  if (configErrors.warnings.length || configErrors.errors.length) {
    logger.error('There are some config errors. ', configErrors)
    throw new Error('Config is not ok, cant use the REPL script. Have you configured the application and launched the server at least one time?')
  }

  await initDatabaseModels()

  const initContext = (replServer: repl.REPLServer) => {
    return (context: any) => {
      const properties: any = {
        CONFIG,
        context,
        env: process.env,
        isProduction,
        logger,
        models,
        repl: replServer,
        sequelizeTypescript,
        transaction: sequelizeTypescript.transaction,
        query: sequelizeTypescript.query,
        queryInterface: sequelizeTypescript.getQueryInterface(),
        version
      }

      for (const prop in properties) {
        Object.defineProperty(context, prop, {
          configurable: false,
          enumerable: true,
          value: properties[prop]
        })
      }
    }
  }
  const replServer = repl.start({
    prompt: `${name} [${version}]> `
  })

  initContext(replServer)(replServer.context)
  replServer.on('exit', () => process.exit())
}

start().catch(err => {
  logger.error('Catching an error: ', err)
  process.exit(1)
})
