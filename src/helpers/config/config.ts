import * as config from 'config'
import { isProduction } from './env'
import { join, dirname } from 'path'
import * as lockfile from 'proper-lockfile'
import * as fs from 'fs'
import * as jsYaml from 'js-yaml'
import { Dialect as SequelizeDialect } from 'sequelize'
// FIXME: we cant use ../log/logger here
// (otherwise we will have a circular reference).

const isInvalidPath = require('is-invalid-path')

// TODO: when config change, call some callbacks.
// Don't forget to change log level in logger.ts

function get<T> (name: string, defaultValue: T): T {
  if (config.has(name)) {
    return config.get<T>(name)
  }
  return defaultValue
}

const CONFIG = {
  CLUSTER: {
    WORKERS: get<number>('cluster.workers', 0)
  },
  COOKIES: {
    PREFIX: get<string>('cookies.prefix', ''),
    SESSION: {
      SECRET: get<string>('cookies.session.secret', '')
    }
  },
  DATABASE: {
    TYPE: get<SequelizeDialect | null>('database.type', null), // sequelize deprecated
    HOSTNAME: get<string | null>('database.hostname', null),
    PORT: get<number>('database.PORT', 3306),
    DBNAME: get<string | null>('database.dbname', null),
    USERNAME: get<string | null>('database.username', null),
    PASSWORD: get<string | null>('database.password', null),
    LOG: get<boolean>('database.log', false), // sequelize deprecated
    PREFIX: get<string | null>('database.prefix', null),
    POOL: {
      MAX: get<number>('database.pool.max', 5),
      LEAKTIMEOUT: get<number>('database.pool.leaktimeout', 0)
    }
  },
  LOG: {
    LEVEL: get<string>('log.level', 'info'),
    CONSOLE: {
      ENABLED: get<boolean>('log.console.enabled', false)
    },
    SYSLOG: {
      ENABLED: get<boolean>('log.syslog.enabled', false),
      HOST: get<string | undefined>('log.syslog.host', undefined),
      PORT: get<number | undefined>('log.syslog.port', undefined),
      PROTOCOL: get<string | undefined>('log.syslog.protocol', undefined),
      PATH: get<string | undefined>('log.syslog.path', undefined),
      LOCALHOST: get<string | undefined>('log.syslog.localhost', undefined),
      TYPE: get<string | undefined>('log.syslog.type', undefined)
    },
    FILE: {
      ENABLED: get<boolean>('log.file.enabled', false),
      PATH: get<string | undefined>('log.file.path', undefined)
    }
  },
  REDIS: {
    HOSTNAME: get<string | null>('redis.hostname', null),
    PORT: get<number | null>('redis.port', null),
    AUTH: get<string | null>('redis.auth', null),
    DB: get<number | null>('redis.db', null),
    PREFIX: get<string>('redis.prefix', '')
  },
  SERVER: {
    HOSTNAME: config.get<string>('server.hostname'),
    PORT: config.get<number>('server.port'),
    HTTPS: get<boolean>('server.https', false)
  },
  NOTIFIER: {
    HOSTNAME: config.get<string>('notifier.hostname'),
    PORT: config.get<number>('notifier.port'),
    HTTPS: get<boolean>('notifier.https', false)
  }
}

interface ConfigErrors {
  warnings: string[]
  errors: string[]
}
/**
 * Check configuration.
 */
function checkConfig (): ConfigErrors {
  const configErrors: ConfigErrors = { errors: [], warnings: [] }
  _checkMissingConfig(configErrors)
  _checkCustomConfig(configErrors)
  _cleanValues()
  return configErrors
}

enum SpecificConstraintType { Enum = 'enum', Filepath = 'filepath' }
interface SpecificConstraintWithValues {
  type: SpecificConstraintType.Enum
  values: string[] /* FIXME: this is not correct.
                      We will wait for other constraints than Enum
                      for implementing better. */
}
interface SpecificConstraintWithoutValues {
  type: SpecificConstraintType.Filepath
}
type SpecificConstraint =
  SpecificConstraintWithValues | SpecificConstraintWithoutValues
