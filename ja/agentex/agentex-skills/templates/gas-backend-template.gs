/**
 * Melonpan-Flash-Lite-1.0 統合GASバックエンドテンプレート
 * 
 * 概要:
 *   全スキルのCanvas HTMLからPOSTされるリクエストを、`action`パラメータで振り分ける統合型Web App。
 *   Google Apps Script (GAS) のスクリプトエディタにこのコードをコピーし、
 *   「デプロイ」→「新しいデプロイ」→「ウェブアプリ」として公開してください。
 *
 * デプロイ設定:
 *   - 実行するユーザー: 自分 (自分のGoogleアカウント)
 *   - アクセスできるユーザー: 全員 (匿名を含む)
 *
 * 使用方法:
 *   各Canvas HTMLテンプレートの <form action="YOUR_GAS_WEBAPP_URL" method="POST"> の
 *   YOUR_GAS_WEBAPP_URL を、デプロイ後に取得したURLに置き換えてください。
 */

// ============================================================
// メインルーター
// ============================================================

function doPost(e) {
  try {
    var payload = JSON.parse(e.parameter.payload || '{}');
    var action = payload.action || 'unknown';

    var result;
    switch (action) {
      // --- カレンダー作成 ---
      case 'create_calendar':
        result = handleCreateCalendar(payload);
        break;

      // --- メール送信 ---
      case 'send_email':
        result = handleSendEmail(payload);
        break;

      // --- スプレッドシート操作 ---
      case 'create_spreadsheet':
        result = handleCreateSpreadsheet(payload);
        break;
      case 'read_spreadsheet':
        result = handleReadSpreadsheet(payload);
        break;
      case 'update_spreadsheet':
        result = handleUpdateSpreadsheet(payload);
        break;

      // --- Googleドキュメント作成 ---
      case 'create_document':
        result = handleCreateDocument(payload);
        break;

      // --- Gmail自動化 ---
      case 'create_gmail_filter':
        result = handleCreateGmailFilter(payload);
        break;
      case 'apply_gmail_labels':
        result = handleApplyGmailLabels(payload);
        break;
      case 'setup_auto_forward':
        result = handleSetupAutoForward(payload);
        break;

      // --- タスク(ToDo)管理 ---
      case 'list_tasks':
        result = handleListTasks(payload);
        break;
      case 'add_task':
        result = handleAddTask(payload);
        break;
      case 'complete_task':
        result = handleCompleteTask(payload);
        break;

      // --- ドライブ管理 ---
      case 'search_drive':
        result = handleSearchDrive(payload);
        break;
      case 'organize_drive':
        result = handleOrganizeDrive(payload);
        break;
      case 'share_drive_file':
        result = handleShareDriveFile(payload);
        break;

      // --- 自動レポート生成 ---
      case 'generate_report':
        result = handleGenerateReport(payload);
        break;

      // --- スキル保存 ---
      case 'save_skill':
        result = handleSaveSkill(payload);
        break;

      default:
        result = { status: 'error', message: '不明なアクション: ' + action };
    }

    return HtmlService.createHtmlOutput(
      '<html><body><h2>処理完了</h2><pre>' + JSON.stringify(result, null, 2) + '</pre></body></html>'
    );

  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<html><body><h2>エラー</h2><p>' + err.message + '</p></body></html>'
    );
  }
}

function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<html><body><h2>Melonpan GAS Backend</h2><p>このエンドポイントはPOSTリクエスト専用です。</p></body></html>'
  );
}


// ============================================================
// カレンダー作成ハンドラー
// ============================================================

function handleCreateCalendar(payload) {
  var calName = payload.calName || '新規カレンダー';
  var desc = payload.desc || '';
  var events = payload.events || [];

  // 新規カレンダーを作成
  var calendar = CalendarApp.createCalendar(calName, { summary: desc });

  // 各イベントを追加
  events.forEach(function(evt) {
    var startDate = new Date(evt.start);
    var endDate = new Date(evt.end);
    var options = {};
    if (evt.description) options.description = evt.description;
    calendar.createEvent(evt.title, startDate, endDate, options);
  });

  return {
    status: 'success',
    message: 'カレンダー「' + calName + '」を作成し、' + events.length + '件の予定を登録しました。',
    calendarId: calendar.getId()
  };
}


// ============================================================
// メール送信ハンドラー
// ============================================================

