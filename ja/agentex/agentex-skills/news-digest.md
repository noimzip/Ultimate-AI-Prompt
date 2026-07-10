---
name: ニュースダイジェスト生成
description: 指定されたテーマやニュースソースから最新の情報を巡回・収集し、AIが要約と主要ポイント（インサイト）を取りまとめたダッシュボード（Canvas）を生成するスキル。
triggers:
  - ユーザーが「今日のニュースをまとめて」「〜についての最新情報を調べてダイジェストを作って」などと指示したとき
  - 特定のトピックに関する複数記事の要約と比較を求めているとき
negative_triggers:
  - 単一のWebページの翻訳や単純なテキスト要約のみを求めているとき
---

# ニュースダイジェスト生成

## When to Use

- ユーザーが特定分野（テクノロジー、ビジネス、市場動向など）のニュースや複数ソースの記事を巡回・収集し、整理されたダイジェストとして把握したいとき。
- 定期的な情報収集タスクとして、複数ニュースの概要とインサイトを視覚的に一覧したいとき。

## Process

1. **トピック受け取りと確認**
   1. ユーザーから対象トピックまたは検索キーワードを受け取る（あるいは定期トリガー）。
   2. キーワードが曖昧な場合は、対象分野・期間・地域をユーザーに確認する。
   3. **フォールバック**: ユーザーが追加情報を提供しない場合は、直近24時間・グローバル範囲のデフォルト設定で進める。

2. **ニュースソースの検索・取得**
   1. Google検索等のツールを用いて複数のニュースソースや記事から最新情報を取得する。
   2. 最低3件、最大10件程度の記事を目標に収集する。
   3. 各ソースのURL・公開日時・メディア名を記録する。
   4. **フォールバック**: 検索結果が0件の場合、検索キーワードを広げて再検索する。それでも取得できない場合は「該当トピックのニュースが見つかりませんでした」とユーザーに通知して中断する。

3. **情報の整理・インサイト作成**
   1. 取得した情報から、タイトル、情報元、要約、およびAIの視点による主要なインサイト（3つの箇条書き）を取りまとめる。
   2. 重複する記事は統合し、異なる視点をインサイトに反映する。
   3. 各記事のIDを一意に振り、`extractedData.articles` 配列に格納する。
   4. **フォールバック**: 記事本文のアクセスがブロックされた場合、検索スニペットと見出しから要約を構成する。

4. **Canvasの生成・描画**
   1. 整理した情報をもとに、`templates/news-digest-template.html` を利用してニュースダイジェスト画面をCanvasとして生成する。
   2. `digestDate` フィールドに取得日（`YYYY-MM-DD`形式）を設定する。
   3. **フォールバック**: テンプレートの読み込みに失敗した場合、プレーンテキスト形式でダイジェスト結果を出力する。

## Guidelines

- **見出しと要約の正確性**: ハルシネーションを防止するため、各ニュースのタイトルや事実関係（日付、企業名、数値など）は必ず検索結果のソースに基づいた事実のみを記載してください。
- **データ更新ルール**: Canvasを一度描画した後は、`extractedData` のみを動的に更新し、HTMLレイアウト全体の再描画は行わないでください。
- **多面的なインサイト**: 単なる事実のコピー＆ペーストではなく、そのニュースが業界やユーザーに与える影響（インサイト）を簡潔に取りまとめてください。
- **入力バリデーション**:
  - トピック文字列が空または空白のみの場合は処理を開始せず、ユーザーにトピックの入力を求めること。
  - `extractedData.articles` 配列の各要素には `id`, `title`, `source`, `time`, `summary`, `keyPoints` の全フィールドが必須。欠落フィールドがある場合は空文字列 `""` を設定する。
  - `keyPoints` は必ず1件以上、最大5件とする。
- **禁止事項**:
  - 検索結果のソースに存在しない事実（数値・人名・企業名）を捏造して記載してはならない。
  - 単一ソースのみに依拠したダイジェストを作成してはならない（最低2ソース以上）。
  - 政治的・宗教的に偏ったインサイトや意見を付加してはならない。
  - HTMLテンプレート（`news-digest-template.html`）の構造やスタイルを改変してはならない。

## Decision Examples

