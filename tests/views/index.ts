/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests /* , testNunjucksTemplate */ } from '../test-utils'

import './login'
import './planning'

chai.use(require('chai-match'))
// const expect = chai.expect

describe('view/index.njk', function () {
  before(flushTests)
  after(flushTests)

  it('TODO: test backend templates')
  // it('Should render correct html', async function () {
  //   const html = await testNunjucksTemplate('index.njk', {
  //     currentPage: 'index'
  //   })

  //   expect(html, 'Template rendered content').not.to.be.equal('')
  // })
})
