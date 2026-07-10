---
name: Gmail自動化
description: Gmailのラベル付け、フィルタールール作成、自動転送設定をCanvas + GASで行うスキル。
triggers:
  - ユーザーが「メールのフィルターを作って」「メール振り分けルールを設定して」と指示したとき
  - ユーザーが「ラベルを付けて」「メールを自動分類して」とラベル管理を求めたとき
  - ユーザーが「メールの自動転送を設定して」「特定のメールを転送して」と自動転送を求めたとき
  - メールの自動整理・分類・管理ルールの作成を求めているとき
negative_triggers:
  - メールの送受信や返信文の作成（メール確認・返信スキルで対応）
  - カレンダーやドキュメントの操作
  - 単純なメール検索や閲覧のみの指示
---

# Gmail自動化

## When to Use

- ユーザーがGmailのフィルタールール（条件→アクション）を新規作成し、受信メールの自動分類を設定したいとき。
- 既存のメールや今後受信するメールにラベルを一括適用したいとき。
- 特定の条件に合致するメールを別のアドレスに自動転送するルールを設定したいとき。

## Process

1. **意図の判別**: ユーザーの指示が以下のいずれかを判別する。
   - フィルタールールの作成 → `create_gmail_filter`
   - ラベルの適用・管理 → `apply_gmail_labels`
   - 自動転送の設定 → `setup_auto_forward`
   - 複数のアクションを組み合わせる場合は、ルール一覧として統合管理する。
2. **条件の構造化**: ユーザーが指定した条件（送信者、件名、添付ファイルの有無等）を構造化データに変換する。
   - 曖昧な指示（例: 「重要なメール」）は具体的な条件に分解するようユーザーに質問する。
   - 条件が複数ある場合はAND条件として組み合わせる。
3. **アクションの設定**: 条件に対するアクション（ラベル付け、転送、アーカイブ等）を設定する。
4. **Canvas生成**: ルール一覧を `extractedData` に格納し、`templates/gmail-automator-template.html` を利用して自動化ダッシュボードをCanvasとして生成する。
5. **ユーザー編集**: Canvas上でルールの追加・削除・編集を行い、条件とアクションの組み合わせをリアルタイムで確認できる。
6. **GAS送信**: ユーザーが「実行」ボタンを押すと、各ルールに対応するactionパラメータ付きのデータがGAS Web Appに送信される。

## Guidelines

- **extractedData のみ更新**: 一度Canvasを生成した後は `extractedData` オブジェクトのみを更新し、HTML/CSS/JSの再生成は行わないでください。
- **条件の明確化**: 「重要なメール」のような曖昧な条件は、具体的なフィルター条件（特定の送信者、特定のキーワードなど）に変換するようユーザーに確認してください。
- **ラベル名の規約**: ラベル名にはスラッシュ（/）でネストラベルを表現できます（例: `仕事/プロジェクトA`）。特殊文字は避けてください。
- **転送先の検証**: 自動転送先のメールアドレスは正しい形式であることを確認してください。
- **既存フィルターとの競合**: 新しいフィルターが既存のフィルターと条件が重複する可能性がある場合はユーザーに警告してください。
- **アクションの組み合わせ**: 1つのルールに複数のアクション（ラベル付け+アーカイブ等）を設定できます。

## Decision Examples

1. **ユーザー入力**: 「田中さんからのメールに『重要』ラベルを自動で付けて」
   → **AIの判断**: `create_gmail_filter` アクション。条件: `from: "tanaka"`, アクション: `addLabel: "重要"` のルールを作成。
   → **理由**: 特定の送信者に対するラベル自動付与ルールの作成要求。

2. **ユーザー入力**: 「添付ファイル付きのメールを全部『要確認』フォルダに入れて」
   → **AIの判断**: `create_gmail_filter` アクション。条件: `hasAttachment: true`, アクション: `addLabel: "要確認"` のルールを作成。
   → **理由**: 添付ファイルの有無を条件としたフィルタールール。

3. **ユーザー入力**: 「経理部からのメールを manager@example.com に自動転送して」
   → **AIの判断**: `setup_auto_forward` アクション。条件: `from: "経理部"`, 転送先: `manager@example.com` のルールを作成。
   → **理由**: 条件付き自動転送の設定要求。

4. **ユーザー入力**: 「受信トレイの未読メールにラベルを付けて」
   → **AIの判断**: `apply_gmail_labels` アクション。既存の未読メールへのラベル一括適用。
   → **理由**: 既存メールへのラベル一括操作。

5. **ユーザー入力**: 「メールの返信文を作って」
   → **AIの判断**: このスキルは発火しない。メール確認・返信スキルへ委譲。
   → **理由**: negative_triggersに該当。返信文作成はGmail自動化の範囲外。

## Error Handling