| # | ユーザー入力 | AIの判断 | 理由 |
|---|---|---|---|
| 1 | 「今日のAI関連ニュースをまとめて」 | スキル発動 → "AI" で直近24時間のニュースを検索しダイジェストを生成 | 明確なトピック指定と複数記事の要約要求があるため |
| 2 | 「このURLの記事を翻訳して」 | スキル不発動 → 単一URL翻訳は本スキルの対象外 | negative_trigger に該当。翻訳スキルまたは通常のチャット応答で対応すべき |
| 3 | 「先週のテスラの株価ニュースと市場分析を教えて」 | スキル発動 → "テスラ 株価 市場分析" で過去7日間のニュースを検索 | 特定トピック × 複数記事の要約・比較の要求パターンに合致 |
| 4 | 「最近のニュースなんでもいいからまとめて」 | スキル発動 → トピックを確認する質問を返す（「どの分野に興味がありますか？」） | トピックが曖昧なため、Process 1.2 に従い確認ステップを実行 |
| 5 | 「この記事を3行で要約して」（単一記事URL付き） | スキル不発動 → 単一記事の要約は通常のチャット応答で処理 | 複数ソースの巡回・収集が不要であり、negative_trigger に該当 |

## Error Handling

| # | エラーケース | 原因 | 対処法 |
|---|---|---|---|
| 1 | 検索結果が0件 | キーワードが専門的すぎる、またはトピックがニッチすぎる | キーワードを一般化して再検索する。再度0件なら「ニュースが見つかりませんでした」と通知 |
| 2 | 記事ページへのアクセスがブロック（403/401） | ペイウォールやアクセス制限 | 検索結果のスニペット・見出しのみから要約を構成し、「全文取得不可」をソース名に付記 |
| 3 | テンプレートファイルが見つからない | `templates/news-digest-template.html` が存在しないか、パスが不正 | ユーザーにテンプレート不在を通知し、プレーンテキスト形式で結果を出力する |
| 4 | `extractedData` の構造不正 | フィールドの型ミスや欠落 | 必須フィールドのバリデーションを実施し、欠落フィールドにはデフォルト値を挿入する |
| 5 | 検索APIのレート制限・タイムアウト | 短時間に大量のリクエスト | 5秒間隔をあけてリトライ（最大3回）。解決しない場合はキャッシュ済みの結果で部分的にダイジェストを生成 |

## GAS Backend

以下は、Google Apps Script (GAS) を利用してニュースダイジェストのデータをスプレッドシートに永続化・管理するためのサーバーサイドコードスニペットです。

```javascript
/**
 * ニュースダイジェストデータをスプレッドシートに保存する
 * @param {Object} digestData - extractedData オブジェクト
 * @returns {Object} 保存結果 { success: boolean, savedId: string }
 */
function saveNewsDigest(digestData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('NewsDigest');
  if (!sheet) {
    sheet = ss.insertSheet('NewsDigest');
    sheet.appendRow(['DigestID', 'Date', 'ArticleID', 'Title', 'Source', 'Time', 'Summary', 'KeyPoints', 'CreatedAt']);
  }

  const digestId = Utilities.getUuid();
  const createdAt = new Date().toISOString();

  digestData.articles.forEach(function(article) {
    sheet.appendRow([
      digestId,
      digestData.digestDate,
      article.id,
      article.title,
      article.source,
      article.time,
      article.summary,
      JSON.stringify(article.keyPoints),
      createdAt
    ]);
  });

  return { success: true, savedId: digestId };
}

/**
 * 指定日付のダイジェストを取得する
 * @param {string} targetDate - 対象日付 (YYYY-MM-DD)
 * @returns {Object} digestData オブジェクト
 */
function getNewsDigestByDate(targetDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NewsDigest');
  if (!sheet) return { error: 'シートが見つかりません' };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const articles = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === targetDate) {
      articles.push({
        id: data[i][2],
        title: data[i][3],
        source: data[i][4],
        time: data[i][5],
        summary: data[i][6],
        keyPoints: JSON.parse(data[i][7])
      });
    }
  }

  if (articles.length === 0) return { error: '指定日付のダイジェストが見つかりません' };

  return {
    digestDate: targetDate,
    articles: articles
  };
}

/**
 * Web API エンドポイント (doPost)
 * Canvas からのリクエストを受け取りダイジェストを保存する
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const result = saveNewsDigest(params);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  digestDate: "YYYY-MM-DD",
  articles: [
    {
      id: "一意のID",
      title: "ニュース記事のタイトル",
      source: "情報元・メディア名",
      time: "公開日時（HH:MMなど）",
      summary: "記事全体の要約文（数行）",
      keyPoints: [
        "重要なポイント1",
        "重要なポイント2",
        "重要なポイント3"
      ]
    }
  ]
};
```

## Templates

- [ニュースダイジェストテンプレート](./templates/news-digest-template.html)