type Constraint = SpecificConstraint | boolean
interface Required {[key: string]: Required | Constraint}
function _recursiveConstraintCheck (configErrors: ConfigErrors, stack: string, c: any, r: boolean): void
function _recursiveConstraintCheck (configErrors: ConfigErrors, stack: string, c: any, r: Required): void
function _recursiveConstraintCheck (configErrors: ConfigErrors, stack: string, c: any, r: any): void {
  for (const key in r) {
    if (r[key] && !c[key]) {
      configErrors.errors.push(`Missing config key ${stack}.${key}.`)
      return
    }
    if (typeof r[key] !== 'object') {
      // it must be a boolean. Terminating recursion.
      return
    } else if ('type' in r[key]) {
      // Special constraint.
      const ctype = r[key].type
      if (ctype === SpecificConstraintType.Enum) {
        if (r[key].values.indexOf(c[key]) < 0) {
          configErrors.errors.push(
            `Value for ${stack}.${key} is incorrect. ` +
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `'${c[key]}' is not in [${r[key].values.join(', ')}]`
          )
        }
      }
      if (ctype === SpecificConstraintType.Filepath) {
        if (isInvalidPath(c[key])) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          configErrors.errors.push(`Value for ${stack}.${key} is incorrect. '${c[key]}' is not a valid path`)
        }
      }
      // Terminating recursion.
      return
    } else {
      _recursiveConstraintCheck(configErrors, (stack !== '' ? stack + '.' : '') + key, c[key], r[key])
    }
  }
}

function _checkMissingConfig (configErrors: ConfigErrors): void {
  const required: Required = {
    CLUSTER: {
      WORKERS: true
    },
    COOKIES: {
      SESSION: {
        SECRET: true
      }
    },
    DATABASE: {
      TYPE: { type: SpecificConstraintType.Enum, values: ['mysql', 'mariadb'] },
      HOSTNAME: true,
      PORT: true,
      DBNAME: true,
      USERNAME: true,
      PASSWORD: true,
      POOL: {
        MAX: true
      }
    },
    LOG: {
      LEVEL: { type: SpecificConstraintType.Enum, values: ['error', 'warn', 'info', 'debug'] }
    },
    REDIS: {
      HOSTNAME: true,
      PORT: true,
      PREFIX: true
    },
    SERVER: {
      HOSTNAME: true,
      PORT: true
    },
    NOTIFIER: {
      HOSTNAME: true,
      PORT: true
    }
  }

  _recursiveConstraintCheck(configErrors, '', CONFIG, required)
}

function _checkCustomConfig (configErrors: ConfigErrors): void {
  // Some manual verifications:
  // - In production mode, server.https should be active.
  if (isProduction && !CONFIG.SERVER.HTTPS) {
    // TODO
  }
  if (isProduction && !CONFIG.NOTIFIER.HTTPS) {
    // TODO
  }
  // - Must be at least one logging type.
  if (!(CONFIG.LOG.CONSOLE.ENABLED || CONFIG.LOG.SYSLOG.ENABLED || CONFIG.LOG.FILE)) {
    // TODO: implement other logging types
    configErrors.errors.push('There must be at least one logging system enabled.')
  }
  // - CONFIG.LOG.SYSLOG must be correct
  if (CONFIG.LOG.SYSLOG.ENABLED) {
    _recursiveConstraintCheck(configErrors, '', CONFIG, {
      LOG: {
        SYSLOG: {
          HOST: true,
          PROTOCOL: true
        }
      }
    })
    // FIXME: must be some more checks to do.
    // For example, I think protocol=unix => path mandatory.
  }
  if (CONFIG.LOG.FILE.ENABLED) {
    _recursiveConstraintCheck(configErrors, '', CONFIG, {
      LOG: {
        FILE: {
          PATH: { type: SpecificConstraintType.Filepath }
        }
      }
    })
  }
}

/**
 * Clean certain CONFIG values.
 */
function _cleanValues (): void {
  if (CONFIG.COOKIES.PREFIX == null) { CONFIG.COOKIES.PREFIX = '' }
  if (CONFIG.COOKIES.PREFIX !== '' && CONFIG.COOKIES.PREFIX.substr(-1) !== '-') {
    CONFIG.COOKIES.PREFIX += '.'
  }

  if (CONFIG.REDIS.PREFIX == null) { CONFIG.REDIS.PREFIX = '' }
  if (CONFIG.REDIS.PREFIX !== '' && CONFIG.REDIS.PREFIX.substr(-1) !== '-') {
    CONFIG.REDIS.PREFIX += '-'
  }
}