function handleSendEmail(payload) {
  var to = payload.to || '';
  var subject = payload.subject || '(件名なし)';
  var body = payload.body || '';

  if (!to) {
    return { status: 'error', message: '送信先メールアドレスが指定されていません。' };
  }

  GmailApp.sendEmail(to, subject, body);

  return {
    status: 'success',
    message: to + ' 宛にメールを送信しました。'
  };
}


// ============================================================
// スプレッドシート操作ハンドラー
// ============================================================

function handleCreateSpreadsheet(payload) {
  var title = payload.title || '新規スプレッドシート';
  var headers = payload.headers || [];
  var rows = payload.rows || [];

  var ss = SpreadsheetApp.create(title);
  var sheet = ss.getActiveSheet();

  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  if (rows.length > 0) {
    var startRow = headers.length > 0 ? 2 : 1;
    sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 列幅自動調整
  for (var i = 1; i <= Math.max(headers.length, (rows[0] || []).length); i++) {
    sheet.autoResizeColumn(i);
  }

  return {
    status: 'success',
    message: 'スプレッドシート「' + title + '」を作成しました。',
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId()
  };
}

function handleReadSpreadsheet(payload) {
  var spreadsheetId = payload.spreadsheetId;
  var sheetName = payload.sheetName || '';

  if (!spreadsheetId) {
    return { status: 'error', message: 'スプレッドシートIDが指定されていません。' };
  }

  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getActiveSheet();

  if (!sheet) {
    return { status: 'error', message: 'シート「' + sheetName + '」が見つかりません。' };
  }

  var data = sheet.getDataRange().getValues();

  return {
    status: 'success',
    sheetName: sheet.getName(),
    data: data
  };
}

function handleUpdateSpreadsheet(payload) {
  var spreadsheetId = payload.spreadsheetId;
  var sheetName = payload.sheetName || '';
  var updates = payload.updates || []; // [{row, col, value}]

  if (!spreadsheetId) {
    return { status: 'error', message: 'スプレッドシートIDが指定されていません。' };
  }

  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getActiveSheet();

  updates.forEach(function(u) {
    sheet.getRange(u.row, u.col).setValue(u.value);
  });

  return {
    status: 'success',
    message: updates.length + '件のセルを更新しました。'
  };
}


// ============================================================
// Googleドキュメント作成ハンドラー
// ============================================================

function handleCreateDocument(payload) {
  var title = payload.title || '新規ドキュメント';
  var content = payload.content || '';
  var sections = payload.sections || [];

  var doc = DocumentApp.create(title);
  var body = doc.getBody();

  if (sections.length > 0) {
    sections.forEach(function(section, index) {
      if (index > 0) body.appendPageBreak();

      if (section.heading) {
        var heading = body.appendParagraph(section.heading);
        heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      }

      if (section.body) {
        body.appendParagraph(section.body);
      }

      if (section.bullets && section.bullets.length > 0) {
        section.bullets.forEach(function(bullet) {
          var item = body.appendListItem(bullet);
          item.setGlyphType(DocumentApp.GlyphType.BULLET);
        });
      }
    });
  } else if (content) {
    body.appendParagraph(content);
  }

  doc.saveAndClose();

  return {
    status: 'success',
    message: 'ドキュメント「' + title + '」を作成しました。',
    documentUrl: doc.getUrl(),
    documentId: doc.getId()
  };
}


// ============================================================
// Gmail自動化ハンドラー
// ============================================================

function handleCreateGmailFilter(payload) {
  // GASではGmailフィルターの直接作成APIが限定的なため、
  // Gmail APIの高度なサービスを利用する必要があります。
  // ここではラベル適用による擬似フィルターを実装します。
  var criteria = payload.criteria || {};
  var labelName = payload.labelName || '';
  var from = criteria.from || '';
  var subject = criteria.subject || '';

  if (!labelName) {
    return { status: 'error', message: 'ラベル名が指定されていません。' };
  }

  // ラベルの取得または作成
  var label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }

  // 検索クエリの構築
  var query = [];
  if (from) query.push('from:' + from);
  if (subject) query.push('subject:' + subject);
  if (criteria.hasAttachment) query.push('has:attachment');

  var threads = GmailApp.search(query.join(' '), 0, 50);
  threads.forEach(function(thread) {
    label.addToThread(thread);
  });

  return {
    status: 'success',
    message: '「' + labelName + '」ラベルを' + threads.length + '件のスレッドに適用しました。',
    query: query.join(' ')
  };
}

