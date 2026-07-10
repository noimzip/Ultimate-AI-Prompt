---
name: 自動レポート生成
description: ユーザーの指示に基づきレポートの構成（タイトル、セクション、表データ）をCanvasで編集し、GAS経由でGoogleドキュメントまたはスプレッドシートとして自動生成するスキル。
triggers:
  - ユーザーが「レポートを作成して」「報告書を自動生成して」と指示したとき
  - ユーザーが「〜のデータをまとめてドキュメントにして」「スプレッドシートで出力して」と指示したとき
  - ユーザーが「テンプレートを使ってレポートを作って」「定型レポートを生成して」と指示したとき
negative_triggers:
  - 既存のドキュメント・スプレッドシートの内容の編集・修正のみを求めているとき
  - プレゼンテーション（スライド）の作成を求めているとき（slide-creatorスキルの範囲）
  - 単純なテキスト要約のみでファイル出力が不要なとき
---

# 自動レポート生成

## When to Use

- ユーザーがデータや情報を整理し、GoogleドキュメントまたはGoogleスプレッドシートとしてレポートを自動生成したいとき。
- ユーザーがレポートのセクション構成（見出し・本文・表データ）をCanvas上で事前に編集・調整したいとき。
- ユーザーが既存のテンプレートIDを指定して、定型レポートを効率的に生成したいとき。

## Process

1. **レポート要件の収集**
   - ユーザーからレポートのタイトル、出力形式（ドキュメント / スプレッドシート）、セクション構成の指示を受け取る。
   - テンプレートIDが指定されている場合はその情報も取得する。
   - 情報が不足している場合はユーザーに質問するか、適切なデフォルト値を使用する。

2. **レポート構成の組み立て**
   - ユーザーの指示やデータを基に、レポートのセクション（見出し・本文・表データ）を構成する。
   - 表データがある場合は、ヘッダー行とデータ行に整形する。
   - 各セクションに適切な見出しレベル（H1/H2/H3）を設定する。

3. **Canvasの生成**
   - `templates/auto-report-template.html` を利用してレポート作成ダッシュボードをCanvasとして生成する。
   - レポートタイトル、出力形式選択、セクション追加・編集・並び替え・削除のUIを提供する。

4. **レポートの生成・出力**
   - ユーザーが「生成」ボタンを押すと、GAS Web Appに `action: "generate_report"` をPOSTし、GoogleドキュメントまたはGoogleスプレッドシートとしてレポートを自動生成する。
   - 生成後、ドキュメントのURLをユーザーに提示する。

## Guidelines

- **extractedData の排他的更新**: extractedData オブジェクト以外のコードの編集を禁止します。一度Canvasを生成した後は、extractedData オブジェクトのみを更新してください。
- **セクション構成の柔軟性**: ユーザーが複数のセクション（見出し+本文+表）を自由に追加・削除・並び替えできるようにしてください。
- **表データの構造**: 表データは `headers`（文字列配列）と `rows`（二次元文字列配列）で管理してください。
- **テンプレートIDの検証**: テンプレートIDが指定された場合、存在確認ができない場合は警告を表示しつつ処理を続行してください。
- **出力形式の適切な選択**: ユーザーが明示的に指定しない場合、テキスト中心のレポートは「ドキュメント」、数値・表データ中心のレポートは「スプレッドシート」をデフォルトとして推奨してください。
- **禁止事項**: 既存のテンプレートファイルの上書き・削除を行わないでください。常に新規ファイルとして生成してください。

## Decision Examples

1. **ユーザー入力**: 「月次売上レポートをスプレッドシートで作って」
   - **AIの判断**: 出力形式を「spreadsheet」に設定し、「月次売上レポート」というタイトルで、売上データの表セクションをメインとしたレポート構成を作成する。
   - **理由**: 「売上」というデータ中心の内容でユーザーが「スプレッドシート」を明示。

2. **ユーザー入力**: 「プロジェクトの進捗報告書をまとめて」
   - **AIの判断**: 出力形式を「document」に設定し、「概要」「進捗状況」「課題と対応策」「今後の予定」などのセクションで構成する。
   - **理由**: 文章中心の報告書のため、ドキュメントがデフォルト。セクション構成は一般的な進捗報告書のテンプレートを適用。

3. **ユーザー入力**: 「テンプレートID xxxxx を使って四半期レポートを作って」
   - **AIの判断**: `templateId: "xxxxx"` を設定し、テンプレートに基づいた構成をCanvasに表示する。
   - **理由**: テンプレートIDの明示的な指定があるため、テンプレートベースの生成を行う。

4. **ユーザー入力**: 「この表をレポートに入れて: 名前, 点数, 評価 / 田中, 85, A / 鈴木, 72, B」
   - **AIの判断**: テーブルセクションを追加し、`headers: ["名前", "点数", "評価"]`, `rows: [["田中", "85", "A"], ["鈴木", "72", "B"]]` として構造化する。
   - **理由**: スラッシュ区切りのテキストを表データとしてパースし構造化。

## Error Handling

