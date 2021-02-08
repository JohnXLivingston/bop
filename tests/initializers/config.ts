/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import * as fs from 'fs'
import * as jsYaml from 'js-yaml'

import { flushTests } from '../test-utils'
import { CONFIG, checkConfig } from '../../src/helpers/config'
import { initConfig } from '../../src/initializers/config'

chai.use(require('chai-match'))
const expect = chai.expect

describe('Initializers / Config', function () {
  before(flushTests)
  after(flushTests)

  describe('initConfig', function () {
    it('Config should not be initialized before calling initConfig', function () {
      const r = checkConfig()
      expect(r.errors.length, 'There must be errors').to.be.above(0)
      expect(CONFIG.COOKIES.SESSION.SECRET, 'Session secret').to.be.equal('')
    })

    it('Should work', async function () {
      await initConfig()
      expect(CONFIG.COOKIES.SESSION.SECRET, 'Session secret').not.to.be.equal('')
      expect(CONFIG.COOKIES.SESSION.SECRET, 'Session secret').to.be.lengthOf(32)
      expect(CONFIG.COOKIES.SESSION.SECRET, 'Session secret').to.match(/^[a-zA-Z0-9]+$/)

      const content = fs.readFileSync('./config/local-test.yaml', 'utf-8').replace(/^\uFEFF/, '')
      const data = jsYaml.load(content) ?? {}
      expect(data, 'The config file should be an object').to.be.an('object')
      expect((data as any).cookies?.session?.secret, 'Session secret in config file')
        .to.be.equal(CONFIG.COOKIES.SESSION.SECRET)
    })
  })
})
