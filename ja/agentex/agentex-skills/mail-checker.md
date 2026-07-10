---
name: メール自動確認・返信
description: 新着メールの内容を確認し、AIが重要度の分類と返信文案の作成を行い、ユーザーが編集・送信できるダッシュボード（Canvas）を提供するスキル。
triggers:
  - ユーザーが「未読メールを確認して」「メールチェックして」「新着メールの返信文を作って」などと指示したとき
  - 特定のメールへの自動返信ドラフトの作成を求めているとき
negative_triggers:
  - メールの送受信を伴わない、カレンダーやファイル操作等の指示
---

# メール自動確認・返信

## When to Use

- ユーザーがGmail等の受信トレイを確認し、新着メッセージの要約や重要度の判定を求めるとき。
- ユーザーに代わって新着メールへの返信ドラフトを自動生成し、ブラウザ上で内容を調整・即時送信したいとき。

## Process

1. **メールの取得**
   1. Gmail APIなどから未読メッセージや特定のスレッドを取得する。
   2. 取得対象は、デフォルトで直近24時間以内の未読メール。ユーザーが期間や条件を指定した場合はそれに従う。
   3. 取得件数の上限は20件とする。20件を超える場合は「未読メールが多数あります。最新20件を表示します」と案内する。
   4. **フォールバック**: APIの取得に失敗した場合、「メールの取得に失敗しました。Gmailへのアクセス権限を確認してください」と案内する。

2. **メール内容の解析と分類**
   1. 取得したメールの「送信者」「件名」「本文」「受信時刻」を解析する。
   2. 重要度を以下の基準で分類する：
      - `urgent`（重要・要返信）: 締め切り、予定の調整、トラブル対応、上司・取引先からの個別連絡
      - `normal`（通常）: 一般的な業務連絡、共有事項、社内周知
      - `newsletter`（メルマガ等）: 配信メール、プロモーション、自動通知、noreplyアドレスからの送信
   3. 返信文のドラフトを自動生成する（`urgent` および `normal` のみ。`newsletter` は返信不要）。
   4. **フォールバック**: 重要度の判定が困難な場合は `normal` をデフォルトとし、ユーザーに確認を促す。

3. **Canvasダッシュボードの生成**
   1. 抽出および再構成した情報をもとに、`templates/mail-checker-template.html` を利用してメールダッシュボードをCanvasとして生成する。
   2. ダッシュボード上でメールは重要度順（urgent → normal → newsletter）にソートして表示する。
   3. **フォールバック**: テンプレートの読み込みに失敗した場合、代替としてメール一覧をMarkdownテーブル形式でチャット上に表示する。

4. **ユーザーの操作対応**
   1. Canvas上でユーザーが返信文を調整し、「送信」を押したアクション（Apps ScriptへのPOST等）を受け取って送信を完了する。
   2. 返信文の修正要求があった場合は `extractedData` のみを更新する。
   3. 送信完了後、該当メールの `priority` を `sent` に更新し、ダッシュボード上で視覚的にフィードバックする。

## Guidelines

### 基本ルール
- **ダッシュボードの同期**: メールの追加や削除、ドラフト内容の変更時には、必ず `extractedData` オブジェクトのみを書き換え、HTML全体の再描画を避けてロード時間を短縮してください。
- **敬語と文脈の尊重**: 送信相手の役職や社名（山田様、株式会社Aなど）をメール本文から正確に読み取り、ビジネスに適した適切な敬意を払ったドラフト文を作成してください。
- **重要度の適正評価**: スパムやプロモーションメールを `urgent` に分類しないよう、本文から行動の緊急度（締め切り、予定の調整、トラブル対応など）を的確に抽出してください。

### 入力バリデーションルール
- **メールID必須**: 各メールオブジェクトには一意の `id` を必ず設定すること。重複IDは禁止。
- **返信文の文字数ガイドライン**: `suggestedReply` は原則として500文字以内。長文が必要な場合はユーザーに確認を求める。
- **送信者情報の整合性**: `sender` フィールドには「氏名 (会社名)」形式を維持する。情報が不足している場合はメールアドレスをそのまま使用する。
- **時刻フォーマット**: `time` フィールドは「YYYY/MM/DD HH:mm」形式で統一する。
- **本文のサニタイズ**: `body` フィールドにHTMLタグが含まれる場合はプレーンテキストに変換して格納する。

### 禁止事項
- Canvas HTML テンプレートの構造変更（スタイル、スクリプト、DOM構造の書き換え）
- `extractedData` 以外のJavaScript変数やHTML要素の直接操作
- ユーザーの明示的な承認なくメールを自動送信すること（必ずユーザーのボタン操作を介すること）
- 個人情報（メールアドレス、電話番号等）のログへの出力・外部送信
- `newsletter` 分類のメールに対する返信ドラフトの自動生成

## Decision Examples