function handleApplyGmailLabels(payload) {
  var rules = payload.rules || []; // [{query, labelName}]
  var results = [];

  rules.forEach(function(rule) {
    var label = GmailApp.getUserLabelByName(rule.labelName);
    if (!label) {
      label = GmailApp.createLabel(rule.labelName);
    }

    var threads = GmailApp.search(rule.query, 0, 100);
    threads.forEach(function(thread) {
      label.addToThread(thread);
    });

    results.push({
      labelName: rule.labelName,
      threadsAffected: threads.length
    });
  });

  return {
    status: 'success',
    message: rules.length + '件のラベルルールを適用しました。',
    details: results
  };
}

function handleSetupAutoForward(payload) {
  // GASではメール転送の自動設定はAPI制限により直接対応不可
  // 代替: 検索→該当メールを指定アドレスに転送
  var query = payload.query || '';
  var forwardTo = payload.forwardTo || '';

  if (!forwardTo) {
    return { status: 'error', message: '転送先メールアドレスが指定されていません。' };
  }

  var threads = GmailApp.search(query, 0, 20);
  var forwarded = 0;

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    var lastMessage = messages[messages.length - 1];
    lastMessage.forward(forwardTo);
    forwarded++;
  });

  return {
    status: 'success',
    message: forwarded + '件のメールを ' + forwardTo + ' に転送しました。'
  };
}


// ============================================================
// タスク(ToDo)管理ハンドラー
// ============================================================

function handleListTasks(payload) {
  var taskListId = payload.taskListId || '@default';

  // Tasks APIの高度なサービスを有効にする必要あり
  try {
    var tasks = Tasks.Tasks.list(taskListId, { showCompleted: false, maxResults: 100 });
    var items = (tasks.items || []).map(function(task) {
      return {
        id: task.id,
        title: task.title,
        notes: task.notes || '',
        due: task.due || '',
        status: task.status
      };
    });

    return {
      status: 'success',
      tasks: items
    };
  } catch (err) {
    return { status: 'error', message: 'Tasks API エラー: ' + err.message + '。Google Tasks APIの高度なサービスを有効にしてください。' };
  }
}

function handleAddTask(payload) {
  var taskListId = payload.taskListId || '@default';
  var title = payload.title || '';
  var notes = payload.notes || '';
  var due = payload.due || '';

  if (!title) {
    return { status: 'error', message: 'タスクのタイトルが指定されていません。' };
  }

  try {
    var task = {
      title: title,
      notes: notes
    };
    if (due) {
      task.due = new Date(due).toISOString();
    }

    var created = Tasks.Tasks.insert(task, taskListId);

    return {
      status: 'success',
      message: 'タスク「' + title + '」を追加しました。',
      taskId: created.id
    };
  } catch (err) {
    return { status: 'error', message: 'Tasks API エラー: ' + err.message };
  }
}

function handleCompleteTask(payload) {
  var taskListId = payload.taskListId || '@default';
  var taskId = payload.taskId || '';

  if (!taskId) {
    return { status: 'error', message: 'タスクIDが指定されていません。' };
  }

  try {
    var task = Tasks.Tasks.get(taskListId, taskId);
    task.status = 'completed';
    Tasks.Tasks.update(task, taskListId, taskId);

    return {
      status: 'success',
      message: 'タスク「' + task.title + '」を完了にしました。'
    };
  } catch (err) {
    return { status: 'error', message: 'Tasks API エラー: ' + err.message };
  }
}


// ============================================================
// ドライブ管理ハンドラー
// ============================================================

function handleSearchDrive(payload) {
  var query = payload.query || '';
  var mimeType = payload.mimeType || '';

  var searchQuery = [];
  if (query) searchQuery.push('title contains "' + query + '"');
  if (mimeType) searchQuery.push('mimeType = "' + mimeType + '"');
  searchQuery.push('trashed = false');

  var files = DriveApp.searchFiles(searchQuery.join(' and '));
  var results = [];
  var count = 0;

  while (files.hasNext() && count < 50) {
    var file = files.next();
    results.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      url: file.getUrl(),
      lastUpdated: file.getLastUpdated().toISOString(),
      size: file.getSize()
    });
    count++;
  }

  return {
    status: 'success',
    message: results.length + '件のファイルが見つかりました。',
    files: results
  };
}

