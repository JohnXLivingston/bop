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

async function testNunjucksTemplate (name: string, context: any): Promise<string> {
  let env = backendEnv
  let args = ['htmlhint', 'stdin']
  const i18n = i18next.createInstance()
  await i18n.init({
    debug: false,
    defaultNS: 'common',
    lng: 'cimode'
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
        locale: 'fr_FR',
        language: 'fr-FR',
        url: webUrl() + '_locale=' + encodeURIComponent('fr_FR') + '&'
      }]
    }, context)
  }
  const html = env.render(name, context)

  const hintsPromise = new Promise<string>((resolve, reject) => {
    const htmlhint = spawn('npx', args, {
      cwd: path.join(__dirname, '../..')
    })
    let output = ''
    htmlhint.stdout.on('data', data => { output += data })
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
