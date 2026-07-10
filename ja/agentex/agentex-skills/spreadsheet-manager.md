---
name: Googleスプレッドシート操作
description: Googleスプレッドシートの新規作成、既存シートの読み込み、セルデータの編集・更新をCanvas + GASで行うスキル。
triggers:
  - ユーザーが「スプレッドシートを作成して」「シートを作って」「表を作成して」と指示したとき
  - ユーザーが「スプレッドシートを読み込んで」「シートの内容を確認して」と既存シートの閲覧を求めたとき
  - ユーザーが「シートを更新して」「データを編集して」と既存シートの編集を求めたとき
  - CSVデータやテーブル形式のデータをスプレッドシートに変換したいとき
negative_triggers:
  - Googleドキュメントやスライドの作成・編集（別スキルで対応）
  - スプレッドシートに関連しない単純なテキスト処理やファイル変換
  - Google Formsの作成や集計
---

# Googleスプレッドシート操作

## When to Use

- ユーザーがGoogleスプレッドシートを新規作成し、ヘッダーとデータ行を設定したいとき。
- 既存のスプレッドシートIDを指定して内容を読み込み、確認・編集したいとき。
- CSVやテーブル形式のデータを整理してスプレッドシートとして出力したいとき。

## Process

1. **意図の判別**: ユーザーの指示が「新規作成」「読み込み」「編集・更新」のいずれかを判別する。
   - 「表を作って」「スプレッドシートを新規作成」→ `create_spreadsheet`
   - 「シートの内容を見せて」「このIDのシートを読み込んで」→ `read_spreadsheet`
   - 「データを更新して」「行を追加して」→ `update_spreadsheet`
2. **データの構造化**: ユーザーが提供したテキスト、CSV、画像等からシート名、ヘッダー列、行データを抽出・整理する。
   - 情報が不足する場合はユーザーに質問し、最低限「シート名」と「ヘッダー」を確定させる。
   - 既存シートの読み込み時はスプレッドシートIDが必須。IDが不明な場合はユーザーに確認する。
3. **Canvas生成**: 抽出したデータを `extractedData` に格納し、`templates/spreadsheet-manager-template.html` を利用してスプレッドシート管理ダッシュボードをCanvasとして生成する。
4. **ユーザー編集**: Canvas上でヘッダーの変更、行の追加・削除・編集をリアルタイムで行えるようにする。
5. **GAS送信**: ユーザーが「実行」ボタンを押すと、actionパラメータ付きのデータがGAS Web Appに送信される。

## Guidelines

- **extractedData のみ更新**: 一度Canvasを生成した後は `extractedData` オブジェクトのみを更新し、HTML/CSS/JSの再生成は行わないでください。
- **ヘッダーの一意性**: ヘッダー列名は重複しないよう設定してください。重複がある場合は末尾に連番を付与してください（例: `名前`, `名前_2`）。
- **データ型の推定**: 数値・日付・テキストなどのデータ型を自動推定し、適切なフォーマットで格納してください。
- **行数の上限**: Canvas上での表示パフォーマンスを考慮し、初回表示時のデータ行は最大100行までとしてください。100行を超える場合はユーザーに通知してください。
- **スプレッドシートIDのバリデーション**: 読み込み・更新時のスプレッドシートIDは44文字の英数字+ハイフン+アンダースコアで構成されます。形式が不正な場合はエラーメッセージを表示してください。

## Decision Examples

1. **ユーザー入力**: 「売上データの表を作って。列は商品名、数量、単価、合計で」
   → **AIの判断**: `create_spreadsheet` アクション。ヘッダーを `["商品名", "数量", "単価", "合計"]` に設定し、空のデータ行を1行追加した状態でCanvas生成。
   → **理由**: 新規作成の指示であり、ヘッダー情報が明示されている。

2. **ユーザー入力**: 「このスプレッドシートの内容を見せて: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms」
   → **AIの判断**: `read_spreadsheet` アクション。指定IDでシートデータを読み込むCanvasを生成。
   → **理由**: 既存シートの閲覧要求であり、IDが提供されている。

