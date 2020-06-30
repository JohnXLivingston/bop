import { spawn } from 'child_process'
import * as nunjucks from 'nunjucks'
import * as path from 'path'
// import { isProduction, webpackManifest, webUrl, notifierUrl } from '../../src/helpers/config'

const backendEnv = nunjucks.configure(path.join(__dirname, '../../src/views'), {
  autoescape: true
})

const frontendEnv = nunjucks.configure(path.join(__dirname, '../../src/shared/templates'), {
  autoescape: true
})

async function testNunjucksTemplate (name: string, context: any): Promise<string> {
  let env = backendEnv
  let args = ['htmlhint', 'stdin']
  const m = name.match(/(?:^|\/)shared\/templates\/(.*)$/)
  if (m) {
    name = m[1]
    env = frontendEnv
    args = ['htmlhint', '--config', '.htmlhintrc_njk', 'stdin']
  } else {
    // FIXME: backend template test is not ready yet:
    // gettext, format are missing.
    // There are probably other things that are not working.
    throw new Error('Not implemented yet.')
    // FIXME: find a way to load correct data (see res.locals in middlewares)
    // context = Object.assign({}, {
    //   webpackManifest,
    //   isProduction,
    //   gettext,
    //   format,
    //   context: {
    //     webBaseUrl: webUrl(),
    //     notifierBaseUrl: notifierUrl(),
    //     user: {
    //       id: 1
    //     }
    //   },
    //   changeLocaleInformations: [{
    //     locale: 'fr_FR',
    //     language: 'fr-FR',
    //     url: webUrl() + '_locale=' + encodeURIComponent('fr_FR') + '&'
    //   }]
    // }, context)
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
