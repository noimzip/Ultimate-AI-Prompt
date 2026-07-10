---
name: スキル作成ウィザード
description: ユーザーと対話し、または指示に基づいて新しいスキル定義ファイル(.md)を自動設計し、ウィザード形式のUI(Canvas)で確認・編集・保存できるスキル。
triggers:
  - ユーザーが「新しいスキルを作って」「スキルファイルを新規作成して」と指示したとき
  - 定型的なタスク手順を「使い回せるスキルとして保存して」と頼まれたとき
negative_triggers:
  - スキルの定義ではなく、プラン(一回限りのタスク計画)の作成を指示されたとき
---

# スキル作成ウィザード

## When to Use

- ユーザーが繰り返し利用する定型作業の手順（メール返信テンプレート適用、特定データクレンジングなど）を「疑似スキル」として新しく `/skills/` ディレクトリに保存したいとき。
- 定型作業の自動化ルールをAIと一緒に作成して保存し、次回から再利用できるようにしたいとき。

## Process

1. **ユーザーからのスキル情報受け取り**
   1. ユーザーから新しいスキルの「名称」「トリガー条件」「手順（プロセス）」「注意点（ガイドライン）」などの指示を受け取る。
   2. 名称が未指定の場合はスキルの目的から適切な名称を提案する。
   3. トリガー条件が未指定の場合はユーザーに「どのような指示でこのスキルを起動させたいですか？」と確認する。
   4. **フォールバック**: ユーザーが最低限の情報（名称またはスキルの目的）のみ提供した場合、残りのフィールドをAIが推測・補完してドラフトを作成し、ユーザーに確認を求める。

2. **スキル定義の構成・補完**
   1. 指示を整理し、不足する情報（非トリガー条件や例外処理のガイドラインなど）を推測・補完してYAMLメタデータとセクションを含むMarkdown原稿を構成する。
   2. `/skills/default/` 内の既存スキルの構成（YAMLフロントマッター + セクション構造）に準拠しているか検証する。
   3. プレースホルダー（`[ユーザー名]`、`[対象ファイル]` など）を適切に配置し、再利用性を担保する。
   4. **フォールバック**: 既存スキルの参照に失敗した場合、内蔵のデフォルトテンプレート構造（`name`, `description`, `triggers`, `negative_triggers`, `When to Use`, `Process`, `Guidelines`）に従って構成する。

3. **Canvas（ウィザードUI）の生成**
   1. `templates/skill-creator-template.html` を利用してスキル作成ウィザードをCanvasとして生成する。
   2. Canvasの入力フォームに現在の構成データを初期流し込みし、ユーザーがブラウザ上で修正を行えるようにする。
   3. 各フォームフィールドにプレースホルダーテキストを設定し、入力ガイドを提供する。
   4. **フォールバック**: テンプレート読み込みに失敗した場合、Markdown形式のテキストベースでスキル原稿を出力し、ユーザーに手動コピーを案内する。

4. **ユーザーによる編集と保存**
   1. ユーザーがCanvas上で各フィールドを編集する。
   2. ユーザーが「保存」ボタンをクリックすると、ファイル名を自動生成する。
   3. ファイル名は `[スキルタイトル]-[YEAR]-[MONTH]-[DAY]-[HOURS]-[MINUTES].md` の形式で命名される。
   4. `/skills/auto/` または `/skills/` フォルダーにファイルを保存する。
   5. **フォールバック**: 保存先ディレクトリが存在しない場合、自動的にディレクトリを作成してから保存を試みる。保存に失敗した場合は、生成済みMarkdownテキストをチャット上に出力する。

## Guidelines

- **一貫した命名規則**: スキルのファイル名は必ず `[スキルタイトル]-[YEAR]-[MONTH]-[DAY]-[HOURS]-[MINUTES].md` の規則（すべて半角英数字かハイフン、日本語も可）で自動生成させてください。
- **再利用性の重視**: スキルは使い回すことを前提としているため、特定の日付や特定の個人名などの一時的な情報は含めず、プレースホルダー（例: `[ユーザー名]` や `[対象ファイル]`）を用いた記述を行ってください。
- **デフォルトスキルの準拠**: 作成するスキルの構成は、`/skills/default/` 内の既存のスキル定義（YAMLフロントマッター + `## When to Use`, `## Process`, `## Guidelines` のセクション構成）に厳格に準拠してください。
- **入力バリデーション**:
  - `skillName` は1文字以上100文字以下であること。空文字列の場合は保存を拒否する。
  - `triggers` 配列は最低1件必須。空配列の場合はユーザーにトリガー条件の入力を促す。
  - `process` 配列は最低1件必須。手順が0件のスキルは保存を拒否する。
  - `description` は10文字以上500文字以下を推奨。未入力の場合はAIが `process` から自動生成する。
  - ファイル名に使用不可の文字（`/ \ : * ? " < > |`）が含まれる場合、自動的にハイフン `-` に置換する。
- **禁止事項**:
  - 既存のデフォルトスキル（`/skills/default/` 配下）を上書きしてはならない。
  - YAMLフロントマッターの構文を壊すような不正なYAMLを生成してはならない。
  - ユーザーの確認なしにスキルファイルを自動保存してはならない（必ずプレビュー → 確認 → 保存の流れ）。
  - Process セクションに具体的な個人情報（実名・メールアドレス等）を埋め込んではならない。

## Decision Examples

