interface Logger {
  debug: (s: string) => any
  info: (s: string) => any
  error: (s: string) => any
}

let logger: Logger = console

function setSharedLogger (l: Logger): void {
  logger = l
  logger.debug('There is a new shared logger.')
}

export {
  logger,
  setSharedLogger
}
