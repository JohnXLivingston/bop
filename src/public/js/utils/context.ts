import { logger } from 'bop/shared/utils/logger'

function getContext ():Context {
  const s = $('html').attr('bop-context')
  if (!s || s === '') {
    logger.error('Cant find the context. This is unexpected.')
    throw new Error('Cant find the context. This is unexpected.')
  }
  try {
    return JSON.parse(s)
  } catch (err) {
    logger.error('Error parsing the context: ' + err)
    throw err
  }
}

export {
  getContext
}
