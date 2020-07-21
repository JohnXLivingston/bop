import { parseWidgets } from '../utils'
import getLogger from '../../utils/logger'

const logger = getLogger('widget/wheelmenu/content')

declare global {
  interface JQuery {
    bopWheelmenuContent(options: BopWheelmenuContentOptions): JQuery
  }
}

export interface BopWheelmenuContentOptions {
  radius: number
}

export const bopWheelmenuContentDefaultOptions: BopWheelmenuContentOptions = {
  radius: 100
}

function maxWheelmenuOverlayZIndex (): number | undefined {
  let zindex: number | undefined
  const lastOverlay = $('.widget-wheelmenu-overlay:last')
  if (lastOverlay.length) {
    return +lastOverlay.css('z-index')
  }
  return zindex
}

$.widget('bop.bopWheelmenuContent', {
  options: bopWheelmenuContentDefaultOptions,
  content: $('<div>'),
  overlay: $('<div>'),

  _create: function () {
    logger.debug('Creating the wheelmenu content...')
    const content = $(this.element)
    this.content = content
    const overlay = $('<div class="widget-wheelmenu-overlay"></div>')
    this.overlay = overlay

    const previousZIndex = maxWheelmenuOverlayZIndex()
    if (previousZIndex) {
      overlay.css('z-index', previousZIndex + 2)
      content.css('z-index', previousZIndex + 3)
    }

    $('body').append(content)
    $('body').append(overlay)

    this.positionItems()

    this._on(overlay, {
      click: () => this.close(),
      contextmenu: () => false
    })

    this._on($('body'), {
      keyup: (ev: JQuery.Event) => {
        // I have to check if the top level wheelmenu is me.
        if (!this.isCurrentWheelmenu()) {
          return true
        }
        if (ev.key === 'Escape') {
          this.close()
          ev.preventDefault()
          ev.stopImmediatePropagation()
          return false
        }
        return true
      }
    })

    parseWidgets(content)
    content.find(':focusable:first').focus()
  },
  isCurrentWheelmenu: function () {
    return +this.overlay.css('z-index') === maxWheelmenuOverlayZIndex()
  },
  positionItems () {
    const nbItems = this.content.children().length
    this.content.children().each((i, html) => {
      const item = $(html)
      // First, we center the item.
      const width = item.outerWidth() || 0
      const height = item.outerHeight() || 0
      if (item.find('a').length) {
        item.find('a').attr('tabindex', i + 1)
      } else {
        item.attr('tabindex', i + 1)
      }
      item.css('left', 0 - (width / 2))
      item.css('top', 0 - (height / 2))

      // Next, we compute the angle (in deg) relative to the vertical line.
      const alpha = Math.round(i * 360 / nbItems)
      // Then, we apply a transform and an animation.
      item.css({
        transform: 'rotate(' + alpha + 'deg) translateY(-' + this.options.radius + 'px) rotate(' + (0 - alpha) + 'deg)',
        animation: 'wheelmenu-rotation 200ms linear'
      })
    })
  },
  close: function () {
    this.content.remove()
    this.overlay.remove()
  }
})
