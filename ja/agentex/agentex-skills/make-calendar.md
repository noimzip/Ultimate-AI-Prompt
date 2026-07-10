---
name: カレンダー作成
description: 新規カレンダーの作成と予定の登録を行うスキル。GWS連携では不可能な「新規カレンダー作成」が必要な場合のみ使用する。
triggers:
  - ユーザーが「新規カレンダーを作成」「〜というカレンダーを作成」と明示的に指示したとき
  - ユーザーが複数のイベント情報を渡し、「新しいカレンダーにまとめて」と指示したとき
negative_triggers:
  - 既存カレンダーへの通常の予定登録（GWS連携で完結させるため発火させない）
---

# カレンダー作成

## When to Use

- ユーザーが新しいカレンダーを作成したいとき
- ユーザーが画像、PDF、テキストなどの資料から複数の予定を抽出し、新しいカレンダーとしてまとめたいとき

## Process

1. **入力の受け取りと検証**
   1. ユーザーのイベント、日程、詳細などが乗った画像、PDF、テキストなどを受け取る。
   2. 入力ファイルの形式を確認する（画像: jpg/png/webp、PDF、テキスト: txt/md/csv など）。
   3. ファイルが読み取れない、または空の場合は「ファイルの内容を読み取れませんでした。別の形式で再アップロードしてください」とユーザーに通知する。

2. **予定情報の抽出**
   1. 資料から予定（タイトル、開始日時、終了日時、備考）を抽出する。
   2. 日時が曖昧な場合（例:「来週の月曜」「午後」など）は、現在日時を基準に具体的な日時に変換する。
   3. 情報が不足している場合は推測するか、ユーザーに質問する。
   4. **フォールバック**: 抽出結果が0件の場合、「予定を検出できませんでした。手動で情報を入力してください」と案内する。

3. **カレンダーメタ情報の設定**
   1. ユーザーのプロンプトに従って、カレンダーのタイトル（`calName`）や説明（`desc`）を設定する。
   2. タイトルが指示されていない場合は、抽出した予定の内容から適切なタイトルを自動生成する（例:「2024年度チームミーティング」）。
   3. **フォールバック**: タイトルの自動推測が困難な場合は「新規カレンダー」をデフォルト名として設定し、ユーザーに確認を求める。

4. **Canvasダッシュボードの生成**
   1. 抽出した情報をもとに、テンプレートを使用してカレンダー作成ダッシュボードをCanvasとして生成する。
   2. Canvas生成前にイベント数が50件を超える場合は、パフォーマンスへの影響を警告し、分割を提案する。
   3. **フォールバック**: テンプレートの読み込みに失敗した場合は、代替としてコードブロック形式で `extractedData` をユーザーに提示する。

5. **Canvas生成後の編集**
   1. Canvas生成後は、ユーザーの要望に応じて `extractedData` オブジェクトのみを更新し、内容の編集・追加・削除を行う。
   2. 変更内容の差分をユーザーに簡潔に説明する（例:「3件の予定を追加しました」）。

## Guidelines

### 基本ルール
- extractedData オブジェクト以外のコードの編集を禁止します。
- 一度Canvasを生成した後は、再生成の時間を削減するために extractedData オブジェクトのみを更新してください。
- プロンプトに詳細情報が含まれていない場合は、デフォルト値の使用または、抽出した情報をもとに適切な値を推測して使用してください。
- 予定の抽出が難しい場合は、ユーザーに追加情報を求めるプロンプトを生成してください。
- 予定の開始日時と終了日時が不明な場合は、ユーザーに確認するプロンプトを生成してください。

### 入力バリデーションルール
- **日付フォーマットの厳守**: `start` と `end` の日時は必ずHTMLの `datetime-local` に適した `YYYY-MM-DDTHH:mm` 形式（例: `2024-03-15T10:00`）で設定してください。
- **タイトル文字数制限**: `calName` は最大100文字以内としてください。超過する場合は適切に短縮してください。
- **イベントタイトル必須**: 各イベントの `title` は空文字にしないでください。内容が不明な場合は「（無題の予定）」を設定してください。
- **時系列の整合性**: `start` は必ず `end` よりも前の日時でなければなりません。終日イベントの場合は `start` と `end` を同日の `00:00` と `23:59` に設定してください。
- **過去日時の確認**: イベントの日時が過去の場合、ユーザーに「この日時は過去です。そのまま登録しますか？」と確認してください。

### 禁止事項
- Canvas HTML テンプレートの構造変更（スタイル、スクリプト、DOM構造の書き換え）
- `extractedData` 以外のJavaScript変数やHTML要素の直接操作
- ユーザーの明示的な許可なく、既存カレンダーへの統合操作を行うこと
- 50件を超えるイベントの一括登録（パフォーマンス上の理由）

## Decision Examples

