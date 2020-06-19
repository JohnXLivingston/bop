import * as express from 'express'

import { authenticatedOrLogin, i18nChangeLocale } from '../middlewares'
import { apiRouter } from './api'

const indexRouter = express.Router()

indexRouter.get('/', (req, res) => {
  res.redirect('/index')
})

indexRouter.get('/index', i18nChangeLocale, authenticatedOrLogin, (req, res) => {
  res.render('index.njk')
})

indexRouter.use('/api', apiRouter)

export {
  indexRouter
}
