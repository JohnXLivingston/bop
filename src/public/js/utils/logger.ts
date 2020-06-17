import * as Logger from 'js-logger'

Logger.useDefaults()
export default function getLogger (module: string) {
  return Logger.get(module)
}
