import { describe, it } from 'mocha'
import * as chai from 'chai'

const expect = chai.expect

describe('Tests environment', function () {
  it('Should consider true equal true', async function () {
    expect(true).to.equal(true)
  })

  it('NODE_ENV should be "test"', function () {
    expect(process.env.NODE_ENV).to.equal('test')
  })
})
