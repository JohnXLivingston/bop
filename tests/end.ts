import { describe, it } from 'mocha'
import * as chai from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import { asyncExec } from './test-utils'
import * as lodash from 'lodash'

const expect = chai.expect

describe('Tests environment', function () {
  describe('Tests files', function () {
    describe('Every backend module must have a test file', function () {
      generateMissingTests('helpers', n => !/\/register-ts-path.ts/.test(n))
      generateMissingTests('initializers')
      generateMissingTests('lib')
      generateMissingTests('models')
      generateMissingTests('views', n => { return /views\/.*\//.test(n) }) // only test first level templates.
    })

    describe('Every shared module must have a test file', function () {
      generateMissingTests('shared', n => {
        if (/^shared\/@types/.test(n)) { return true }
        if (n === 'shared/objects/base.object.ts') { return true }
        if (n === 'shared/objects/bop.object.ts') { return true }
        if (n === 'shared/objects/index.ts') { return true }
        return false
      })
    })

    it('Every front-end file must have a test file')
  })
})

// ********************************************************************
function readDir (dir: string): string[] {
  let fileNames: string[] = []
  const content = fs.readdirSync(dir, { withFileTypes: true })
  for (let i = 0; i < content.length; i++) {
    const fs = content[i]
    if (fs.isDirectory()) {
      const subdir = path.join(dir, fs.name)
      fileNames = fileNames.concat(readDir(subdir))
    } else if (fs.isFile()) {
      fileNames.push(path.join(dir, fs.name))
    }
  }
  return fileNames.sort()
}

async function searchNestedTests (dir: string): Promise<string[]> {
  const stdout = await asyncExec(
    'rgrep --no-messages -P "\\bdescribe\\(\'(\\w+/)+[\\w.]+\\.ts" ' +
    path.join('./tests', dir) +
    ' || echo ""'
  )
  let lines = stdout.split(/\n/)
  lines = lines.filter(l => /^tests\/(\w+\/)*[\w.]+\.ts:/.test(l))
  lines = lines.map(l => {
    const m = l.match(/\bdescribe\('([^']*\.ts)'/)
    if (m) {
      return m[1]
    } else {
      throw new Error('Should not be possible to have a line that dont match this regexp.')
    }
  })
  return lines
}

interface ExpectedVsReality {
  libs: string[],
  tests: string[]
}
async function expectedVsReality (dir: string): Promise<ExpectedVsReality> {
  const srcFileNames = readDir(path.join('./src', dir)).map(n => n.substr(4))
  let testsFileNames = readDir(path.join('./tests', dir)).map(n => n.substr(6))
  const nestedTestsFileNames = await searchNestedTests(dir)
  testsFileNames = testsFileNames.concat(nestedTestsFileNames).sort()
  testsFileNames = lodash.sortedUniq(testsFileNames)

  return {
    libs: srcFileNames,
    tests: testsFileNames
  }
}

async function missingTests (dir: string, ignore?: (n:string) => boolean): Promise<string[]> {
  const vs = await expectedVsReality(dir)
  if (ignore) {
    vs.libs = vs.libs.filter(n => !ignore(n))
  }
  const a = []
  for (let i = 0; i < vs.libs.length; i++) {
    let lib = vs.libs[i]

    // for nunjucks files, replace extension with ts:
    lib = lib.replace(/\.(njk|html)$/, '.ts')

    let found = false
    if (vs.tests.indexOf(lib) >= 0) {
      found = true
    }
    if (!found && lib.endsWith('/index.ts')) {
      // src/helpers/crypto/index.ts can be tested by /tests/helpers/cryto.ts
      const l = lib.replace(/\/index\.ts$/, '.ts')
      if (vs.tests.indexOf(l) >= 0) {
        found = true
      }
    }
    if (!found) {
      a.push(lib)
    }
  }
  return a
}

function generateMissingTests (dir: string, ignore?: (n:string) => boolean) {
  it('Every ' + dir + ' must have a test file', async function () {
    const missings = await missingTests(dir, ignore)
    expect(missings, 'Missing tests').to.be.deep.equal([])
  })
}
