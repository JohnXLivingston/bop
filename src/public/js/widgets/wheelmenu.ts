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

$.widget('bop.bopWheelmenu', $.bop.bop, {
  options: bopWheelmenuDefaultOptions,
  _create: function () {
    this._super()
    const handler = (ev: JQuery.Event) => {
      ev.preventDefault()
      if (ev.pageX !== undefined && ev.pageY !== undefined) {
        this.open({ x: ev.pageX, y: ev.pageY })
      } else {
        this.open()
      }
      return false
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
  open: function (coordinates?: {x: number, y: number}) {
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

    if (!coordinates) {
      // Probably an action initiated by the keyboard...
      logger.debug('No coordinates were provided, fallback on the widget position.')
      const widget = $(this.element)
      if (widget.length) {
        const offset = widget.offset()
        if (offset) {
          coordinates = {
            x: offset.left + ((widget.innerWidth() || 0) / 2),
            y: offset.top + ((widget.innerHeight() || 0) / 2)
          }
        }
      }
    }
    if (!coordinates) {
      // Fallback on the screen center.
      logger.debug('The widget seems to have no position, so we cant compute coordinates, fallback on the screen center.')
      const $window = $(window)
      coordinates = {
        x: ($window.scrollLeft() || 0) + (($window.width() || 0) / 2),
        y: ($window.scrollTop() || 0) + (($window.height() || 0) / 2)
      }
    }

    const $window = $(window)
    const windowWidth = $window.width() || 0
    const windowHeight = $window.height() || 0
    const windowScrollLeft = $window.scrollLeft() || 0
    const windowScrollTop = $window.scrollTop() || 0
    if (coordinates.x > windowScrollLeft + windowWidth) {
      logger.debug('The x position is outside the screen (on the right).')
      coordinates.x = windowScrollLeft + windowWidth
    }
    if (coordinates.x < windowScrollLeft) {
      logger.debug('The x position is outside the screen (on the left).')
      coordinates.x = windowScrollLeft
    }
    if (coordinates.y > windowScrollTop + windowHeight) {
      logger.debug('The x position is outside the screen (on the bottom).')
      coordinates.y = windowScrollTop + windowHeight
    }
    if (coordinates.y < windowScrollTop) {
      logger.debug('The x position is outside the screen (on the top).')
      coordinates.y = windowScrollTop
    }

    logger.debug(`The center of the wheelmenu is (${coordinates.x}, ${coordinates.y}).`)
    content.css('left', coordinates.x + 'px')
    content.css('top', coordinates.y + 'px')

    content.bopWheelmenuContent(this.options)
  },
  createDebugItems (n: number, variousLength?: boolean): void {
    const items: string[] = []
    for (let i = 1; i < n + 1; i++) {
      let s: string
      if (variousLength) {
        s = 'x'.repeat(i + 1)
      } else {
        s = '' + i
      }
      items.push('<a>' + s + '</a>')
    }
    $(this.element).bopDataArray('data-widget-wheelmenu-items', items)
  }
})

export {}
