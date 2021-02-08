import { i18next as i18n } from 'bop/public/js/utils/i18n'

require('bop/public/scss/widgets/locale.scss')

declare global {
  interface JQuery {
    bopLocaleChange: () => JQuery
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
          closeText: i18n.t('action.close'),
          draggable: false,
          height: 'auto',
          maxHeight: 600,
          modal: true,
          resizable: true,
          title: i18n.t('action.changeLocale'),
          width: 380
        })
      }
      changeDialog.dialog('open')
    })
  }
})

export {}
