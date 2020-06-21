import * as express from 'express'
import { authenticatedOrLogin, i18nChangeLocale } from '../../middlewares'

const planningRouter = express.Router()

planningRouter.get('', i18nChangeLocale, authenticatedOrLogin, (req, res) => {
  const nodes: any[] = []
  nodes.push({
    name: 'Resource 1',
    data: [
      { left: 0, width: 90, label: '10 h/j', color: 'red' },
      { left: 135, width: 45, label: '8 h/j', color: 'green' }
    ],
    childs: [
      {
        name: 'Sub resource 1.a',
        childs: [{
          name: 'Sub sub resource 1.a.1'
        }]
      }
    ]
  })
  for (let i = 2; i <= 99; i++) {
    nodes.push({
      name: 'Resource ' + i
    })
  }
  res.render('planning.njk', {
    currentPage: 'planning',
    nodes: nodes,
    planningProperties: {
      nbWeeks: 9
    }
  })
})

export {
  planningRouter
}
