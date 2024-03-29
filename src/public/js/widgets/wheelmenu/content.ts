import { parseWidgets } from 'bop/public/js/utils/widgets'
import getLogger from 'bop/public/js/utils/logger'

const logger = getLogger('widget/wheelmenu/content')

export interface BopWheelmenuContentOptions {
  margin: number
  radius: number
}

declare global {
  interface JQuery {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    bopWheelmenuContent(options: BopWheelmenuContentOptions): JQuery

    // eslint-disable-next-line @typescript-eslint/method-signature-style
    bopWheelmenuContent(methodName: 'close', withParents?: boolean): void
  }
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

function elementCenter (el: JQuery): {x: number, y: number} {
  const position: JQuery.Coordinates = el.position()
  return {
    x: Math.round(position.left + ((el.innerWidth() ?? 0) / 2)),
    y: Math.round(position.top + ((el.innerHeight() ?? 0) / 2))
  }
}

enum IntersectionSide {
  top = 0,
  right = 1,
  bottom = 2,
  left = 3
}

$.widget('bop.bopWheelmenuContent', $.bop.bop, {
  options: bopWheelmenuContentDefaultOptions,
  content: $('<div>'),
  overlay: $('<div>'),
  opener: $('<div>'),

  _create: function () {
    this._super()
    logger.debug('Creating the wheelmenu content...')
    const content = $(this.element)
    this.content = content
    const overlay = $('<div class="widget-wheelmenu-overlay"></div>')
    this.overlay = overlay

    if (document.activeElement) {
      this.opener = $(document.activeElement as HTMLElement)
    }

    const previousZIndex = maxWheelmenuOverlayZIndex()
    if (previousZIndex) {
      // NB : z-index: x+0=overlay, x+1=content, x+2=focused/hovered item
      overlay.css('z-index', previousZIndex + 3)
      content.css('z-index', previousZIndex + 4)
    }

    $('body').append(content)
    $('body').append(overlay)

    this._setTabindexes()
    this.positionItems(true)

    // This must be done after the .append and after setting tabindexes:
    const focusables = content.find(':focusable')

    // fix onclick on disabled elements:
    focusables.filter('.disabled[onclick]').removeAttr('onclick')

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

    // Trap focus:
    const firstFocusable = focusables.first()
    const lastFocusable = focusables.last()
    this._on(firstFocusable, {
      keydown: (ev: JQuery.Event) => {
        if (ev.key === 'Tab' && ev.shiftKey) {
          lastFocusable.focus()
          ev.preventDefault()
        }
      }
    })
    this._on(lastFocusable, {
      keydown: (ev: JQuery.Event) => {
        if (ev.key === 'Tab' && !ev.shiftKey) {
          firstFocusable.focus()
          ev.preventDefault()
        }
      }
    })

    let lastMoveClockwise: boolean = true
    this._on(focusables, {
      click: (ev: JQuery.TriggeredEvent) => {
        const el = $(ev.currentTarget)
        if (el.is('.disabled')) {
          ev.preventDefault()
          ev.stopImmediatePropagation()
          return false
        }
        if (!el.isBopWidget('bopWheelmenu')) {
          this.close(true)
        }
        return undefined
      },
      keyup: (ev: JQuery.TriggeredEvent) => {
        if (ev.key === 'Enter') {
          const el = $(ev.currentTarget)
          ev.preventDefault()
          if (!el.is('.disabled')) {
            el.click()
          }
          return
        }
        if (/^Arrow/.test(ev.key ?? '')) {
          const el = $(ev.currentTarget)
          let previous: JQuery | undefined
          let next: JQuery | undefined
          let found: boolean = false
          focusables.each((i, html) => {
            const e = $(html)
            if (found) {
              if (!next) {
                next = e
              }
              return false
            }
            if (el.is(e)) {
              found = true
              return undefined
            }
            previous = e
            return undefined
          })
          if (!previous) {
            previous = lastFocusable
          }
          if (!next) {
            next = firstFocusable
          }
          const previousCenter = elementCenter(previous)
          const nextCenter = elementCenter(next)
          const currentCenter = elementCenter(el)
          let direction: number
          let axis: 'x' | 'y'
          switch (ev.key) {
            case 'ArrowRight':
              axis = 'x'
              direction = 1
              break
            case 'ArrowLeft':
              axis = 'x'
              direction = -1
              break
            case 'ArrowUp':
              axis = 'y'
              direction = -1
              break
            case 'ArrowDown':
              axis = 'y'
              direction = 1
              break
            default:
              return
          }

          ev.preventDefault()

          if (lastMoveClockwise) {
            if (direction * (nextCenter[axis] - currentCenter[axis]) >= 0) {
              next.focus()
            } else if (direction * (previousCenter[axis] - currentCenter[axis]) >= 0) {
              previous.focus()
              lastMoveClockwise = false
            }
          } else {
            if (direction * (previousCenter[axis] - currentCenter[axis]) >= 0) {
              previous.focus()
            } else if (direction * (nextCenter[axis] - currentCenter[axis]) >= 0) {
              next.focus()
              lastMoveClockwise = true
            }
          }
        }
      }
    })

    this._on($(window), {
      resize: () => this.positionItems(false)
    })

    const itemZIndex = (): void => {
      const items = content.children()
      items.css('z-index', '')
      const focused = items.filter(':focus:first')
      if (focused.length) {
        focused.css('z-index', parseInt(overlay.css('z-index'), 10) + 2)
      }
    }
    this._on(content.children(), {
      blur: itemZIndex,
      focus: itemZIndex,
      mouseenter: (ev) => { $(ev.currentTarget).focus() }
    })

    parseWidgets(content)
    focusables.first().focus()
  },
  isCurrentWheelmenu: function () {
    return +this.overlay.css('z-index') === maxWheelmenuOverlayZIndex()
  },
  positionItems (firstCall?: boolean) {
    const content = this.content

    const items: JQuery[] = []
    content.children().each((i, html) => { items.push($(html)) })

    const center = content.position()
    const centerX = center.left
    const centerY = center.top
    const radius = this.options.radius
    const margin = this.options.margin
    const $window = $(window)
    const windowWidth = $window.width() ?? 0
    const windowHeight = $window.height() ?? 0
    const windowScrollLeft = $window.scrollLeft() ?? 0
    const windowScrollTop = $window.scrollTop() ?? 0

    const firstItem = items[0]
    const lastItem = items[items.length - 1]

    // First, we have to find if the circle intersect the
    // screen boundaries.
    // To simplify, we will consider each items to have
    // same width and height (the max value)
    let maxWidth = 0
    let maxHeight = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[0]
      maxWidth = Math.max(maxWidth, item.outerWidth() ?? 0)
      maxHeight = Math.max(maxHeight, item.outerHeight() ?? 0)
    }
    const intersectTop = centerY - radius - (maxHeight / 2) - margin < windowScrollTop ? 1 : 0
    const intersectRight = centerX + radius + (maxWidth / 2) + margin > windowWidth + windowScrollLeft ? 2 : 0
    const intersectBottom = centerY + radius + (maxHeight / 2) + margin > windowHeight + windowScrollTop ? 4 : 0
    const intersectLeft = centerX - radius - (maxWidth / 2) - margin < windowScrollLeft ? 8 : 0
    const intersect = intersectTop + intersectLeft + intersectBottom + intersectRight

    // Not we have to find the rotation to apply to first
    // and last item in non trivial cases (when there are
    // intersection with the screen boundaries).
    // For this, lets define a function computing the angle
    // depending on the item size and the intersection.
    function computeAngle (
      item: JQuery,
      screenSide: IntersectionSide,
      intersection: IntersectionSide,
      lowerBound?: number
    ): number {
      let l: number
      let secondaryAngle: boolean
      if (screenSide === IntersectionSide.top) {
        const height = item.outerHeight() ?? 0
        l = centerY - (windowScrollTop + margin + (height / 2))
        secondaryAngle = intersection === IntersectionSide.left
      } else if (screenSide === IntersectionSide.bottom) {
        const height = item.outerHeight() ?? 0
        l = windowHeight + windowScrollTop - margin - (height / 2) - centerY
        secondaryAngle = intersection === IntersectionSide.right
      } else if (screenSide === IntersectionSide.right) {
        const width = item.outerWidth() ?? 0
        l = windowWidth + windowScrollLeft - margin - (width / 2) - centerX
        secondaryAngle = intersection === IntersectionSide.top
      } else if (screenSide === IntersectionSide.left) {
        const width = item.outerWidth() ?? 0
        l = centerX - (windowScrollLeft + margin + (width / 2))
        secondaryAngle = intersection === IntersectionSide.bottom
      } else {
        throw new Error('Invalid side value.')
      }
      let a = 180 * Math.acos(l / radius) / Math.PI
      if (lowerBound && a < lowerBound) {
        a = lowerBound
      }
      if (!secondaryAngle) {
        return Math.ceil(a + (90 * screenSide))
      } else {
        return Math.floor(360 - a + (90 * screenSide))
      }
    }

    // And now we can compute angles for last and first items.
    let angle: [number, number]
    switch (intersect) {
      case 0:
        logger.debug('No intersection, using 360deg.')
        angle = [0, 360]
        break
      case 1:
        logger.debug('Intersecting only the top.')
        angle = [
          computeAngle(firstItem, IntersectionSide.top, IntersectionSide.right, 180 / items.length),
          computeAngle(lastItem, IntersectionSide.top, IntersectionSide.left, 180 / items.length)
        ]
        break
      case 2:
        logger.debug('Intersecting only the right side.')
        angle = [
          computeAngle(firstItem, IntersectionSide.right, IntersectionSide.bottom, 180 / items.length),
          computeAngle(lastItem, IntersectionSide.right, IntersectionSide.top, 180 / items.length)
        ]
        break
      case 3:
        logger.debug('Intersecting top and right.')
        angle = [
          computeAngle(firstItem, IntersectionSide.right, IntersectionSide.bottom),
          computeAngle(lastItem, IntersectionSide.top, IntersectionSide.left)
        ]
        break
      case 4:
        logger.debug('Intersecting only the bottom.')
        angle = [
          computeAngle(firstItem, IntersectionSide.bottom, IntersectionSide.left, 180 / items.length),
          computeAngle(lastItem, IntersectionSide.bottom, IntersectionSide.right, 180 / items.length)
        ]
        break
      case 5:
        logger.debug('Intersecting Top and Bottom.')
        angle = [
          computeAngle(firstItem, IntersectionSide.top, IntersectionSide.right),
          computeAngle(lastItem, IntersectionSide.bottom, IntersectionSide.right) - 360
        ]
        break
      case 6:
        logger.debug('Intersecting Right and bottom.')
        angle = [
          computeAngle(firstItem, IntersectionSide.bottom, IntersectionSide.left),
          computeAngle(lastItem, IntersectionSide.right, IntersectionSide.top)
        ]
        break
      case 7:
        logger.debug('Intersecting Top, Right and bottom.')
        angle = [
          computeAngle(firstItem, IntersectionSide.bottom, IntersectionSide.left),
          computeAngle(lastItem, IntersectionSide.top, IntersectionSide.left)
        ]
        break
      case 8:
        logger.debug('Intersecting only the left side.')
        angle = [
          computeAngle(firstItem, IntersectionSide.left, IntersectionSide.top, 180 / items.length),
          computeAngle(lastItem, IntersectionSide.left, IntersectionSide.bottom, 180 / items.length)
        ]
        break
      case 9:
        logger.debug('Intersecting Left and Top.')
        angle = [
          computeAngle(firstItem, IntersectionSide.top, IntersectionSide.right),
          computeAngle(lastItem, IntersectionSide.left, IntersectionSide.bottom) - 360
        ]
        break
      case 10:
        logger.debug('Intersecting Left and Right')
        angle = [
          computeAngle(firstItem, IntersectionSide.left, IntersectionSide.top),
          computeAngle(lastItem, IntersectionSide.right, IntersectionSide.top)
        ]
        break
      case 11:
        logger.debug('Intersecting Top, Right and Left')
        angle = [
          computeAngle(firstItem, IntersectionSide.right, IntersectionSide.bottom),
          computeAngle(lastItem, IntersectionSide.left, IntersectionSide.bottom) - 360
        ]
        break
      case 12:
        logger.debug('Intersecting Left and Bottom')
        angle = [
          computeAngle(firstItem, IntersectionSide.left, IntersectionSide.top),
          computeAngle(lastItem, IntersectionSide.bottom, IntersectionSide.right)
        ]
        break
      case 13:
        logger.debug('Intersecting Top, Left and Bottom')
        angle = [
          computeAngle(firstItem, IntersectionSide.top, IntersectionSide.right),
          computeAngle(lastItem, IntersectionSide.bottom, IntersectionSide.right) - 360
        ]
        break
      case 14:
        logger.debug('Intersecting Left, Bottom and Right')
        angle = [
          computeAngle(firstItem, IntersectionSide.left, IntersectionSide.top),
          computeAngle(lastItem, IntersectionSide.right, IntersectionSide.top)
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
      const width = item.outerWidth() ?? 0
      const height = item.outerHeight() ?? 0

      item.css('left', 0 - (width / 2))
      item.css('top', 0 - (height / 2))

      // Next, we compute the angle (in deg) relative to the vertical line.
      const alpha = Math.round(angle[0] + (i * step))
      // Then, we apply a transform and an animation.
      const transform: any = {
        transform: 'rotate(' +
          alpha.toString() +
          'deg) translateY(-' +
          radius.toString() +
          'px) rotate(' +
          (0 - alpha).toString() +
          'deg)'
      }
      if (firstCall) {
        transform.animation = 'wheelmenu-rotation 200ms linear'
      }
      item.css(transform)
    }
  },
  _setTabindexes: function () {
    let firstTabindex = 1
    $('[tabindex]').each((i, html) => {
      const idx = $(html).bopDataInteger('tabindex')
      if (idx > firstTabindex) firstTabindex = idx
    })
    logger.debug(`Items tabindex should begin at ${firstTabindex}.`)
    this.content.children('a, button').each((i, html) => {
      $(html).attr('tabindex', firstTabindex + i)
    })
  },
  close: function (withParents?: boolean) {
    this.content.remove()
    this.overlay.remove()
    if (this.opener.length) {
      if (withParents && this.opener.closestBopWidget('bopWheelmenuContent').length) {
        this.opener.closestBopWidget('bopWheelmenuContent').bopWheelmenuContent('close', true)
      } else if (this.opener.is(':focusable')) {
        this.opener.focus()
      }
    }
  }
})
