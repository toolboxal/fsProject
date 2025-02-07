const es = {
  tabbar: {
    map: 'Mapa',
    records: 'Registros',
    reports: 'Informes',
    schedule: 'Agenda',
  },
  options: {
    tabHeader: 'Opciones',
    closeBtn: 'Cerrar',
    settingsTitle: 'Configuraciones',
    settingsDesc: 'Cambiar configuraciones de la aplicación o idioma',
    backupHeader: 'Copia de seguridad',
    createBackupTitle: 'Crear copia de seguridad',
    createBackupDesc:
      'Este archivo se puede usar para restaurar todos los datos',
    restoreBackupTitle: 'Restaurar copia de seguridad',
    restoreBackupDesc:
      'Encuentra tu archivo JSON para restaurar todos los datos',
    sharedHeader: 'Registro Compartido',
    sharedTitle: 'Subir 1 registro',
    sharedDesc: 'Subir registro compartido de otro usuario',
    exportHeader: 'Exportar Registros',
    exportTitle: 'Transferir registros a documento de Word',
    exportDesc: 'Exportar y ver en Google Docs, etc.',
    infoHeader: 'Información',
    infoTitle: 'Readme',
    infoDesc: 'Cosas a tener en cuenta y nuevas características',
    resetHeader: 'Restablecer',
    deleteRecTitle: 'Eliminar todos los Registros',
    deleteRecDesc: 'Esto eliminará todos los registros permanentemente',
    deleteRepTitle: 'Eliminar todos los Informes',
    deleteRepDesc: 'Esto eliminará todos los informes permanentemente',
    restoreAlertTitle: 'Restaurar Todos los Registros',
    restoreAlertDesc:
      'Un archivo incorrecto puede causar sobrescrituras no intencionadas. Asegúrate de seleccionar el archivo correcto.',
    cancel: 'Cancelar',
    proceed: 'Proceder',
    deleteAlertDesc:
      'Por favor, asegúrate de tener una copia de seguridad antes de continuar.',
    toastDeleteRecords: 'Todos los Registros han sido eliminados',
    toastDeleteReports: 'Todos los Informes han sido eliminados',
  },
  readme: {
    tabHeader: 'Readme',
    backBtn: 'Atrás',
    title: 'Bienvenido a FsPal 👋',
    toNoteHeader: 'A tener en cuenta.',
    toNoteBody: `Cada vez que crees un nuevo registro, verifica el minimapa para ver si el marcador está en la ubicación deseada. A veces, necesitarás presionar el botón 'Actualizar Mapa' para refrescar la ubicación del marcador.`,
    cloudHeader: '¿Los registros están almacenados en la nube?',
    cloudBody: `No. Los registros se almacenan localmente en tu teléfono. No hay copia de seguridad disponible en un servidor. Si eliminas la aplicación, los datos también se eliminarán. Puedes hacer una copia de seguridad local en un archivo JSON y guardarlo en el sistema de archivos de tu teléfono. Este archivo JSON se puede usar para restaurar todos tus datos cuando reinstales la aplicación.`,
    sharingHeader: '¿Está disponible el compartir?',
    sharingBody:
      'Sí. Puedes transferir un registro a otra persona que también esté usando FsPal.',
    exportHeader: 'Exportar como Docs',
    exportBody:
      'Puedes crear una copia de tus registros en un archivo .docx y abrirlo en Google Docs. ¡O en cualquier otra aplicación de notas compatible que prefieras!',
    reportHeader: '¡Nueva Función! - Informe Mensual de Fs',
    reportBody:
      'Rastrea tus horas y estudios bíblicos con esta nueva función. Los informes se mantienen durante 2 años de servicio, el actual y el anterior. Después de 2 años, el informe se eliminará automáticamente.',
    scheduleHeader: '¡Nueva Función! - Página de Agenda',
    scheduleBody: 'Crea citas directamente desde esta aplicación.',
    translateHeader: '¡Nueva Función! - Aplicación disponible en otros idiomas',
    translateBody: `La precisión de la traducción no es del 100%. Utilicé IA para generar las traducciones.`,
  },
  settings: {
    tabHeader: 'Configuraciones',
    backBtn: 'Atrás',
    languageHeader: 'Idiomas',
    supportHeader: 'Apoya mi trabajo',
    supportDesc:
      'Solo si realmente, realmente, realmente te gusta la aplicación. Entonces, por supuesto, humildemente acepto una taza de café.😜',
  },
  records: {
    tabHeaderLeft: 'Nuevo Registro',
    tabHeaderRight: 'Opciones',
    contact: 'contacto',
    menu: 'menú',
    actionCancel: 'Cancelar',
    actionDelete: 'Eliminar',
    actionShare: 'Compartir',
    actionEdit: 'Editar',
    deleteAlertTitle: 'El registro será eliminado',
    deleteAlertDesc: '¿Está bien proceder?',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    deleteToast: 'El registro ha sido eliminado',
  },
  reports: {
    tabHeaderLeft: 'Nuevo Informe',
    tabHeaderRight: 'Opciones',
    stickyHeader1: 'Viendo año de servicio: ',
    stickyHeader2: 'Total: ',
    stickyHeader3: 'Horas restantes: ',
    stickyHeader4: 'Días hasta el nuevo Año de Servicio:',
    stickyDays: ' días',
    dropDownTitle: 'año de servicio ',
    dropDownCurrent: 'actual',
    dropDownPrevious: 'anterior',
    backgroundTxt1: 'el año de servicio ha terminado',
    backgroundTxt2: 'Comienza creando tu primer informe',
    tableHeadDate: 'Fecha',
    tableSubtotalLabel: 'Subtotal',
    toastDelete: 'Informe eliminado',
    actionCancel: 'Cancelar',
    actionDelete: 'Eliminar',
  },
  reportsModal: {
    today: 'Hoy',
    openCalendarTxt: 'Abrir Calendario',
    hoursLabel: 'horas',
    bsLabel: 'nº estudios bíblicos',
    submitBtn: 'Enviar',
    toastDelete: 'Informe eliminado',
  },
  form: {
    tabHeader: 'Crear Nuevo Registro',
    tabHeaderLeft: 'Atrás',
    houseLabel: 'nº de casa',
    aptLabel: 'apartamento',
    streetLabel: 'calle',
    nameLabel: 'nombre',
    contactLabel: 'contacto',
    pubLabel: 'publicaciones',
    remarksLabel: 'observaciones',
    dateLabel: 'fecha',
    saveLabel: 'Guardar',
    updateMapLabel: 'Actualizar\n Mapa',
    callAgain: 'Llamar de nuevo',
    returnVisit: 'Visita de regreso',
    bibleStudy: 'Estudio Bíblico',
    toastSuccess: 'El registro ha sido creado 👍',
  },
  editForm: {
    tabHeader: 'Editar Registro',
    tabHeaderLeft: 'Atrás',
    saveLabel: 'Guardar Edición',
    toastSuccess: 'Edición guardada 💾',
  },
  restoreBackupFunc: {
    toastSuccess: 'Datos restaurados con éxito 👌',
  },
  uploadRecordFunc: {
    toastSuccess: `El registro ha sido subido 👍`,
  },
  schedule: {
    tabHeaderLeft: 'Nueva Agenda',
    tabHeaderRight: 'Opciones',
    backgroundTxt1: 'sin eventos próximos',
    upcomingHeader: 'Próximos',
    noAddNotes: 'Sin notas adicionales',
    subsequentHeader: 'eventos posteriores...',
    fyiTxt:
      '* Los eventos recurrentes tienen un problema inherente con la eliminación. Este es un problema conocido y se solucionará en el futuro.',
  },
}

export default es
