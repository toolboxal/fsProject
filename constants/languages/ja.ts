const ja = {
  tabbar: {
    map: '地図',
    records: '記録',
    reports: 'レポート',
    schedule: 'スケジュール',
  },
  options: {
    tabHeader: 'オプション',
    closeBtn: '閉じる',
    settingsTitle: '設定',
    settingsDesc: 'アプリ設定や言語を変更',
    backupHeader: 'バックアップ',
    createBackupTitle: 'バックアップを作成',
    createBackupDesc: 'このファイルですべてのデータを復元できます',
    restoreBackupTitle: 'バックアップを復元',
    restoreBackupDesc: 'すべてのデータを復元するためのJSONファイルを選択',
    sharedHeader: '共有記録',
    sharedTitle: '1件の記録をアップロード',
    sharedDesc: '他のユーザーからの共有記録をアップロード',
    exportHeader: '記録をエクスポート',
    exportTitle: '記録をWordドキュメントに転送',
    exportDesc: 'Google Docsなどで表示するためにエクスポート',
    infoHeader: '情報',
    infoTitle: 'お読みください',
    infoDesc: '注意事項と新機能について',
    resetHeader: 'リセット',
    deleteRecTitle: 'すべての記録を削除',
    deleteRecDesc: 'すべての記録が完全に削除されます',
    deleteRepTitle: 'すべてのレポートを削除',
    deleteRepDesc: 'すべてのレポートが完全に削除されます',
    restoreAlertTitle: 'すべての記録を復元',
    restoreAlertDesc:
      '誤ったファイルは意図しない上書きを引き起こす可能性があります。正しいファイルを選択してください。',
    cancel: 'キャンセル',
    proceed: '続行',
    deleteAlertDesc: '続行する前にバックアップを作成してください。',
    toastDeleteRecords: 'すべての記録が削除されました',
    toastDeleteReports: 'すべてのレポートが削除されました',
  },
  readme: {
    tabHeader: 'お読みください',
    backBtn: '戻る',
    title: 'FsPalへようこそ 👋',
    toNoteHeader: '注意事項',
    toNoteBody: `新しい記録を作成する際は、マーカーが希望の場所にあるかミニマップで確認してください。マーカーの位置を更新するには、「地図を更新」ボタンを押す必要がある場合があります。`,
    cloudHeader: '記録はクラウドに保存されますか？',
    cloudBody: `いいえ。記録はお使いの携帯電話にローカルに保存されます。サーバー上にバックアップはありません。アプリを削除すると、データも削除されます。JSONファイルにローカルバックアップを作成し、携帯電話のファイルシステムに保存できます。このJSONファイルは、アプリを再インストールした際にすべてのデータを復元するために使用できます。`,
    sharingHeader: '共有機能はありますか？',
    sharingBody: 'はい。FsPalを使用している他のユーザーに記録を転送できます。',
    exportHeader: '新機能! - ドキュメントとしてエクスポート',
    exportBody:
      '記録を.docxファイルとしてコピーを作成し、Google Docsで開くことができます！または他の互換性のあるメモアプリでも利用可能です。',
    reportHeader: '新機能! - Fs月次レポート',
    reportBody:
      'この新機能で時間と聖書研究の追跡ができます。レポートは現在と前年の2奉仕年度分保存されます。2年後、レポートは自動的に削除されます。',
  },
  settings: {
    tabHeader: '設定',
    backBtn: '戻る',
  },
  records: {
    tabHeaderLeft: '新規記録',
    tabHeaderRight: 'オプション',
    contact: '連絡先',
    menu: 'メニュー',
    actionCancel: 'キャンセル',
    actionDelete: '削除',
    actionShare: '共有',
    actionEdit: '編集',
    deleteAlertTitle: '記録が削除されます',
    deleteAlertDesc: '続行しますか？',
    cancel: 'キャンセル',
    confirm: '確認',
    deleteToast: '記録が削除されました',
  },
  reports: {
    tabHeaderLeft: '新規レポート',
    tabHeaderRight: 'オプション',
    stickyHeader1: '表示中の奉仕年度: ',
    stickyHeader2: '合計: ',
    stickyHeader3: '残り時間: ',
    stickyHeader4: '新奉仕年度まで:',
    stickyDays: ' 日',
    dropDownTitle: '奉仕年度 ',
    dropDownCurrent: '現在',
    dropDownPrevious: '前年',
    backgroundTxt1: '奉仕年度が終了しました',
    backgroundTxt2: '最初のレポートを作成してください',
    tableHeadDate: '日付',
    tableSubtotalLabel: '小計',
    toastDelete: 'レポートが削除されました',
    actionCancel: 'キャンセル',
    actionDelete: '削除',
  },
  reportsModal: {
    today: '今日',
    openCalendarTxt: 'カレンダーを開く',
    hoursLabel: '時間',
    bsLabel: '聖書研究の数',
    submitBtn: '送信',
    toastDelete: 'レポートが削除されました',
  },
  form: {
    tabHeader: '新規記録を作成',
    tabHeaderLeft: '戻る',
    houseLabel: '家番号',
    aptLabel: 'アパート',
    streetLabel: '通り',
    nameLabel: '名前',
    contactLabel: '連絡先',
    pubLabel: '出版物',
    remarksLabel: '備考',
    dateLabel: '日付',
    saveLabel: '保存',
    updateMapLabel: '地図を\n更新',
    callAgain: '再訪問',
    returnVisit: '継続訪問',
    bibleStudy: '聖書研究',
    toastSuccess: '記録が作成されました 👍',
  },
  editForm: {
    tabHeader: '記録を編集',
    tabHeaderLeft: '戻る',
    saveLabel: '編集を保存',
    toastSuccess: '編集が保存されました 💾',
  },
  restoreBackupFunc: {
    toastSuccess: 'データが正常に復元されました 👌',
  },
  uploadRecordFunc: {
    toastSuccess: `記録がアップロードされました 👍`,
  },
  schedule: {
    tabHeaderLeft: '新規スケジュール',
    tabHeaderRight: 'オプション',
    backgroundTxt1: '予定されているイベントはありません',
    upcomingHeader: '今後の予定',
    noAddNotes: '追加のメモはありません',
    subsequentHeader: '以降のイベント...',
    fyiTxt: '* 定期的なイベントには削除に関する固有の問題があります。',
  },
}

export default ja