| # | ユーザー入力 | AIの判断 | 理由 |
|---|---|---|---|
| 1 | 「未読メールをチェックして」 | スキル発火 → Gmail API取得 → 分類 → Canvas生成 | 未読メール確認の明確な要求 |
| 2 | 「田中さんからのメールに返信して」 | スキル発火 → 該当メール特定 → 返信ドラフト生成 → Canvas上で提示 | 特定メールへの返信ドラフト作成要求 |
| 3 | 「今日のミーティングをカレンダーに追加して」 | **発火しない** → カレンダー系スキルにリダイレクト | メール操作ではなくカレンダー操作の要求 |
| 4 | 「急ぎのメールだけ見せて」 | スキル発火 → 取得 → urgent のみフィルタリング → Canvas表示 | 重要度フィルタリング付きのメール確認要求 |
| 5 | 「返信文の冒頭を『お世話になっております』に変更して」 | Canvas上の `extractedData.mails[n].suggestedReply` を部分更新 | 既にCanvas生成済みのため、特定メールのドラフト文のみ修正 |

## Error Handling

| # | エラーケース | 検出方法 | 対処法 |
|---|---|---|---|
| 1 | Gmail APIへのアクセス権限不足 | API呼び出し時の認証エラー（401/403） | 「Gmailへのアクセスが許可されていません。OAuth認証を再度行ってください」と案内 |
| 2 | 未読メールが0件 | 取得結果が空配列 | 「現在、未読メールはありません」とチャットで通知。Canvas生成は行わない |
| 3 | メール本文の文字化け | デコード後に非表示文字・置換文字が多数検出 | 元のエンコーディングを再判定して変換を試みる。失敗した場合は件名と送信者のみ表示 |
| 4 | 返信送信時のGASエンドポイントエラー | fetch の HTTP ステータスが 200 以外 | 「メールの送信に失敗しました。ネットワーク接続を確認し、再度お試しください」とダッシュボード上に表示 |
| 5 | APIクォータ超過 | GAS側で `Exception: Rate Limit Exceeded` | 「Gmail APIの利用制限に達しました。数分後に再試行してください」と表示 |
| 6 | 重要度分類が不正確（ユーザーから指摘） | ユーザーが分類を手動修正 | 指摘を受けたメールの `priority` を更新し、以降の分類ロジックに反映。「分類を修正しました」と通知 |
| 7 | 返信先アドレスが無効（バウンスメール） | GAS側で送信失敗エラー | 「送信先アドレスが無効のため送信できませんでした。送信先を確認してください」と表示 |

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  mails: [
    {
      id: "メールID",
      sender: "送信者氏名 (会社名)",
      time: "受信時刻/日付",
      subject: "件名",
      snippet: "本文の要約スニペット(1行)",
      body: "メール本文全文",
      priority: "urgent", // "urgent" | "normal" | "newsletter"
      suggestedReply: "AIが生成した返信のドラフト文"
    }
  ]
};
```

## GAS Backend

Canvas上の「送信」ボタン押下時に呼び出されるGoogle Apps Script（GAS）のサーバーサイド処理です。メールの取得と返信送信を行います。

### メール取得エンドポイント

```javascript
/**
 * doGet - 未読メールを取得してJSON形式で返す
 * クエリパラメータ: maxResults (任意, デフォルト20), q (任意, Gmail検索クエリ)
 * レスポンス: { status: "ok" | "error", mails: Array, message?: string }
 */
function doGet(e) {
  try {
    var maxResults = parseInt(e.parameter.maxResults) || 20;
    var query = e.parameter.q || "is:unread";
    var threads = GmailApp.search(query, 0, maxResults);
    var mails = [];

    threads.forEach(function (thread) {
      var messages = thread.getMessages();
      var lastMsg = messages[messages.length - 1];
      mails.push({
        id: lastMsg.getId(),
        sender: lastMsg.getFrom(),
        time: Utilities.formatDate(lastMsg.getDate(), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm"),
        subject: lastMsg.getSubject(),
        snippet: thread.getFirstMessageSubject(),
        body: lastMsg.getPlainBody().substring(0, 2000) // 本文は最大2000文字
      });
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", mails: mails })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 返信送信エンドポイント

```javascript
/**
 * doPost - Canvasからの返信送信リクエストを処理する
 * リクエストBody: { messageId: string, replyBody: string }
 * レスポンス: { status: "ok" | "error", message?: string }
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var messageId = data.messageId;
    var replyBody = data.replyBody;

    // 入力バリデーション
    if (!messageId || !replyBody) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "messageId と replyBody は必須です" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (replyBody.length > 5000) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "返信文が長すぎます（上限5000文字）" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 対象メッセージを取得して返信
    var message = GmailApp.getMessageById(messageId);
    if (!message) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "指定されたメッセージが見つかりません" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    message.reply(replyBody);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", message: "返信を送信しました" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### デプロイ手順

1. [Google Apps Script](https://script.google.com/) で新規プロジェクトを作成する。
2. 上記の `doGet` および `doPost` 関数を `Code.gs` に貼り付ける。
3. 「サービス」から **Gmail API** を有効化する（GmailApp は標準で利用可能だが、高度な検索が必要な場合はAPIサービスを追加）。
4. 「デプロイ」→「新しいデプロイ」→ 種類を「ウェブアプリ」に設定。
5. 「アクセスできるユーザー」を「自分のみ」に設定し、デプロイする。
6. 生成されたウェブアプリURLをCanvasテンプレートの `GAS_ENDPOINT` 定数に設定する。

## Templates

- [メール確認ダッシュボードテンプレート](./templates/mail-checker-template.html)
