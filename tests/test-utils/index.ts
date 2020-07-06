import { exec } from 'child_process'
// import { initDatabaseModels } from '../../src/initializers/database'
import { migrate } from '../../src/initializers/migrator'

export { testNunjucksTemplate } from './nunjucks'

const DBNAME = 'bop_test'
const DBUSER = 'bop_test'
const DBPASSWORD = 'bop'
const REDISPREFIX = 'bop_test-'

if (process.env.NODE_ENV !== 'test') {
  throw new Error('We are not in test env.')
}

function asyncExec (command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err || stderr) return reject(err || new Error(stderr))
      return resolve(stdout)
    })
  })
}

async function recreateDB (): Promise<void> {
  await asyncExec(`mysql -u${DBUSER} -p${DBPASSWORD} -e "drop database ${DBNAME};"`)
  await asyncExec(`mysql -u${DBUSER} -p${DBPASSWORD} -e "create database ${DBNAME};"`)
}

async function removeFiles () {
  await asyncExec('rm -f ./config/local-test.yaml ./tests/logs/*')
}

async function dropRedis () {
  await asyncExec(`redis-cli -h "localhost" KEYS "${REDISPREFIX}*" | grep -v empty | xargs --no-run-if-empty redis-cli -h "localhost" DEL`)
}

async function flushTests () {
  // TODO : reload CONFIG
  await Promise.all([
    recreateDB(),
    removeFiles(),
    dropRedis()
  ])
}

async function flushTestsAndInitDB () {
  await flushTests()
  // await initDatabaseModels()
  await migrate()
}

export {
  asyncExec,
  flushTests,
  flushTestsAndInitDB
}