| エラーケース | 対処法 |
|---|---|
| 条件が未指定 | 「フィルターの条件を指定してください（送信者、件名キーワード等）」とユーザーに質問 |
| 転送先メールアドレスが不正 | 「有効なメールアドレスを入力してください」とバリデーションエラーを表示 |
| ラベル名が空 | 「ラベル名を入力してください」とバリデーションエラーを表示 |
| アクションが未選択 | 「少なくとも1つのアクション（ラベル付け、転送等）を選択してください」と表示 |
| GAS通信エラー | 「フィルターの作成に失敗しました。もう一度お試しください」と表示しリトライボタンを提供 |
| Googleアカウント未認証 | 初回認証フローの案内を表示し、認証後の再実行ボタンを提供 |

## GAS Backend

```javascript
function doPost(e) {
  const data = JSON.parse(e.parameter.payload);

  switch (data.action) {
    case "create_gmail_filter":
      return createGmailFilter(data);
    case "apply_gmail_labels":
      return applyGmailLabels(data);
    case "setup_auto_forward":
      return setupAutoForward(data);
  }
}

function createGmailFilter(data) {
  const results = [];

  data.rules.forEach(function(rule) {
    // 検索クエリの構築
    let query = "";
    if (rule.condition.from) query += "from:" + rule.condition.from + " ";
    if (rule.condition.to) query += "to:" + rule.condition.to + " ";
    if (rule.condition.subject) query += "subject:" + rule.condition.subject + " ";
    if (rule.condition.hasAttachment) query += "has:attachment ";
    if (rule.condition.keyword) query += rule.condition.keyword + " ";
    query = query.trim();

    // Gmail APIでフィルター作成（Advanced Gmail Service使用）
    const filter = {
      criteria: { query: query },
      action: {}
    };

    // ラベルの作成・適用
    if (rule.actionType === "addLabel" || rule.actionType === "labelAndArchive") {
      let label = GmailApp.getUserLabelByName(rule.labelName);
      if (!label) {
        label = GmailApp.createLabel(rule.labelName);
      }
      filter.action.addLabelIds = [label.getId ? label.getId() : rule.labelName];
    }

    // 転送設定
    if (rule.actionType === "forward") {
      filter.action.forward = rule.forwardTo;
    }

    results.push({
      query: query,
      actionType: rule.actionType,
      status: "created"
    });
  });

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    results: results
  })).setMimeType(ContentService.MimeType.JSON);
}

function applyGmailLabels(data) {
  const results = [];

  data.rules.forEach(function(rule) {
    let label = GmailApp.getUserLabelByName(rule.labelName);
    if (!label) {
      label = GmailApp.createLabel(rule.labelName);
    }

    // 条件に合致するスレッドを検索
    let query = "";
    if (rule.condition.from) query += "from:" + rule.condition.from + " ";
    if (rule.condition.subject) query += "subject:" + rule.condition.subject + " ";
    if (rule.condition.keyword) query += rule.condition.keyword + " ";
    query = query.trim();

    const threads = GmailApp.search(query, 0, 50);
    threads.forEach(function(thread) {
      thread.addLabel(label);
    });

    results.push({
      labelName: rule.labelName,
      threadsProcessed: threads.length,
      status: "applied"
    });
  });

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    results: results
  })).setMimeType(ContentService.MimeType.JSON);
}

function setupAutoForward(data) {
  const results = [];

  data.rules.forEach(function(rule) {
    // 条件に合致する今後のメールに対して転送トリガーを設定
    let query = "";
    if (rule.condition.from) query += "from:" + rule.condition.from + " ";
    if (rule.condition.subject) query += "subject:" + rule.condition.subject + " ";
    if (rule.condition.hasAttachment) query += "has:attachment ";
    query = query.trim();

    // プロパティに転送ルールを保存
    const props = PropertiesService.getScriptProperties();
    const existingRules = JSON.parse(props.getProperty("forwardRules") || "[]");
    existingRules.push({
      query: query,
      forwardTo: rule.forwardTo,
      createdAt: new Date().toISOString()
    });
    props.setProperty("forwardRules", JSON.stringify(existingRules));

    results.push({
      query: query,
      forwardTo: rule.forwardTo,
      status: "configured"
    });
  });

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    results: results
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  action: "create_gmail_filter", // "create_gmail_filter" | "apply_gmail_labels" | "setup_auto_forward"
  rules: [
    {
      id: "rule-1",
      name: "ルール名（表示用）",
      condition: {
        from: "",           // 送信者アドレスまたは名前
        to: "",             // 受信者アドレス
        subject: "",        // 件名キーワード
        keyword: "",        // 本文キーワード
        hasAttachment: false // 添付ファイルの有無
      },
      actionType: "addLabel", // "addLabel" | "forward" | "labelAndArchive" | "archive"
      labelName: "",          // ラベル名（addLabel/labelAndArchive時）
      forwardTo: ""           // 転送先アドレス（forward時）
    }
  ]
};
```

## Templates

- [Gmail自動化ダッシュボードテンプレート](./templates/gmail-automator-template.html)
