---
name: ドライブファイル管理
description: Googleドライブのファイル検索・整理（移動・コピー）・共有権限変更をCanvas + GASで行うスキル。MIMEタイプや検索キーワードでファイルを絞り込み、一括操作にも対応する。
triggers:
  - ユーザーが「ドライブのファイルを検索して」「〜というファイルを探して」と指示したとき
  - ユーザーが「ファイルを〜フォルダに移動して」「ファイルをコピーして」と指示したとき
  - ユーザーが「ファイルの共有設定を変更して」「〜に共有して」と指示したとき
  - ユーザーが「ドライブを整理して」「ファイルを一覧して」と指示したとき
negative_triggers:
  - Google Driveではなくローカルファイルの操作を求めているとき
  - ファイルの中身（テキスト内容）の編集・書き換えを求めているとき
  - Googleドキュメントやスプレッドシートの新規作成のみを求めているとき（auto-reportスキルの範囲）
---

# ドライブファイル管理

## When to Use

- ユーザーがGoogleドライブ内のファイルをキーワードやMIMEタイプで検索し、結果を一覧で確認したいとき。
- ユーザーがファイルを別のフォルダに移動・コピーして整理したいとき。
- ユーザーがファイルの共有権限を変更したいとき（閲覧者・編集者の追加、リンク共有の設定など）。

## Process

1. **検索条件の収集**
   - ユーザーから検索キーワード、対象のMIMEタイプ（ドキュメント、スプレッドシート、PDF、画像など）、フォルダ指定などの条件を受け取る。
   - 条件が不明確な場合はユーザーに確認を求めるか、全ファイル検索をデフォルトとする。

2. **ドライブ検索の実行**
   - GAS Web Appに `action: "search_drive"` をリクエストし、Google Drive APIを用いてファイル一覧を取得する。
   - 取得失敗時は「Googleドライブの検索に失敗しました。」とユーザーに通知する。

3. **Canvasの生成**
   - `templates/drive-manager-template.html` を利用してファイル管理ダッシュボードをCanvasとして生成する。
   - 検索UI、検索結果リスト、各ファイルへのアクション（移動・コピー・共有）ボタンを提供する。

4. **ユーザー操作の処理**
   - **ファイル整理**: ユーザーがファイルを選択し、移動先フォルダIDを指定して「移動」を押すと `action: "organize_drive"` をPOSTする。
   - **共有設定**: ユーザーがファイルを選択し、共有先メールアドレスとロール（viewer/editor）を指定して「共有」を押すと `action: "share_drive_file"` をPOSTする。
   - Canvas生成後は、ユーザーの要望に応じて `extractedData` オブジェクトのみを更新する。

## Guidelines

- **extractedData の排他的更新**: extractedData オブジェクト以外のコードの編集を禁止します。一度Canvasを生成した後は、extractedData オブジェクトのみを更新してください。
- **MIMEタイプの正確な指定**: 検索条件に含めるMIMEタイプは Google Drive API 仕様に準拠した値を使用してください（例: `application/vnd.google-apps.document`, `application/pdf`）。
- **入力バリデーション**: 共有先メールアドレスの形式チェックを行い、不正な形式の場合はエラーを表示してください。
- **禁止事項**: ユーザーの明示的な確認なしにファイルの完全削除（ゴミ箱を経由しない削除）を行わないでください。移動・コピーは確認なしでも許可します。
- **ファイルサイズの表示**: ファイルサイズはバイト数をKB/MB/GBに適切に変換して表示してください。

## Decision Examples

1. **ユーザー入力**: 「先月作ったスプレッドシートを全部探して」
   - **AIの判断**: `search_drive` で `mimeType: "application/vnd.google-apps.spreadsheet"` かつ作成日が先月の範囲でフィルタリングする。
   - **理由**: MIMEタイプと日付範囲の2つの条件を組み合わせた検索が必要。

2. **ユーザー入力**: 「プロジェクトAのフォルダにあるPDFを田中さんに共有して」
   - **AIの判断**: まず `search_drive` で「プロジェクトA」フォルダ内のPDFを検索し、次に `share_drive_file` で田中さんのメールアドレスを確認して共有設定を行う。
   - **理由**: 検索→共有の2段階の操作が必要。メールアドレスが不明な場合はユーザーに確認。

3. **ユーザー入力**: 「デスクトップのファイルをドライブに整理して」
   - **AIの判断**: このスキルの対象外と判断し、「ローカルファイルのアップロードはこのスキルの範囲外です。Googleドライブ内のファイル整理をお手伝いできます。」と回答する。
   - **理由**: negative_triggersに該当するローカルファイル操作の要求。

