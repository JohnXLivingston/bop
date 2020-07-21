import getLogger from '../utils/logger'
import { BopWheelmenuContentOptions, bopWheelmenuContentDefaultOptions } from './wheelmenu/content'

require('../../scss/widgets/wheelmenu.scss')

const logger = getLogger('widget/wheelmenu')

declare global {
  interface JQuery {
    bopWheelmenu(): JQuery
    bopWheelmenu(options: BopWheelmenuOptions): JQuery
  }
}

interface BopWheelmenuOptions extends BopWheelmenuContentOptions {
  onClick: boolean,
  onContextMenu: boolean
}

const bopWheelmenuDefaultOptions: BopWheelmenuOptions = Object.assign({}, bopWheelmenuContentDefaultOptions, {
  onClick: true,
  onContextMenu: true
})

$.widget('bop.bopWheelmenu', {
  options: bopWheelmenuDefaultOptions,
  _create: function () {
    const handler = (ev: JQuery.Event) => {
      ev.preventDefault()
      const centerX = ev.pageX || 0
      const centerY = ev.pageY || 0
      this.open(centerX, centerY)
    }
    if (this.options.onClick) {
      this._on({
        click: handler
      })
    }
    if (this.options.onContextMenu) {
      this._on({
        contextmenu: handler
      })
    }
  },
  open: function (x: number, y: number) {
    const widget = $(this.element)
    logger.debug('Calling the wheelmenu handler...')

    const items: string[] = widget.bopDataArray('data-widget-wheelmenu-items')
    if (!items.length) {
      logger.debug('There are no item.')
      return
    }

    const content = $('<div class="widget-wheelmenu-content" tabindex="-1"></div>')
    for (let i = 0; i < items.length; i++) {
      const item = $(items[i])
      content.append(item)
    }

    logger.debug(`The center of the wheelmenu is (${x}, ${y}).`)
    content.css('left', x + 'px')
    content.css('top', y + 'px')

    content.bopWheelmenuContent(this.options)
  }
})

export {}
