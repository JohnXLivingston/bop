import * as express from 'express'
import { authenticatedOrLogin, i18nChangeLocale } from '../../middlewares'

const planningRouter = express.Router()

planningRouter.get('', i18nChangeLocale, authenticatedOrLogin, (req, res) => {
  const nodes: any[] = []
  nodes.push({
    name: 'Resource 1',
    type: 'summary',
    data: [
      { left: 0, width: 90, label: '10 h/j', color: 'red' },
      { left: 135, width: 45, label: '8 h/j', color: 'green' }
    ],
    childs: [
      {
        name: 'Sub resource 1.a',
        type: 'task',
        color: '#79c5ee',
        stubGroups: [
          {
            left: 45,
            width: 180,
            label: '8h/j',
            previousEnd: -45,
            stubs: [] // not required for the POC.
          }
        ],
        childs: [{
          name: 'Sub sub resource 1.a.1',
          type: 'task',
          color: '#79c5ee',
          stubGroups: [
            {
              left: 315,
              width: 45,
              label: '8h/j',
              stubs: [],
              nextStart: 450,
              previousEnd: null
            },
            {
              left: 450,
              width: 540,
              label: '8h/j',
              previousEnd: 360 + 45,
              stubs: [
                {
                  // FIXME for the POC: align with a weekend.
                  on: false,
                  left: 450 + (2 * 45),
                  width: 90
                },
                {
                  // FIXME: this is here only for the POC to work.
                },
                {
                  on: false,
                  left: 450 + (2 * 45) + (45 * 7),
                  width: 90
                },
                {}
              ]
            }
          ]
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
