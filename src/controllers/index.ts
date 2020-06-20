import * as express from 'express'

import { authenticatedOrLogin, i18nChangeLocale } from '../middlewares'
import { apiRouter } from './api'
import { planningRouter } from './planning'

const indexRouter = express.Router()

indexRouter.get('/', (req, res) => {
  res.redirect('/index')
})

indexRouter.get('/index', i18nChangeLocale, authenticatedOrLogin, (req, res) => {
  res.render('index.njk', {
    currentPage: 'index'
  })
})

indexRouter.use('/api', apiRouter)

indexRouter.use('/planning', planningRouter)

export {
  indexRouter
}
