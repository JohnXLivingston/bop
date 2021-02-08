import { resolve } from 'path'
import tsConfigPaths = require('tsconfig-paths')

const requireJSON5 = require('require-json5')
const tsConfig = requireJSON5('/home/john/dev/bop/tsconfig.json')

function registerTSPaths (): void {
  // Thanks: https://github.com/dividab/tsconfig-paths/issues/75#issuecomment-458936883
  //  But we ignore baseUrl.
  tsConfigPaths.register({
    baseUrl: resolve(tsConfig.compilerOptions.outDir || '.'),
    paths: tsConfig.compilerOptions.paths
  })
}

export {
  registerTSPaths
}
