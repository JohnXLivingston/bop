import { parseWidgets } from '../utils'
import getLogger from '../../utils/logger'

const logger = getLogger('widget/wheelmenu/content')

declare global {
  interface JQuery {
    bopWheelmenuContent(options: BopWheelmenuContentOptions): JQuery
  }
}

export interface BopWheelmenuContentOptions {
  margin: number,
  radius: number
}

export const bopWheelmenuContentDefaultOptions: BopWheelmenuContentOptions = {
  margin: 10,
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

    this.positionItems(true)

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

    this._on($(window), {
      resize: () => this.positionItems(false)
    })

    parseWidgets(content)
    content.find(':focusable:first').focus()
  },
  isCurrentWheelmenu: function () {
    return +this.overlay.css('z-index') === maxWheelmenuOverlayZIndex()
  },
  positionItems (firstCall?: boolean) {
    const content = this.content

    const items: JQuery[] = []
    content.children().each((i, html) => { items.push($(html)) })

    // To simplify, we will consider each items to have
    // same width and height (the max value)
    let maxWidth = 0
    let maxHeight = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[0]
      maxWidth = Math.max(maxWidth, item.outerWidth() || 0)
      maxHeight = Math.max(maxHeight, item.outerHeight() || 0)
    }

    // let search where to place the first item.
    // Their must be enough space to the right, and over.
    const center = content.position()
    const centerX = center.left
    const centerY = center.top
    const radius = this.options.radius
    const margin = this.options.margin
    const $window = $(window)
    const windowWidth = $window.width() || 0
    const windowHeight = $window.height() || 0
    const windowScrollLeft = $window.scrollLeft() || 0
    const windowScrollTop = $window.scrollTop() || 0

    const intersectTop = centerY - radius - (maxHeight / 2) - margin < windowScrollTop ? 1 : 0
    const intersectRight = centerX + radius + (maxWidth / 2) + margin > windowWidth + windowScrollLeft ? 2 : 0
    const intersectBottom = centerY + radius + (maxHeight / 2) + margin > windowHeight + windowScrollTop ? 4 : 0
    const intersectLeft = centerX - radius - (maxWidth / 2) - margin < windowScrollLeft ? 8 : 0
    let angle: [number, number]
    const intersect = intersectTop + intersectLeft + intersectBottom + intersectRight
    switch (intersect) {
      case 0:
        logger.debug('No intersection, using 360deg.')
        angle = [0, 360]
        break
      case 1:
        logger.debug('Intersecting only the top.')
        angle = [90, 270]
        break
      case 2:
        logger.debug('Intersecting only the right side.')
        angle = [180, 360]
        break
      case 3:
        logger.debug('Intersecting top and right.')
        angle = [180, 270]
        break
      case 4:
        logger.debug('Intersecting only the bottom.')
        angle = [270, 450]
        break
      case 5:
        logger.debug('Intersecting Top and Bottom.')
        angle = [45, 135]
        break
      case 6:
        logger.debug('Intersecting Right and bottom.')
        angle = [270, 360]
        break
      case 7:
        logger.debug('Intersecting Top, Right and bottom.')
        angle = [225, 315]
        break
      case 8:
        logger.debug('Intersecting only the right side.')
        angle = [0, 180]
        break
      case 9:
        logger.debug('Intersecting Left and Top.')
        angle = [90, 180]
        break
      case 10:
        logger.debug('Intersecting Left and Right')
        angle = [315, 395]
        break
      case 11:
        logger.debug('Intersecting Top, Right and Left')
        angle = [135, 225]
        break
      case 12:
        logger.debug('Intersecting Left and Bottom')
        angle = [0, 90]
        break
      case 13:
        logger.debug('Intersecting Top, Left annd Bottom')
        angle = [45, 135]
        break
      case 14:
        logger.debug('Intersecting Left, Bottom, Right')
        angle = [315, 395]
        break
      case 15:
        logger.error('Intersecting all sides.')
        // FIXME: try to change the scale to fit the screen?
        angle = [0, 360]
        break
      default:
        logger.error(`The case ${intersect} is not implemented. Falling back on default.`)
        angle = [0, 360]
        break
    }

    const step = angle[1] - angle[0] === 360
      ? (angle[1] - angle[0]) / items.length
      : (angle[1] - angle[0]) / (items.length - 1)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // First, we center the item.
      const width = item.outerWidth() || 0
      const height = item.outerHeight() || 0
      item.attr('tabindex', i + 1)
      item.css('left', 0 - (width / 2))
      item.css('top', 0 - (height / 2))

      // Next, we compute the angle (in deg) relative to the vertical line.
      const alpha = Math.round(angle[0] + (i * step))
      // Then, we apply a transform and an animation.
      const transform: any = {
        transform: 'rotate(' + alpha + 'deg) translateY(-' + radius + 'px) rotate(' + (0 - alpha) + 'deg)'
      }
      if (firstCall) {
        transform.animation = 'wheelmenu-rotation 200ms linear'
      }
      item.css(transform)
    }
  },
  close: function () {
    this.content.remove()
    this.overlay.remove()
  }
})