function handleOrganizeDrive(payload) {
  var operations = payload.operations || []; // [{fileId, targetFolderId, action: 'move'|'copy'}]
  var results = [];

  operations.forEach(function(op) {
    try {
      var file = DriveApp.getFileById(op.fileId);
      var folder = DriveApp.getFolderById(op.targetFolderId);

      if (op.action === 'move') {
        file.moveTo(folder);
        results.push({ fileId: op.fileId, status: 'moved' });
      } else if (op.action === 'copy') {
        file.makeCopy(file.getName(), folder);
        results.push({ fileId: op.fileId, status: 'copied' });
      }
    } catch (err) {
      results.push({ fileId: op.fileId, status: 'error', message: err.message });
    }
  });

  return {
    status: 'success',
    message: operations.length + '件のファイル操作を実行しました。',
    details: results
  };
}

function handleShareDriveFile(payload) {
  var fileId = payload.fileId || '';
  var email = payload.email || '';
  var role = payload.role || 'viewer'; // 'viewer' | 'commenter' | 'editor'

  if (!fileId || !email) {
    return { status: 'error', message: 'ファイルIDまたはメールアドレスが指定されていません。' };
  }

  try {
    var file = DriveApp.getFileById(fileId);

    switch (role) {
      case 'editor':
        file.addEditor(email);
        break;
      case 'commenter':
        file.addCommenter(email);
        break;
      default:
        file.addViewer(email);
    }

    return {
      status: 'success',
      message: '「' + file.getName() + '」を ' + email + ' に' + role + '権限で共有しました。'
    };
  } catch (err) {
    return { status: 'error', message: 'ドライブ共有エラー: ' + err.message };
  }
}


// ============================================================
// 自動レポート生成ハンドラー
// ============================================================

function handleGenerateReport(payload) {
  var title = payload.title || '自動生成レポート';
  var format = payload.format || 'document'; // 'document' | 'spreadsheet'
  var sections = payload.sections || [];
  var templateId = payload.templateId || '';

  if (format === 'spreadsheet') {
    var ss = SpreadsheetApp.create(title + ' - レポート');
    var sheet = ss.getActiveSheet();

    sections.forEach(function(section, i) {
      var startRow = (i * 10) + 1;
      sheet.getRange(startRow, 1).setValue(section.heading || '');
      sheet.getRange(startRow, 1).setFontWeight('bold').setFontSize(14);

      if (section.tableData) {
        var dataStartRow = startRow + 1;
        section.tableData.forEach(function(row, j) {
          row.forEach(function(cell, k) {
            sheet.getRange(dataStartRow + j, k + 1).setValue(cell);
          });
        });
      }
    });

    return {
      status: 'success',
      message: 'レポート（スプレッドシート）「' + title + '」を作成しました。',
      url: ss.getUrl()
    };
  } else {
    // ドキュメント形式
    var doc;
    if (templateId) {
      var template = DriveApp.getFileById(templateId);
      var copy = template.makeCopy(title + ' - レポート');
      doc = DocumentApp.openById(copy.getId());
    } else {
      doc = DocumentApp.create(title + ' - レポート');
    }

    var body = doc.getBody();

    // タイトル
    var titleParagraph = body.insertParagraph(0, title);
    titleParagraph.setHeading(DocumentApp.ParagraphHeading.TITLE);

    // 生成日時
    var dateParagraph = body.appendParagraph('生成日時: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm'));
    dateParagraph.setForegroundColor('#666666');

    body.appendHorizontalRule();

    sections.forEach(function(section) {
      if (section.heading) {
        var heading = body.appendParagraph(section.heading);
        heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      }
      if (section.body) {
        body.appendParagraph(section.body);
      }
      if (section.bullets) {
        section.bullets.forEach(function(bullet) {
          body.appendListItem(bullet).setGlyphType(DocumentApp.GlyphType.BULLET);
        });
      }
    });

    doc.saveAndClose();

    return {
      status: 'success',
      message: 'レポート（ドキュメント）「' + title + '」を作成しました。',
      url: doc.getUrl()
    };
  }
}


// ============================================================
// スキル保存ハンドラー
// ============================================================

function handleSaveSkill(payload) {
  var fileName = payload.fileName || 'new-skill.md';
  var content = payload.content || '';

  // スキルファイルをGoogleドライブに保存
  var folder;
  var folders = DriveApp.getFoldersByName('Melonpan-Skills');
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder('Melonpan-Skills');
  }

  var file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);

  return {
    status: 'success',
    message: 'スキル「' + fileName + '」をGoogleドライブに保存しました。',
    fileUrl: file.getUrl()
  };
}