3. **ユーザー入力**: 「さっきのシートに新しい行を追加して、商品Dのデータを入れて」
   → **AIの判断**: `update_spreadsheet` アクション。既存の `extractedData` に新しい行を追加。
   → **理由**: 既存シートへのデータ追加要求。

4. **ユーザー入力**: 「CSVファイルの中身をスプレッドシートにして」
   → **AIの判断**: CSVを解析してヘッダーとデータ行を抽出し、`create_spreadsheet` でCanvas生成。
   → **理由**: CSVからの変換は新規作成に該当する。

## Error Handling

| エラーケース | 対処法 |
|---|---|
| スプレッドシートIDが不正な形式 | 「スプレッドシートIDの形式が正しくありません。URLから正しいIDを取得してください」とユーザーに通知 |
| 読み込み対象のシートにアクセス権がない | GASからの403エラーを検知し、「このスプレッドシートへのアクセス権がありません。共有設定を確認してください」と表示 |
| ヘッダーが未指定 | デフォルトで `["列A", "列B", "列C"]` を仮設定し、ユーザーに変更を促す |
| データ行が空 | 空の1行を自動追加し、Canvas上で入力を促す |
| GAS通信タイムアウト | 「処理がタイムアウトしました。もう一度お試しください」と表示し、リトライボタンを提供 |

## GAS Backend

```javascript
function doPost(e) {
  const data = JSON.parse(e.parameter.payload);

  switch (data.action) {
    case "create_spreadsheet":
      return createSpreadsheet(data);
    case "read_spreadsheet":
      return readSpreadsheet(data);
    case "update_spreadsheet":
      return updateSpreadsheet(data);
  }
}

function createSpreadsheet(data) {
  const ss = SpreadsheetApp.create(data.sheetName);
  const sheet = ss.getActiveSheet();

  // ヘッダー行の設定
  if (data.headers && data.headers.length > 0) {
    sheet.getRange(1, 1, 1, data.headers.length).setValues([data.headers]);
    sheet.getRange(1, 1, 1, data.headers.length)
      .setFontWeight("bold")
      .setBackground("#4285f4")
      .setFontColor("#ffffff");
  }

  // データ行の挿入
  if (data.rows && data.rows.length > 0) {
    sheet.getRange(2, 1, data.rows.length, data.headers.length).setValues(data.rows);
  }

  // 列幅の自動調整
  for (let i = 1; i <= data.headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    spreadsheetId: ss.getId(),
    url: ss.getUrl()
  })).setMimeType(ContentService.MimeType.JSON);
}

function readSpreadsheet(data) {
  const ss = SpreadsheetApp.openById(data.spreadsheetId);
  const sheet = ss.getSheetByName(data.targetSheet) || ss.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    sheetName: sheet.getName(),
    headers: values[0] || [],
    rows: values.slice(1)
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateSpreadsheet(data) {
  const ss = SpreadsheetApp.openById(data.spreadsheetId);
  const sheet = ss.getSheetByName(data.targetSheet) || ss.getActiveSheet();

  // 既存データをクリアして再書き込み
  sheet.clearContents();
  if (data.headers && data.headers.length > 0) {
    sheet.getRange(1, 1, 1, data.headers.length).setValues([data.headers]);
    sheet.getRange(1, 1, 1, data.headers.length)
      .setFontWeight("bold")
      .setBackground("#4285f4")
      .setFontColor("#ffffff");
  }
  if (data.rows && data.rows.length > 0) {
    sheet.getRange(2, 1, data.rows.length, data.headers.length).setValues(data.rows);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    spreadsheetId: ss.getId(),
    url: ss.getUrl()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  action: "create_spreadsheet", // "create_spreadsheet" | "read_spreadsheet" | "update_spreadsheet"
  sheetName: "シート名",
  spreadsheetId: "",            // 読み込み・更新時に使用
  targetSheet: "",              // 対象シートタブ名（省略時はアクティブシート）
  headers: ["列名1", "列名2", "列名3"],
  rows: [
    ["値1-1", "値1-2", "値1-3"],
    ["値2-1", "値2-2", "値2-3"]
  ]
};
```

## Templates

- [スプレッドシート管理ダッシュボードテンプレート](./templates/spreadsheet-manager-template.html)
