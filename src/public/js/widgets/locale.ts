import { gettext } from '../utils/i18n'

function initWidgetsLocale () {
  let changeDialog: JQuery | undefined
  $('body').on('click', '[widget-locale-change]>a', (ev) => {
    const button = $(ev.currentTarget)
    const widget = button.closest('[widget-locale-change]')
    if (!changeDialog) {
      changeDialog = widget.find('>div')
      changeDialog.dialog({
        closeText: gettext('Close'),
        draggable: false,
        height: 'auto',
        maxHeight: 600,
        modal: true,
        resizable: true,
        // TODO: title: gettext('...') ?
        width: 380
      })
    }
    changeDialog.dialog('open')
  })
}

export {
  initWidgetsLocale
}
