import { gettext } from '../utils/i18n'

function initWidgetsLocale () {
  let changeDialog: JQuery | undefined
  $('body').on('click', '[data-widget-locale-change]>a', (ev) => {
    const button = $(ev.currentTarget)
    const widget = button.closest('[data-widget-locale-change]')
    if (!changeDialog) {
      changeDialog = widget.find('>div')
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

export {
  initWidgetsLocale
}