/**
 * Returns the 'local' file path. This is were we can write config overloads.
 */
function getLocalConfigFilePath (): string {
  const configSources = config.util.getConfigSources()
  if (configSources.length === 0) throw new Error('Invalid config source.')

  let filename = 'local'
  if (process.env.NODE_ENV) filename += `-${process.env.NODE_ENV}`
  if (process.env.NODE_APP_INSTANCE) filename += `-${process.env.NODE_APP_INSTANCE}`

  return join(dirname(configSources[0].name), filename + '.yaml')
}

type ConfigKeyValue = string | number | boolean | null
async function updateConfigKey (updates: {[key: string]: ConfigKeyValue}): Promise<void>
async function updateConfigKey (key: string, value: ConfigKeyValue): Promise<void>
async function updateConfigKey (): Promise<void> {
  let updates: {[key: string]: ConfigKeyValue}
  if (arguments.length === 1) {
    updates = arguments[0]
  } else {
    updates = {}
    updates[arguments[0]] = arguments[1]
  }
  // FIXME: should we test something with checkConfig?

  const file = getLocalConfigFilePath()
  // FIXME: how can we log?
  //        console.debug('Calling updateConfigKey with keys "%s", will write it to file "%s".', keys.join(', '), file)
  // We will use the presence of a local-xxx.json.lock file
  // to ensure there is no 2 processes writing at the same time.
  const releaseLock = await lockfile.lock(file, {
    realpath: false, // must be set to false, otherwise lock fails if the file don't exist.
    retries: 5
  })
  let content
  try {
    content = fs.readFileSync(file, 'utf-8')
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      content = ''
    } else {
      throw err
    }
  }
  content = content.replace(/^\uFEFF/, '')
  const data = jsYaml.load(content) ?? {}
  if (typeof data !== 'object') {
    throw Error('The content is not a valid Yaml config file.')
  }

  for (const key in updates) {
    _injectConfig(data as {[key: string]: any}, key.split('.'), updates[key])
  }
  const yaml = jsYaml.dump(data, {
    styles: {
      '!!null': 'canonical', // dump null as ~
      '!!int': 'decimal',
      '!!bool': 'lowercase',
      '!!float': 'lowercase'
    },
    sortKeys: true
  })

  fs.writeFileSync(file, yaml, 'utf-8')

  // FIXME: find a way to properly reload CONFIG.
  await releaseLock()
}

function _injectConfig (d: {[key: string]: any}, keys: string[], value: ConfigKeyValue): void {
  if (!d) {
    throw new Error('Did not expect to have something falsey here.')
  }
  if (!keys.length) {
    throw new Error('You cant call this function without any keys.')
  }
  if (keys.length === 1) {
    d[keys[0]] = value
    return
  }
  const k = keys.shift()
  if (k === undefined) {
    throw new Error('Did not expect to have something undefined here.')
  }
  if (!(k in d)) {
    d[k] = {}
  }
  _injectConfig(d[k], keys, value)
}

/**
 * computes the complete front-end base url.
 */
function webUrl (): string {
  let url = CONFIG.SERVER.HTTPS ? 'https://' : 'http://'
  url += CONFIG.SERVER.HOSTNAME
  if (CONFIG.SERVER.PORT !== (CONFIG.SERVER.HTTPS ? 443 : 80)) {
    url += ':' + CONFIG.SERVER.PORT.toString()
  }
  return url
}

/**
 * computes the complete front-end notifier base url.
 */
function notifierUrl (): string {
  let url = CONFIG.NOTIFIER.HTTPS ? 'https://' : 'http://'
  url += CONFIG.NOTIFIER.HOSTNAME
  if (CONFIG.NOTIFIER.PORT !== (CONFIG.NOTIFIER.HTTPS ? 443 : 80)) {
    url += ':' + CONFIG.NOTIFIER.PORT.toString()
  }
  return url
}

export {
  CONFIG,
  checkConfig,
  updateConfigKey,
  webUrl,
  notifierUrl
}