4. **ユーザー入力**: 「古いファイルを全部削除して」
   - **AIの判断**: 「ファイルの削除は重大な操作です。対象ファイルの一覧をまず確認しますか？」と確認を求める。
   - **理由**: 禁止事項に該当する一括削除。まず一覧表示してから個別確認を促す。

5. **ユーザー入力**: 「会議資料をまとめているフォルダを教えて」
   - **AIの判断**: `search_drive` でキーワード「会議資料」を使ってフォルダ（`mimeType: "application/vnd.google-apps.folder"`）を検索する。
   - **理由**: ファイルではなくフォルダの検索要求と判断。

## Error Handling

| エラーケース | 対処法 |
|---|---|
| GAS Web Appへの接続タイムアウト | 「接続がタイムアウトしました。再度お試しください。」とユーザーに通知 |
| Google Drive APIの認証エラー | 「Googleドライブへのアクセス権限がありません。GASのデプロイ設定を確認してください。」と通知 |
| 検索結果が0件 | 「条件に一致するファイルが見つかりませんでした。キーワードやフィルター条件を変更してお試しください。」と表示 |
| 移動先フォルダIDが不正 | 「指定されたフォルダが見つかりません。フォルダIDを確認してください。」と通知 |
| 共有先メールアドレスが不正 | Canvas上でバリデーションエラーを表示し、正しいメールアドレスの入力を促す |
| ファイルへのアクセス権限不足 | 「このファイルへのアクセス権限がありません。ファイルのオーナーに権限を確認してください。」と通知 |
| 検索結果が大量（100件超） | 最初の100件のみ表示し、「結果が多数あります。検索条件を絞り込んでください。」と案内 |

## GAS Backend

```javascript
function doPost(e) {
  var data = JSON.parse(e.parameter.payload);

  switch (data.action) {
    case "search_drive":
      return searchDrive(data);
    case "organize_drive":
      return organizeDrive(data);
    case "share_drive_file":
      return shareDriveFile(data);
    default:
      return ContentService.createTextOutput("Unknown action");
  }
}

function searchDrive(data) {
  var queryParts = [];
  if (data.keyword) {
    queryParts.push("name contains '" + data.keyword.replace(/'/g, "\\'") + "'");
  }
  if (data.mimeType) {
    queryParts.push("mimeType = '" + data.mimeType + "'");
  }
  if (data.folderId) {
    queryParts.push("'" + data.folderId + "' in parents");
  }
  queryParts.push("trashed = false");

  var query = queryParts.join(" and ");
  var files = Drive.Files.list({
    q: query,
    maxResults: 100,
    fields: "items(id,title,mimeType,fileSize,createdDate,modifiedDate,owners,alternateLink,iconLink)"
  });

  var result = (files.items || []).map(function(f) {
    return {
      id: f.id,
      name: f.title,
      mimeType: f.mimeType,
      size: f.fileSize || 0,
      createdAt: f.createdDate,
      modifiedAt: f.modifiedDate,
      owner: f.owners && f.owners.length > 0 ? f.owners[0].displayName : "",
      url: f.alternateLink,
      iconUrl: f.iconLink
    };
  });

  return ContentService.createTextOutput(JSON.stringify({ success: true, files: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function organizeDrive(data) {
  // data.operation: "move" or "copy"
  // data.fileId, data.targetFolderId
  if (data.operation === "move") {
    var file = Drive.Files.get(data.fileId);
    Drive.Files.update(file, data.fileId, null, {
      addParents: data.targetFolderId,
      removeParents: file.parents.map(function(p) { return p.id; }).join(",")
    });
  } else if (data.operation === "copy") {
    Drive.Files.copy({ title: data.newName || "コピー", parents: [{ id: data.targetFolderId }] }, data.fileId);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function shareDriveFile(data) {
  // data.fileId, data.email, data.role ("reader" or "writer")
  Drive.Permissions.insert({
    value: data.email,
    type: "user",
    role: data.role || "reader"
  }, data.fileId, { sendNotificationEmails: true });

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  searchQuery: {
    keyword: "検索キーワード",
    mimeType: "",               // MIMEタイプフィルター（空文字で全種類）
    folderId: ""                // フォルダID（空文字でルート）
  },
  files: [
    {
      id: "ファイルID",
      name: "ファイル名",
      mimeType: "application/vnd.google-apps.document",
      size: 1024,               // バイト数
      modifiedAt: "2026-05-20T10:00:00Z",
      owner: "オーナー名",
      url: "https://docs.google.com/..."
    }
  ]
};
```

## Templates

- [ドライブファイル管理テンプレート](./templates/drive-manager-template.html)
