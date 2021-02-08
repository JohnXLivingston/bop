/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import * as fs from 'fs'
import * as jsYaml from 'js-yaml'

import { flushTests } from '../test-utils'
import {
  isProduction,
  isTest,
  checkConfig,
  updateConfigKey,
  CONFIG,
  webUrl,
  notifierUrl
} from '../../src/helpers/config'

const expect = chai.expect

describe('helpers/config', function () {
  before(flushTests)
  after(flushTests)

  describe('helpers/config/env.ts', function () {
    it('isProduction should be false', function () {
      expect(isProduction).to.be.false
    })

    it('isTest should be true', function () {
      expect(isTest).to.be.true
    })
  })

  describe('helpers/config/constants.ts', function () {
    it('TODO: test constants')
  })

  describe('helpers/config/config.ts', function () {
    it('There shound not be any config/local-test* file before calling initConfig', function () {
      const files = fs.readdirSync('./config').filter(fn => fn.startsWith('local-test'))
      expect(files, 'Array').to.be.an('array')
      expect(files, 'Empty').to.be.empty
    })

    describe('checkConfig', function () {
      it('Should not be ok before calling initConfig', function () {
        const r = checkConfig()
        expect(r, 'Object and structure').to.be.an('object').to.have.all.keys('warnings', 'errors')
        expect(r.warnings, 'No warning').to.be.an('array').lengthOf(0)
        expect(r.errors, '1 error').to.be.an('array').lengthOf(1)
        expect(r.errors, 'Missing cookies session secret').to.have.members([
          'Missing config key COOKIES.SESSION.SECRET.'
        ])
      })

      it('Should be valid if we fake invalid keys', function () {
        const v = CONFIG.COOKIES.SESSION.SECRET
        CONFIG.COOKIES.SESSION.SECRET = 'abcd'
        const r = checkConfig()
        expect(r).to.be.deep.equal({ warnings: [], errors: [] })
        // Restore...
        CONFIG.COOKIES.SESSION.SECRET = v
      })

      it('Should fail with missing key', function () {
        const v = CONFIG.DATABASE.TYPE
        CONFIG.DATABASE.TYPE = null
        const r = checkConfig()
        expect(r.errors).to.be.an('array').to.include('Missing config key DATABASE.TYPE.')
        // Restore...
        CONFIG.DATABASE.TYPE = v
      })

      it('Should fail with invalid enum value', function () {
        const v = CONFIG.DATABASE.TYPE
        CONFIG.DATABASE.TYPE = 'postgres'
        const r = checkConfig()
        expect(r.errors).to.be.an('array').to.include(
          'Value for DATABASE.TYPE is incorrect. \'postgres\' is not in [mysql, mariadb]'
        )
        // Restore...
        CONFIG.DATABASE.TYPE = v
      })

      it('Should fail with invalid filepath value', function () {
        const v = CONFIG.LOG.FILE.PATH
        CONFIG.LOG.FILE.PATH = 'x*!x'
        const r = checkConfig()
        expect(r.errors).to.be.an('array').to.include(
          'Value for LOG.FILE.PATH is incorrect. \'x*!x\' is not a valid path'
        )
        // Restore...
        CONFIG.LOG.FILE.PATH = v
      })
    })

    describe('updateConfigKey', function () {
      it('updateConfigKey should create the local-test.yaml file', async function () {
        await updateConfigKey('test.update', 'test_value')
        const files = fs.readdirSync('./config').filter(fn => fn.startsWith('local-test'))
        expect(files, 'Array').to.be.an('array')
        expect(files, '1 file').to.lengthOf(1)
        expect(files, 'Yaml file').to.have.members(['local-test.yaml'])
      })

      it('Should be able to make multiple updates, event concurrently', async function () {
        this.timeout(5000)
        await Promise.all([
          updateConfigKey('test.update', 'test_value_modified'),
          updateConfigKey({
            'test.other': 'other_value',
            'test.number': 12,
            'test.bool.true': true,
            'another.config.branch.null': null
          }),
          updateConfigKey('test.bool.false', false)
        ])
        await updateConfigKey('test.float', 12.42656)
      })

      it('The file should have the proper content', function () {
        const content = fs.readFileSync('./config/local-test.yaml', 'utf-8').replace(/^\uFEFF/, '')
        const data = jsYaml.load(content) ?? {}
        expect(data).to.be.an('object').deep.equal({
          test: {
            update: 'test_value_modified',
            other: 'other_value',
            number: 12,
            bool: {
              true: true,
              false: false
            },
            float: 12.42656
          },
          another: {
            config: {
              branch: {
                null: null
              }
            }
          }
        })
      })
    })

    describe('webUrl', function () {
      it('should return http://localhost::12340', function () {
        expect(webUrl()).to.be.a('string').to.be.equal('http://localhost:12340')
      })
      it('should handle https correctly', function () {
        CONFIG.SERVER.HTTPS = true
        expect(webUrl()).to.be.a('string').to.be.equal('https://localhost:12340')
        CONFIG.SERVER.HTTPS = false
      })
      it('should handle port correctly', function () {
        CONFIG.SERVER.PORT = 80
        expect(webUrl(), 'Dont display port 80').to.be.a('string').to.be.equal('http://localhost')
        CONFIG.SERVER.PORT = 4242
        expect(webUrl(), 'Random port').to.be.a('string').to.be.equal('http://localhost:4242')
        CONFIG.SERVER.PORT = 12340

        CONFIG.SERVER.HTTPS = true
        expect(webUrl(), 'Https').to.be.a('string').to.be.equal('https://localhost:12340')
        CONFIG.SERVER.PORT = 443
        expect(webUrl(), 'Dont display port 443').to.be.a('string').to.be.equal('https://localhost')
        CONFIG.SERVER.HTTPS = false
        CONFIG.SERVER.PORT = 12340
      })
    })

    describe('notifierUrl', function () {
      it('should return http://localhost::12341', function () {
        expect(notifierUrl()).to.be.a('string').to.be.equal('http://localhost:12341')
      })
      it('should handle https correctly', function () {
        CONFIG.NOTIFIER.HTTPS = true
        expect(notifierUrl()).to.be.a('string').to.be.equal('https://localhost:12341')
        CONFIG.NOTIFIER.HTTPS = false
      })
      it('should handle port correctly', function () {
        CONFIG.NOTIFIER.PORT = 80
        expect(notifierUrl(), 'Dont display port 80').to.be.a('string').to.be.equal('http://localhost')
        CONFIG.NOTIFIER.PORT = 4242
        expect(notifierUrl(), 'Random port').to.be.a('string').to.be.equal('http://localhost:4242')
        CONFIG.NOTIFIER.PORT = 12341

        CONFIG.NOTIFIER.HTTPS = true
        expect(notifierUrl(), 'Https').to.be.a('string').to.be.equal('https://localhost:12341')
        CONFIG.NOTIFIER.PORT = 443
        expect(notifierUrl(), 'Dont display port 443').to.be.a('string').to.be.equal('https://localhost')
        CONFIG.NOTIFIER.HTTPS = false
        CONFIG.NOTIFIER.PORT = 12341
      })
    })
  })

  describe('helpers/config/webpack.ts', function () {
    // Nothing to test here for the moment
  })
})
