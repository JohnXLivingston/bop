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
      // NB : z-index: x+0=overlay, x+1=content, x+2=focused/hovered item
      overlay.css('z-index', previousZIndex + 3)
      content.css('z-index', previousZIndex + 4)
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

    const itemZIndex = () => {
      const items = content.children()
      items.css('z-index', '')
      const focused = items.filter(':focus:first')
      if (focused.length) {
        focused.css('z-index', overlay.css('z-index') + 2)
      }
    }
    this._on(content.children(), {
      blur: itemZIndex,
      focus: itemZIndex,
      mouseenter: (ev) => { $(ev.currentTarget).focus() }
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

    const firstItem = items[0]
    const lastItem = items[items.length - 1]

    const intersectTop = centerY - radius - (maxHeight / 2) - margin < windowScrollTop ? 1 : 0
    const intersectRight = centerX + radius + (maxWidth / 2) + margin > windowWidth + windowScrollLeft ? 2 : 0
    const intersectBottom = centerY + radius + (maxHeight / 2) + margin > windowHeight + windowScrollTop ? 4 : 0
    const intersectLeft = centerX - radius - (maxWidth / 2) - margin < windowScrollLeft ? 8 : 0
    const intersect = intersectTop + intersectLeft + intersectBottom + intersectRight

    function angleTopDeg (item: JQuery, lowerBound?: number): [number, number] {
      const height = item.outerHeight() || 0
      const yTop = windowScrollTop + margin + (height / 2)
      const h = centerY - yTop
      let a = 180 * Math.acos(h / radius) / Math.PI
      if (lowerBound && a < lowerBound) {
        a = lowerBound
      }
      return [Math.ceil(a), Math.floor(360 - a)]
    }
    function angleRightDeg (item: JQuery, lowerBound?: number): [number, number] {
      const width = item.outerWidth() || 0
      const xRight = windowWidth + windowScrollLeft - margin - (width / 2)
      const w = xRight - centerX
      let a = 180 * Math.acos(w / radius) / Math.PI
      if (lowerBound && a < lowerBound) {
        a = lowerBound
      }
      return [Math.ceil(90 + a), Math.floor(360 - a + 90)]
    }
    function angleBottomDeg (item: JQuery, lowerBound?: number): [number, number] {
      const height = item.outerHeight() || 0
      const yTop = windowHeight + windowScrollTop - margin - (height / 2)
      const h = yTop - centerY
      let a = 180 * Math.acos(h / radius) / Math.PI
      if (lowerBound && a < lowerBound) {
        a = lowerBound
      }
      return [Math.ceil(180 + a), Math.floor(360 - a + 180)]
    }
    function angleLeftDeg (item: JQuery, lowerBound?: number): [number, number] {
      const width = item.outerWidth() || 0
      const yLeft = windowScrollLeft + margin + (width / 2)
      const w = centerX - yLeft
      let a = 180 * Math.acos(w / radius) / Math.PI
      if (lowerBound && a < lowerBound) {
        a = lowerBound
      }
      return [Math.ceil(a - 90), Math.floor(360 - a - 90)]
    }

    let angle: [number, number]
    switch (intersect) {
      case 0:
        logger.debug('No intersection, using 360deg.')
        angle = [0, 360]
        break
      case 1:
        logger.debug('Intersecting only the top.')
        angle = [
          angleTopDeg(firstItem, 180 / items.length)[0],
          angleTopDeg(lastItem, 180 / items.length)[1]
        ]
        break
      case 2:
        logger.debug('Intersecting only the right side.')
        angle = [
          angleRightDeg(firstItem, 180 / items.length)[0],
          angleRightDeg(lastItem, 180 / items.length)[1]
        ]
        break
      case 3:
        logger.debug('Intersecting top and right.')
        angle = [
          angleRightDeg(firstItem)[0],
          angleTopDeg(lastItem)[1]
        ]
        break
      case 4:
        logger.debug('Intersecting only the bottom.')
        angle = [
          angleBottomDeg(firstItem, 180 / items.length)[0],
          angleBottomDeg(lastItem, 180 / items.length)[1]
        ]
        break
      case 5:
        logger.debug('Intersecting Top and Bottom.')
        angle = [
          angleTopDeg(firstItem)[0],
          angleBottomDeg(lastItem)[1] - 360
        ]
        break
      case 6:
        logger.debug('Intersecting Right and bottom.')
        angle = [
          angleBottomDeg(firstItem)[0],
          angleRightDeg(lastItem)[1]
        ]
        break
      case 7:
        logger.debug('Intersecting Top, Right and bottom.')
        angle = [
          angleBottomDeg(firstItem)[0],
          angleTopDeg(lastItem)[1]
        ]
        break
      case 8:
        logger.debug('Intersecting only the left side.')
        angle = [
          angleLeftDeg(firstItem, 180 / items.length)[0],
          angleLeftDeg(lastItem, 180 / items.length)[1]
        ]
        break
      case 9:
        logger.debug('Intersecting Left and Top.')
        angle = [
          angleTopDeg(firstItem)[0],
          angleLeftDeg(lastItem)[1]
        ]
        break
      case 10:
        logger.debug('Intersecting Left and Right')
        angle = [
          angleLeftDeg(firstItem)[0] + 360,
          angleRightDeg(lastItem)[1]
        ]
        break
      case 11:
        logger.debug('Intersecting Top, Right and Left')
        angle = [
          angleRightDeg(firstItem)[0],
          angleLeftDeg(lastItem)[1]
        ]
        break
      case 12:
        logger.debug('Intersecting Left and Bottom')
        angle = [
          angleLeftDeg(firstItem)[0],
          angleBottomDeg(lastItem)[1] - 360
        ]
        break
      case 13:
        logger.debug('Intersecting Top, Left and Bottom')
        angle = [
          angleTopDeg(firstItem)[0],
          angleBottomDeg(lastItem)[1] - 360
        ]
        break
      case 14:
        logger.debug('Intersecting Left, Bottom and Right')
        angle = [
          angleLeftDeg(firstItem)[0] + 360,
          angleRightDeg(lastItem)[1]
        ]
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
    logger.debug(`We are going to use angles ${angle[0]} and ${angle[1]}`)

    const step = angle[1] - angle[0] === 360 || items.length === 1
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
