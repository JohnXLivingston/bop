/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'
import { flushTests /* , testNunjucksTemplate */ } from '../test-utils'

chai.use(require('chai-match'))
// const expect = chai.expect

describe('view/login.html', function () {
  before(flushTests)
  after(flushTests)

  it('TODO: test backend templates')

  // it('Should render correct html', async function () {
  //   const html = await testNunjucksTemplate('login.html', {
  //     login: 'test',
  //     loginFailed: true
  //   })

  //   expect(html, 'Template rendered content').not.to.be.equal('')
  // })
})