| # | ユーザー入力 | AIの判断 | 理由 |
|---|---|---|---|
| 1 | 「毎朝メールを確認して返信するスキルを作って」 | スキル発動 → ウィザードを起動し、メール確認・返信スキルのドラフトを生成 | 定型作業の再利用可能なスキル作成要求に合致 |
| 2 | 「明日の会議のアジェンダを作って」 | スキル不発動 → 一回限りのタスク計画（プラン）として処理 | negative_trigger に該当。スキル定義ではなく一回限りのプラン作成 |
| 3 | 「CSVデータを毎回同じ手順でクレンジングしたいからスキルにして」 | スキル発動 → CSVクレンジング手順をヒアリングし、スキル定義を構成 | 「毎回同じ手順」「スキルにして」という再利用意図が明確 |
| 4 | 「スキル作って。名前は適当でいい」 | スキル発動 → 「どのような作業をスキル化したいですか？」と目的を確認 | スキル作成要求だが目的・手順が不明なため、Process 1.4 に従い詳細をヒアリング |
| 5 | 「既存のメール返信スキルを修正して」 | スキル不発動 → 既存スキルの編集はスキル新規作成とは異なる操作 | 本スキルは「新規作成」が対象。既存スキルの編集は別のワークフローで対応 |

## Error Handling

| # | エラーケース | 原因 | 対処法 |
|---|---|---|---|
| 1 | YAML フロントマッターの構文エラー | `triggers` 配列のインデントが不正、特殊文字のエスケープ漏れ | YAML構文を自動修正し、修正箇所をユーザーに通知する |
| 2 | ファイル名の文字数超過 | スキルタイトルが長すぎる（OS制限255文字超） | タイトルを50文字に自動切り詰め、切り詰めた旨をユーザーに通知する |
| 3 | 保存先ディレクトリが存在しない | `/skills/auto/` が未作成 | 自動的にディレクトリを作成して再試行。作成失敗時はルート `/skills/` に保存 |
| 4 | 同名ファイルが既に存在 | 同一分・同一タイトルで複数回保存 | タイムスタンプに秒を追加して一意性を確保する |
| 5 | テンプレートファイルが見つからない | `templates/skill-creator-template.html` が存在しない | ユーザーにテンプレート不在を通知し、プレーンMarkdown形式でスキル原稿を出力する |

## GAS Backend

以下は、Google Apps Script (GAS) を利用してスキル定義データをスプレッドシートで管理・一覧化するためのサーバーサイドコードスニペットです。

```javascript
/**
 * スキル定義データをスプレッドシートに保存する
 * @param {Object} skillData - extractedData オブジェクト
 * @returns {Object} 保存結果 { success: boolean, skillId: string }
 */
function saveSkillDefinition(skillData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SkillDefinitions');
  if (!sheet) {
    sheet = ss.insertSheet('SkillDefinitions');
    sheet.appendRow([
      'SkillID', 'SkillName', 'Description', 'Triggers',
      'NegativeTriggers', 'WhenToUse', 'Process', 'Guidelines', 'CreatedAt'
    ]);
  }

  const skillId = Utilities.getUuid();
  const createdAt = new Date().toISOString();

  sheet.appendRow([
    skillId,
    skillData.skillName,
    skillData.description,
    JSON.stringify(skillData.triggers),
    JSON.stringify(skillData.negativeTriggers),
    skillData.whenToUse,
    JSON.stringify(skillData.process),
    JSON.stringify(skillData.guidelines),
    createdAt
  ]);

  return { success: true, skillId: skillId };
}

/**
 * 保存済みスキル一覧を取得する
 * @returns {Array} スキル定義の配列
 */
function listSkillDefinitions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('SkillDefinitions');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const skills = [];

  for (let i = 1; i < data.length; i++) {
    skills.push({
      skillId: data[i][0],
      skillName: data[i][1],
      description: data[i][2],
      triggers: JSON.parse(data[i][3]),
      negativeTriggers: JSON.parse(data[i][4]),
      whenToUse: data[i][5],
      process: JSON.parse(data[i][6]),
      guidelines: JSON.parse(data[i][7]),
      createdAt: data[i][8]
    });
  }

  return skills;
}

/**
 * スキル定義を削除する
 * @param {string} skillId - 削除対象のスキルID
 * @returns {Object} 削除結果 { success: boolean }
 */
function deleteSkillDefinition(skillId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('SkillDefinitions');
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === skillId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, error: '指定されたスキルIDが見つかりません' };
}

/**
 * Web API エンドポイント (doPost)
 * Canvas からのリクエストを受け取りスキル定義を保存する
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action || 'save';

    let result;
    switch (action) {
      case 'save':
        result = saveSkillDefinition(params.data);
        break;
      case 'list':
        result = listSkillDefinitions();
        break;
      case 'delete':
        result = deleteSkillDefinition(params.skillId);
        break;
      default:
        result = { success: false, error: '不明なアクション: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Data Structure

Canvasに流し込む初期データ（`INITIAL_DATA` など）は以下の構造に従います：

```javascript
let extractedData = {
  skillName: "スキルの英語/日本語名",
  description: "スキルの短い要約説明",
  triggers: ["トリガー条件1", "トリガー条件2"],
  negativeTriggers: ["非対象条件1"],
  whenToUse: "このスキルを使うべきユースケース",
  process: ["手順1", "手順2", "手順3"],
  guidelines: ["注意点・制約事項1", "注意点・制約事項2"]
};
```

## Templates

- [スキル作成ウィザードテンプレート](./templates/skill-creator-template.html)
