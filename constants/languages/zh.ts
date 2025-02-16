const zh = {
  tabbar: {
    map: '地图',
    records: '记录',
    reports: '报告',
    schedule: '日程',
  },
  options: {
    tabHeader: '选项',
    closeBtn: '关闭',
    settingsTitle: '设置',
    settingsDesc: '更改应用设置或语言',
    backupHeader: '备份',
    createBackupTitle: '创建备份',
    createBackupDesc: '此文件可用于恢复所有数据',
    restoreBackupTitle: '恢复备份',
    restoreBackupDesc: '查找您的JSON文件以恢复所有数据',
    sharedHeader: '共享记录',
    sharedTitle: '上传1条记录',
    sharedDesc: '上传来自其他用户的共享记录',
    exportHeader: '导出记录',
    exportTitle: '将记录转换为Word文档',
    exportDesc: '导出并在Google文档等中查看',
    infoHeader: '信息',
    infoTitle: '自述',
    infoDesc: '需要注意的事项和新功能',
    resetHeader: '重置',
    deleteRecTitle: '删除所有记录',
    deleteRecDesc: '这将永久删除所有记录',
    deleteRepTitle: '删除所有报告',
    deleteRepDesc: '这将永久删除所有报告',
    restoreAlertTitle: '恢复所有记录',
    restoreAlertDesc: '错误的文件可能导致意外覆盖。请确保选择正确的文件。',
    cancel: '取消',
    proceed: '继续',
    deleteAlertDesc: '请确保在继续之前已备份。',
    toastDeleteRecords: '所有记录已删除',
    toastDeleteReports: '所有报告已删除',
  },
  readme: {
    tabHeader: '自述',
    backBtn: '返回',
    title: '欢迎使用 FsPal 👋',
    toNoteHeader: '需要注意。',
    toNoteBody: `每次创建新记录时，请检查小地图以查看标记是否位于所需位置。有时，您需要按"更新地图"按钮以刷新标记位置。`,
    cloudHeader: '记录是否存储在云端？',
    cloudBody: `不是。记录存储在手机本地。服务器上没有备份。如果删除应用，数据也将被删除。您可以将本地备份保存到JSON文件并保存到手机文件系统。重新安装应用时，可以使用此JSON文件恢复所有数据。`,
    sharingHeader: '是否可以共享？',
    sharingBody: '是的。您可以将记录传输给同样使用FsPal的其他人。',
    exportHeader: '导出为文档',
    exportBody:
      '您可以将记录复制为.docx文件，并在Google文档中打开！或者您喜欢的任何兼容的笔记应用。',
    reportHeader: '新功能！- Fs月度报告',
    reportBody:
      '使用此新功能跟踪您的小时数和圣经学习。报告保留两个服务年度，当前和上一个。两年后，报告将自动删除。',
    scheduleHeader: '新功能！- 日程页面',
    scheduleBody: '直接从此应用创建约会。',
    translateHeader: '新功能！- 应用支持其他语言',
    translateBody: `翻译的准确性不是100%。我使用AI生成翻译。`,
  },
  settings: {
    tabHeader: '设置',
    backBtn: '返回',
    permissionHeader: '权限',
    permissionTitle: '位置和日历',
    permissionDesc: '启用位置和日历访问权限',
    languageHeader: '语言',
    supportHeader: '支持我的工作',
    supportDesc:
      '只有在您真的、真的、真的喜欢这个应用时。那么当然，我谦虚地接受一杯咖啡。😜',
  },
  records: {
    tabHeaderLeft: '新记录',
    tabHeaderRight: '选项',
    contact: '联系方式',
    menu: '菜单',
    actionCancel: '取消',
    actionDelete: '删除',
    actionShare: '共享',
    actionEdit: '编辑',
    deleteAlertTitle: '记录将被删除',
    deleteAlertDesc: '确定继续？',
    cancel: '取消',
    confirm: '确认',
    deleteToast: '记录已删除',
  },
  reports: {
    tabHeaderLeft: '新报告',
    tabHeaderRight: '选项',
    stickyHeader1: '查看服务年度：',
    stickyHeader2: '总计：',
    stickyHeader3: '剩余小时：',
    stickyHeader4: '距离新服务年度：',
    stickyDays: ' 天',
    dropDownTitle: '服务年度 ',
    dropDownCurrent: '当前',
    dropDownPrevious: '上一个',
    backgroundTxt1: '服务年度已结束',
    backgroundTxt2: '从创建您的第一个报告开始',
    tableHeadDate: '日期',
    tableSubtotalLabel: '小计',
    toastDelete: '报告已删除',
    actionCancel: '取消',
    actionDelete: '删除',
  },
  reportsModal: {
    today: '今天',
    openCalendarTxt: '打开日历',
    hoursLabel: '小时',
    bsLabel: '圣经学习数',
    submitBtn: '提交',
    toastDelete: '报告已删除',
  },
  form: {
    tabHeader: '创建新记录',
    tabHeaderLeft: '返回',
    houseLabel: '房号',
    aptLabel: '公寓',
    streetLabel: '街道',
    nameLabel: '姓名',
    contactLabel: '联系方式',
    pubLabel: '出版物',
    remarksLabel: '备注',
    dateLabel: '日期',
    saveLabel: '保存',
    updateMapLabel: '更新\n 地图',
    callAgain: '再次呼叫',
    returnVisit: '回访',
    bibleStudy: '圣经学习',
    toastSuccess: '记录已创建 👍',
  },
  editForm: {
    tabHeader: '编辑记录',
    tabHeaderLeft: '返回',
    saveLabel: '保存编辑',
    toastSuccess: '编辑已保存 💾',
  },
  restoreBackupFunc: {
    toastSuccess: '数据成功恢复 👌',
  },
  uploadRecordFunc: {
    toastSuccess: `记录已上传 👍`,
  },
  schedule: {
    tabHeaderLeft: '新日程',
    tabHeaderRight: '选项',
    backgroundTxt1: '没有即将到来的事件',
    eventReminder: `重要提示：请勿保存到默认日历\n必须选择并保存到"FsPalCalendar"，预约才能在此显示。`,
    upcomingHeader: '即将到来',
    noAddNotes: '无额外备注',
    subsequentHeader: '后续事件...',
    fyiTxt: '* 重复事件有一个固有的删除问题。这是一个已知问题，将在未来修复。',
  },
}

export default zh
