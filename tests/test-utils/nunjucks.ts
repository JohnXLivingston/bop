import { spawn } from 'child_process'
import * as nunjucks from 'nunjucks'
import * as path from 'path'
import { isProduction, webpackManifest, webUrl, notifierUrl } from '../../src/helpers/config'

const backendEnv = nunjucks.configure(path.join(__dirname, '../../src/views'), {
  autoescape: true
})

const frontendEnv = nunjucks.configure(path.join(__dirname, '../../src/shared/templates'), {
  autoescape: true
})

const i18next = require('i18next')
const i18nextFsBackend = require('i18next-fs-backend')

async function testNunjucksTemplate (name: string, context: any): Promise<string> {
  let env = backendEnv
  let args = ['htmlhint', 'stdin']
  const i18n = i18next.createInstance()
  await i18n.use(i18nextFsBackend).init({
    backend: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json'
    },
    debug: false,
    defaultNS: 'common',
    fallbackLng: 'en',
    ns: 'common',
    lng: 'en', // or 'cimode'?
    saveMissing: true,
    returnNull: false,
    returnEmptyString: false,
    missingKeyHandler: (lng: string[], ns: string, key: string, fallbackValue: string) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Missing localized string: lng=${lng}, ns=${ns}, key=${key}, fallbackValue=${fallbackValue}.`)
    }
  })
  const m = name.match(/(?:^|\/)shared\/templates\/(.*)$/)
  if (m) {
    name = m[1]
    env = frontendEnv
    args = ['htmlhint', '--config', '.htmlhintrc_njk', 'stdin']

    context = Object.assign({}, {
      i18n
    }, context)
  } else {
    // FIXME: find a way to load correct data (see res.locals in middlewares)
    context = Object.assign({}, {
      webpackManifest,
      isProduction,
      i18n,
      context: {
        webBaseUrl: webUrl(),
        notifierBaseUrl: notifierUrl(),
        user: {
          id: 1
        }
      },
      changeLocaleInformations: [{
        key: 'fr_FR',
        label: 'fr-FR',
        url: webUrl() + '_language=' + encodeURIComponent('fr_FR') + '&'
      }]
    }, context)
  }
  const html = env.render(name, context)

  const hintsPromise = new Promise<string>((resolve, reject) => {
    const htmlhint = spawn('npx', args, {
      cwd: path.join(__dirname, '../..')
    })
    let output = ''
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    htmlhint.stdout.on('data', data => { output += data })
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    htmlhint.stderr.on('data', data => { output += data })
    htmlhint.on('close', (code) => {
      if (code !== 0) {
        reject(output)
      } else {
        resolve(html)
      }
    })
    htmlhint.stdin.write(html)
    htmlhint.stdin.end()
  })

  return hintsPromise
}

export {
  testNunjucksTemplate
}
