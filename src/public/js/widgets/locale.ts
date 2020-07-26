import { gettext } from '../utils/i18n'

require('../../scss/widgets/locale.scss')

declare global {
  interface JQuery {
    bopLocaleChange(): JQuery
  }
}

$.widget('bop.bopLocaleChange', $.bop.bop, {
  _create: function () {
    this._super()
    const content = $(this.element)
    let changeDialog: JQuery | undefined
    const button = content.find('>a')
    button.on('click', () => {
      if (!changeDialog) {
        changeDialog = content.find('>div')
        changeDialog.dialog({
          closeText: gettext('Close'),
          draggable: false,
          height: 'auto',
          maxHeight: 600,
          modal: true,
          resizable: true,
          title: gettext('Change your locale'),
          width: 380
        })
      }
      changeDialog.dialog('open')
    })
  }
})

export {}