| エラーケース | 対処法 |
|---|---|
| GAS Web Appへの接続タイムアウト | 「接続がタイムアウトしました。再度お試しください。」とユーザーに通知 |
| Google Docs/Sheets APIの認証エラー | 「Googleドキュメント/スプレッドシートへのアクセス権限がありません。GASの設定を確認してください。」と通知 |
| テンプレートIDが無効 | 「指定されたテンプレートが見つかりません。テンプレートIDを確認するか、空白のまま新規作成してください。」と通知 |
| レポートタイトルが空 | Canvas上でバリデーションエラーを表示し、タイトル入力を促す |
| セクションが0件 | 「レポートには最低1つのセクションが必要です。セクションを追加してください。」と表示 |
| 表データのヘッダーとデータ列数の不一致 | 自動的に列数を揃え（不足分は空文字で補完）、警告を表示 |
| 生成されたファイルのURLが取得不可 | 「レポートは生成されましたが、URLの取得に失敗しました。Googleドライブで確認してください。」と通知 |

## GAS Backend

```javascript
function doPost(e) {
  var data = JSON.parse(e.parameter.payload);

  switch (data.action) {
    case "generate_report":
      return generateReport(data);
    default:
      return ContentService.createTextOutput("Unknown action");
  }
}

function generateReport(data) {
  if (data.outputFormat === "document") {
    return generateDocReport(data);
  } else {
    return generateSheetReport(data);
  }
}

function generateDocReport(data) {
  var doc;
  if (data.templateId) {
    var template = DriveApp.getFileById(data.templateId);
    var copy = template.makeCopy(data.title);
    doc = DocumentApp.openById(copy.getId());
  } else {
    doc = DocumentApp.create(data.title);
  }

  var body = doc.getBody();

  // テンプレート使用時でない場合、セクションを挿入
  if (!data.templateId) {
    data.sections.forEach(function(section) {
      // 見出しの追加
      var headingStyle;
      switch (section.headingLevel) {
        case 1: headingStyle = DocumentApp.ParagraphHeading.HEADING1; break;
        case 2: headingStyle = DocumentApp.ParagraphHeading.HEADING2; break;
        case 3: headingStyle = DocumentApp.ParagraphHeading.HEADING3; break;
        default: headingStyle = DocumentApp.ParagraphHeading.HEADING2;
      }
      body.appendParagraph(section.heading).setHeading(headingStyle);

      // 本文の追加
      if (section.body) {
        body.appendParagraph(section.body);
      }

      // 表データの追加
      if (section.tableData && section.tableData.headers && section.tableData.headers.length > 0) {
        var allRows = [section.tableData.headers].concat(section.tableData.rows || []);
        var table = body.appendTable(allRows);
        // ヘッダー行のスタイル設定
        var headerRow = table.getRow(0);
        for (var i = 0; i < headerRow.getNumCells(); i++) {
          headerRow.getCell(i).setBackgroundColor("#4285f4");
          headerRow.getCell(i).editAsText().setForegroundColor("#ffffff").setBold(true);
        }
      }
    });
  }

  doc.saveAndClose();

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    fileId: doc.getId(),
    url: doc.getUrl(),
    type: "document"
  })).setMimeType(ContentService.MimeType.JSON);
}

function generateSheetReport(data) {
  var ss;
  if (data.templateId) {
    var template = DriveApp.getFileById(data.templateId);
    var copy = template.makeCopy(data.title);
    ss = SpreadsheetApp.openById(copy.getId());
  } else {
    ss = SpreadsheetApp.create(data.title);
  }

  var sheetIndex = 0;
  data.sections.forEach(function(section) {
    var sheet;
    if (sheetIndex === 0) {
      sheet = ss.getSheets()[0];
      sheet.setName(section.heading || "Sheet1");
    } else {
      sheet = ss.insertSheet(section.heading || ("Sheet" + (sheetIndex + 1)));
    }

    var currentRow = 1;

    // 見出しの追加
    sheet.getRange(currentRow, 1).setValue(section.heading).setFontWeight("bold").setFontSize(14);
    currentRow += 2;

    // 本文の追加
    if (section.body) {
      sheet.getRange(currentRow, 1).setValue(section.body);
      currentRow += 2;
    }

    // 表データの追加
    if (section.tableData && section.tableData.headers && section.tableData.headers.length > 0) {
      var headers = section.tableData.headers;
      var rows = section.tableData.rows || [];

      sheet.getRange(currentRow, 1, 1, headers.length).setValues([headers])
        .setFontWeight("bold").setBackground("#4285f4").setFontColor("#ffffff");
      currentRow++;

      if (rows.length > 0) {
        sheet.getRange(currentRow, 1, rows.length, headers.length).setValues(rows);
      }
    }

    sheetIndex++;
  });

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    fileId: ss.getId(),
    url: ss.getUrl(),
    type: "spreadsheet"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  title: "レポートのタイトル",
  outputFormat: "document",         // "document" | "spreadsheet"
  templateId: "",                   // テンプレートID（空文字で新規作成）
  sections: [
    {
      id: "セクションID",
      heading: "セクションの見出し",
      headingLevel: 2,              // 1 | 2 | 3
      body: "セクションの本文テキスト",
      tableData: {                  // 表データ（オプション）
        headers: ["列名1", "列名2", "列名3"],
        rows: [
          ["値1-1", "値1-2", "値1-3"],
          ["値2-1", "値2-2", "値2-3"]
        ]
      }
    }
  ]
};
```

## Templates

- [レポート生成ダッシュボードテンプレート](./templates/auto-report-template.html)
