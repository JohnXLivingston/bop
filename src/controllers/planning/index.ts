import * as express from 'express'
import { authenticatedOrLogin, i18nChangeLocale } from '../../middlewares'

const planningRouter = express.Router()

planningRouter.get('', i18nChangeLocale, authenticatedOrLogin, (req, res) => {
  res.render('planning.njk', {
    currentPage: 'planning'
  })
})

export {
  planningRouter
}
