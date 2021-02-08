import * as Logger from 'js-logger'

Logger.useDefaults()
export default function getLogger (module: string): Logger.ILogger {
  return Logger.get(module)
}
