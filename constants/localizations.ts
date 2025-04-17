import en from './languages/en'
import es from './languages/es'
import ja from './languages/ja'
import zh from './languages/zh'
import ptBR from './languages/ptBR'
import fr from './languages/fr'
import ko from './languages/ko'

export { en, es, ja, zh, ptBR, fr, ko }

// const en = {
//   tabbar: {
//     map: 'Map',
//     records: 'Records',
//     reports: 'Reports',
//     schedule: 'Schedule',
//   },
//   options: {
//     tabHeader: 'Options',
//     closeBtn: 'Close',
//     settingsTitle: 'Settings',
//     settingsDesc: 'Change app settings or language',
//     backupHeader: 'Backup',
//     createBackupTitle: 'Create backup',
//     createBackupDesc: 'This file can be used to restore all data',
//     restoreBackupTitle: 'Restore backup',
//     restoreBackupDesc: 'Find your JSON file to restore all data',
//     sharedHeader: 'Shared Record',
//     sharedTitle: 'Upload 1 record',
//     sharedDesc: 'Upload shared record from another user',
//     exportHeader: 'Export Records',
//     exportTitle: 'Transfer records to Word document',
//     exportDesc: 'Export and view in Google Docs etc.',
//     infoHeader: 'Info',
//     infoTitle: 'Readme',
//     infoDesc: 'Things to note and new features',
//     resetHeader: 'Reset',
//     deleteRecTitle: 'Delete all Records',
//     deleteRecDesc: 'This will delete all records permanently',
//     deleteRepTitle: 'Delete all Reports',
//     deleteRepDesc: 'This will delete all reports permanently',
//     restoreAlertTitle: 'Restore All Records',
//     restoreAlertDesc:
//       'Wrong file can cause unintented overwrites. Make sure you select the correct file.',
//     cancel: 'Cancel',
//     proceed: 'Proceed',
//     deleteAlertDesc: 'Please make sure you have a backup before proceeding.',
//     toastDeleteRecords: 'All Records have been deleted',
//     toastDeleteReports: 'All Reports have been deleted',
//   },
//   readme: {
//     tabHeader: 'Readme',
//     backBtn: 'Back',
//     title: 'Welcome to FsPal 👋',
//     toNoteHeader: 'To note.',
//     toNoteBody: `Whenever you create a new record, check the minimap to see whether marker is at the desired location. Sometimes, you will need to press the 'Update Map' button to refresh the marker's location.`,
//     cloudHeader: 'Are the records stored in the cloud?',
//     cloudBody: `No. The records are stored locally on your phone. No backup is available on a server. If you delete the app, the data will also be deleted. You can do a local backup onto a JSON file and save to your phone's file system. This JSON file can then be used to restore all your data when you reinstall the app.`,
//     sharingHeader: 'Is sharing available?',
//     sharingBody:
//       'Yes. You can transfer a record to another person who is also using FsPal.',
//     exportHeader: 'New Feature! - Export as Docs',
//     exportBody:
//       'You can create a copy of your records in a .docx file, and open it on Google Docs! Or whichever compatible note-taking app you prefer.',
//     reportHeader: 'New Feature! - Fs Monthly Report',
//     reportBody:
//       'Track your hours and bible studies with this new feature. Reports are kept for 2 service years, current and previous. After 2 years, report will auto delete.',
//   },
//   settings: {
//     tabHeader: 'Settings',
//     backBtn: 'Back',
//   },
//   records: {
//     tabHeaderLeft: 'New Record',
//     tabHeaderRight: 'Options',
//     contact: 'contact',
//     menu: 'menu',
//     actionCancel: 'Cancel',
//     actionDelete: 'Delete',
//     actionShare: 'Share',
//     actionEdit: 'Edit',
//     deleteAlertTitle: 'Record will be deleted',
//     deleteAlertDesc: 'Ok to proceed?',
//     cancel: 'Cancel',
//     confirm: 'Confirm',
//     deleteToast: 'Record has been deleted',
//   },
//   reports: {
//     tabHeaderLeft: 'New Report',
//     tabHeaderRight: 'Options',
//     stickyHeader1: 'Viewing service year: ',
//     stickyHeader2: 'Total: ',
//     stickyHeader3: 'Remaining hours: ',
//     stickyHeader4: 'Days to new Service Year:',
//     stickyDays: ' days',
//     dropDownTitle: 'service year ',
//     dropDownCurrent: 'current',
//     dropDownPrevious: 'previous',
//     backgroundTxt1: 'service year has ended',
//     backgroundTxt2: 'Start by creating your first report',
//     tableHeadDate: 'Date',
//     tableSubtotalLabel: 'Subtotal',
//     toastDelete: 'Report deleted',
//     actionCancel: 'Cancel',
//     actionDelete: 'Delete',
//   },
//   reportsModal: {
//     today: 'Today',
//     openCalendarTxt: 'Open Calendar',
//     hoursLabel: 'hours',
//     bsLabel: 'no. bible studies',
//     submitBtn: 'Submit',
//     toastDelete: 'Report deleted',
//   },

//   form: {
//     tabHeader: 'Create New Record',
//     tabHeaderLeft: 'Back',
//     houseLabel: 'house no.',
//     aptLabel: 'apartment',
//     streetLabel: 'street',
//     nameLabel: 'name',
//     contactLabel: 'contact',
//     pubLabel: 'publications',
//     remarksLabel: 'remarks',
//     dateLabel: 'date',
//     saveLabel: 'Save',
//     updateMapLabel: 'Update\n Map',
//     callAgain: 'Call Again',
//     returnVisit: 'Return Visit',
//     bibleStudy: 'Bible Study',
//     toastSuccess: 'Record has been created 👍',
//   },
//   editForm: {
//     tabHeader: 'Edit Record',
//     tabHeaderLeft: 'Back',
//     saveLabel: 'Save Edit',
//     toastSuccess: 'Edit saved 💾',
//   },
//   restoreBackupFunc: {
//     toastSuccess: 'Data restored successfully 👌',
//   },
//   uploadRecordFunc: {
//     toastSuccess: `Record has been upload 👍`,
//   },
//   schedule: {
//     tabHeaderLeft: 'New Schedule',
//     tabHeaderRight: 'Options',
//     backgroundTxt1: 'no upcoming events',
//     upcomingHeader: 'Upcoming',
//     noAddNotes: 'No additional notes',
//     subsequentHeader: 'subsequent events...',
//     fyiTxt: '* Recurring events has an inherent issue with deletion.',
//   },
// }
