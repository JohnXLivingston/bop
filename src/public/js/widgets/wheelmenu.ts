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
      }
      const overlay = $('<div class="widget-wheelmenu-overlay"></div>')

      let zindex: number | undefined
      $('.widget-wheelmenu-overlay').each((i, html) => {
        const o = $(html)
        const z = o.css('z-index')
        if (zindex === undefined || +z > zindex) { zindex = +z }
      })
      if (zindex) {
        overlay.css('z-index', zindex + 2)
        content.css('z-index', zindex + 3)
      }

      // (centerX, centerY) is the position of the event (cartesian coordinates)
      const centerX = ev.pageX || 0
      const centerY = ev.pageY || 0
      logger.debug(`The center of the wheelmenu is (${centerX}, ${centerY}).`)
      content.css('left', centerX + 'px')
      content.css('top', centerY + 'px')

      $('body').append(content)
      $('body').append(overlay)

      content.find('li').each((i, html) => {
        const item = $(html)
        // First, we center the item.
        const width = item.outerWidth() || 0
        const height = item.outerHeight() || 0
        item.css('left', 0 - (width / 2))
        item.css('top', 0 - (height / 2))

        // Next, we compute the angle (in deg) relative to the vertical line.
        const alpha = Math.round(i * 360 / items.length)
        // Then, we apply a transform and an animation.
        item.css({
          transform: 'rotate(' + alpha + 'deg) translateY(-' + this.options.radius + 'px) rotate(' + (0 - alpha) + 'deg)',
          animation: 'wheelmenu-rotation 200ms linear'
        })
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
