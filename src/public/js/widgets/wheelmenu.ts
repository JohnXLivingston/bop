import { parseWidgets } from './utils'
import getLogger from '../utils/logger'

require('../../scss/widgets/wheelmenu.scss')

const logger = getLogger('widget/wheelmenu')

declare global {
  interface JQuery {
    bopWheelmenu(): JQuery
    bopWheelmenu(options: BopWheelmenuOptions): JQuery
  }
}

interface BopWheelmenuOptions {
  onClick: boolean,
  onContextMenu: boolean,
  radius: number
}

const bopWheelmenuDefaultOptions: BopWheelmenuOptions = {
  onClick: true,
  onContextMenu: true,
  radius: 100
}

$.widget('bop.bopWheelmenu', {
  options: bopWheelmenuDefaultOptions,
  _create: function () {
    const widget = $(this.element)
    const handler = (ev: JQuery.Event) => {
      logger.debug('Calling the wheelmenu handler...')
      ev.preventDefault()
      const items: string[] = widget.bopDataArray('data-widget-wheelmenu-items')
      if (!items.length) {
        logger.debug('There are no item.')
        return
      }

      const content = $('<ul class="widget-wheelmenu-content" tabindex="-1"></ul>')
      for (let i = 0; i < items.length; i++) {
        const item = $(items[i])
        content.append(item)
        const alpha = i * 2 * Math.PI / items.length
        const x = Math.round(this.options.radius * Math.cos(alpha))
        const y = Math.round(this.options.radius * Math.sin(alpha))
        item.css('left', x + 'px')
        item.css('top', y + 'px')
      }
      const overlay = $('<div class="widget-wheelmenu-overlay"></div>')

      $('body').append(content)
      $('body').append(overlay)

      content.position({
        my: 'center bottom',
        at: 'left+' + ev.pageX + ' top+' + ev.pageY,
        of: window
      })

      const close = () => {
        content.remove()
        overlay.remove()
      }
      overlay.on('click', close)

      parseWidgets(content)
    }
    if (this.options.onClick) {
      widget.on('click', handler)
    }
    if (this.options.onContextMenu) {
      widget.on('contextmenu', handler)
    }
  }
})

export {}