| # | ユーザー入力 | AIの判断 | 理由 |
|---|---|---|---|
| 1 | 「この画像の予定表をカレンダーにまとめて」 | スキル発火 → 画像OCR → 予定抽出 → Canvas生成 | 画像から複数予定を抽出して新規カレンダーを作成する明示的要求 |
| 2 | 「明日の会議をカレンダーに追加して」 | **発火しない** → GWS連携にリダイレクト | 既存カレンダーへの単一予定追加であり、GWS連携の範囲 |
| 3 | 「旅行用のカレンダーを新しく作って、5/1〜5/5の日程を入れて」 | スキル発火 → 情報をもとにCanvas生成 | 「新しく作って」が新規カレンダー作成を明示している |
| 4 | 「このPDFのセミナー日程をカレンダーにして。タイトルは『研修スケジュール』で」 | スキル発火 → PDF解析 → calName=「研修スケジュール」で生成 | PDFからの複数予定抽出 + カレンダータイトル指定あり |
| 5 | 「カレンダーの3番目の予定の時間を14:00に変更して」 | Canvas上の `extractedData` を部分更新 | 既にCanvas生成済みのため、該当イベントの `start` のみ修正 |

## Error Handling

| # | エラーケース | 検出方法 | 対処法 |
|---|---|---|---|
| 1 | アップロードされたファイルが破損・読み取り不能 | ファイル内容が空、またはパースエラー発生 | 「ファイルを読み取れませんでした。別の形式（PNG、テキスト等）で再度アップロードしてください」と案内 |
| 2 | 予定の抽出結果が0件 | `events` 配列が空 | 「予定情報を検出できませんでした。画像が鮮明か確認するか、テキスト形式で情報を入力してください」と案内 |
| 3 | 日時フォーマットが不正 | `YYYY-MM-DDTHH:mm` パターンに合致しない | AIが正しいフォーマットに自動補正し、補正内容をユーザーに通知する |
| 4 | `start` が `end` より後の日時 | 日時比較チェック | 値を入れ替えて修正し、「開始と終了が逆転していたため修正しました」と通知 |
| 5 | イベント数が50件を超過 | `events.length > 50` | 「イベント数が多いため、複数カレンダーに分割することをお勧めします」と提案。ユーザー承諾後に分割処理 |
| 6 | GASバックエンドへの通信失敗 | fetch の HTTP ステータスが 200 以外 | 「サーバーとの通信に失敗しました。しばらく待ってから再度お試しください」とダッシュボード上に表示 |
| 7 | カレンダーAPIのクォータ超過 | GAS側で `Exception: Rate Limit Exceeded` | 「Google APIの利用制限に達しました。数分後に再試行してください」と表示 |

## Data Structure

更新対象の `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  calName: "カレンダーのタイトル",
  desc: "カレンダーの説明",
  events: [
    { title: "予定のタイトル", start: "2024-04-01T10:00", end: "2024-04-01T12:00", description: "備考詳細" }
  ]
};
```

## GAS Backend

Canvas上の「登録」ボタン押下時に呼び出されるGoogle Apps Script（GAS）のサーバーサイド処理です。新規カレンダーの作成とイベントの一括登録を行います。

### カレンダー作成 & イベント登録エンドポイント

```javascript
/**
 * doPost - Canvas ダッシュボードからのPOSTリクエストを処理する
 * リクエストBody: { calName: string, desc: string, events: Array }
 * レスポンス: { status: "ok" | "error", calendarId?: string, message?: string }
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var calName = data.calName || "新規カレンダー";
    var desc = data.desc || "";
    var events = data.events || [];

    // 入力バリデーション
    if (!Array.isArray(events) || events.length === 0) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "イベントが空です" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (events.length > 50) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "イベント数が上限(50件)を超えています" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 新規カレンダーを作成
    var newCal = CalendarApp.createCalendar(calName, { description: desc });
    var calendarId = newCal.getId();

    // イベントを一括登録
    events.forEach(function (ev) {
      var startTime = new Date(ev.start);
      var endTime = new Date(ev.end);

      // start > end の場合はスワップ
      if (startTime > endTime) {
        var tmp = startTime;
        startTime = endTime;
        endTime = tmp;
      }

      newCal.createEvent(
        ev.title || "(無題の予定)",
        startTime,
        endTime,
        { description: ev.description || "" }
      );
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", calendarId: calendarId })
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
2. 上記コードを `Code.gs` に貼り付ける。
3. 「デプロイ」→「新しいデプロイ」→ 種類を「ウェブアプリ」に設定。
4. 「アクセスできるユーザー」を「自分のみ」に設定し、デプロイする。
5. 生成されたウェブアプリURLをCanvasテンプレートの `GAS_ENDPOINT` 定数に設定する。

## Templates

- [カレンダー作成ダッシュボードテンプレート](./templates/calendar-dashboard-template.html)