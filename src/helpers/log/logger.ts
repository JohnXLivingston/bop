import { CONFIG } from 'bop/helpers/config/config'
import { isNotifier } from 'bop/helpers/config/env'
import { omit } from 'lodash'
import * as winston from 'winston'
import { Syslog } from 'winston-syslog'
import * as httpContext from 'express-http-context'

// On a 64-bit system, max pid is 4194304 (7chars)
const pid = ('0000000' + process.pid.toString()).slice(-7)
const label = isNotifier
  ? CONFIG.NOTIFIER.HOSTNAME + ':' + CONFIG.NOTIFIER.PORT.toString() + '.' + pid
  : CONFIG.SERVER.HOSTNAME + ':' + CONFIG.SERVER.PORT.toString() + '.' + pid
const customFormater = winston.format((info: any) => {
  const reqId = httpContext.get('reqId')
  info.label = label
  info.reqId = reqId || '-'
  return info
})
const timestampFormatter = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS'
})
const consoleLoggerFormat = winston.format.printf(info => {
  const obj = omit(info, 'label', 'timestamp', 'level', 'message', 'reqId')

  let additionalInfos = JSON.stringify(obj, null, 2)

  if (additionalInfos === undefined || additionalInfos === '{}') additionalInfos = ''
  else additionalInfos = ' ' + additionalInfos

  const reqId = info.reqId ? info.reqId : '???'

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `[${info.label}][${reqId}] ${info.timestamp} ${info.level}: ${info.message}${additionalInfos}`
})

const logger = winston.createLogger({
  level: CONFIG.LOG.LEVEL,
  exitOnError: true,
  format: winston.format.combine(
    customFormater(),
    winston.format.splat()
  ),
  transports: []
})

let consoleTransport: winston.transports.ConsoleTransportInstance | undefined
if (CONFIG.LOG.CONSOLE.ENABLED) {
  consoleTransport = new winston.transports.Console({
    handleExceptions: true,
    format: winston.format.combine(
      timestampFormatter,
      winston.format.colorize(),
      consoleLoggerFormat
    )
  })
  logger.add(consoleTransport)
}

if (CONFIG.LOG.SYSLOG.ENABLED) {
  logger.add(new Syslog({
    host: CONFIG.LOG.SYSLOG.HOST,
    port: CONFIG.LOG.SYSLOG.PORT,
    protocol: CONFIG.LOG.SYSLOG.PROTOCOL,
    path: CONFIG.LOG.SYSLOG.PATH,
    localhost: CONFIG.LOG.SYSLOG.LOCALHOST,
    type: CONFIG.LOG.SYSLOG.TYPE,

    app_name: label,

    handleExceptions: true,
    format: winston.format.combine(
      timestampFormatter,
      winston.format.json()
    )
  }))
}

if (CONFIG.LOG.FILE.ENABLED) {
  logger.add(new winston.transports.File({
    filename: CONFIG.LOG.FILE.PATH,
    format: winston.format.combine(
      timestampFormatter,
      winston.format.colorize(),
      consoleLoggerFormat
    )
  }))
}

/**
 * When we are on a CLI script, we want to be able to activate console output and change level option.
 */
function activateCLIMode (): void {
  if (consoleTransport) {
    consoleTransport.level = 'debug'
  } else {
    consoleTransport = new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
        timestampFormatter,
        winston.format.colorize(),
        consoleLoggerFormat
      )
    })
    logger.add(consoleTransport)
  }
}

// FIXME: Not sure if we have to flush logs before exiting process.

export {
  logger,
  activateCLIMode
}
