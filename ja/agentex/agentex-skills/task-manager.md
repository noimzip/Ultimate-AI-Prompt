---
name: Googleタスク(ToDo)管理
description: Google Tasksのタスク一覧表示・新規追加・完了処理をCanvas + GASで行うスキル。フィルター機能やメモ・期限付きタスクの管理にも対応する。
triggers:
  - ユーザーが「タスクを確認して」「ToDoリストを見せて」「やることリストを表示して」と指示したとき
  - ユーザーが「タスクを追加して」「〜をやることリストに入れて」「〜を完了にして」と指示したとき
  - ユーザーが「期限が近いタスクを教えて」「未完了のタスクを一覧して」と指示したとき
negative_triggers:
  - Google Tasksではなくカレンダーの予定登録を求めているとき
  - プロジェクト管理ツール（Asana, Jira等）のタスク操作を求めているとき
  - 単なるメモやリマインダーの作成のみで、Google Tasksとの連携が不要なとき
---

# Googleタスク(ToDo)管理

## When to Use

- ユーザーがGoogle Tasksに登録されているタスクの一覧を確認し、進捗を把握したいとき。
- ユーザーが新しいタスクを追加したいとき（タイトル、メモ、期限を指定）。
- ユーザーが特定のタスクを完了済みとしてマークしたいとき。
- ユーザーが未完了タスクのみ、期限切れタスクのみなど、フィルター条件を指定して確認したいとき。

## Process

1. **タスク一覧の取得**
   - GAS Web App に `action: "list_tasks"` をリクエストし、ユーザーのGoogle Tasksからタスク一覧を取得する。
   - 取得失敗時は「Google Tasksとの接続に失敗しました。再度お試しください。」とユーザーに通知し、リトライを促す。

2. **データの整形・分類**
   - 取得したタスクを `extractedData` の構造に変換する。
   - 各タスクのステータス（`pending` / `completed`）、期限の有無、期限超過の判定を行う。
   - 期限超過タスクには `overdue: true` フラグを付与する。

3. **Canvasの生成**
   - `templates/task-manager-template.html` を利用してタスク管理ダッシュボードをCanvasとして生成する。
   - タスクリストの表示、新規タスク追加フォーム、完了ボタン、フィルター機能をすべてCanvas上に提供する。

4. **ユーザー操作の処理**
   - **タスク追加**: ユーザーがフォームにタイトル・メモ・期限を入力し「追加」ボタンを押すと、GAS Web Appに `action: "add_task"` をPOSTする。
   - **タスク完了**: ユーザーが完了ボタンを押すと、GAS Web Appに `action: "complete_task"` をPOSTする。
   - Canvas生成後は、ユーザーの要望に応じて `extractedData` オブジェクトのみを更新し、内容の編集・追加・削除を行う。

## Guidelines

- **extractedData の排他的更新**: extractedData オブジェクト以外のコードの編集を禁止します。一度Canvasを生成した後は、extractedData オブジェクトのみを更新してください。
- **日付フォーマットの厳守**: `dueDate` は必ず `YYYY-MM-DD` 形式で設定してください（例: `2026-06-01`）。時刻を含む場合は `YYYY-MM-DDTHH:mm` 形式を使用してください。
- **入力バリデーション**: タスクのタイトルが空文字の場合は追加を拒否し、ユーザーに入力を促してください。
- **期限の自動判定**: ユーザーが「明日まで」「今週中」などの相対的な期限を指定した場合、現在日時を基準に正確な日付に変換してください。
- **禁止事項**: ユーザーの確認なしにタスクを削除する操作は行わないでください。完了マークは許可しますが、削除は明示的な指示が必要です。

## Decision Examples

1. **ユーザー入力**: 「今日のタスクを確認して」
   - **AIの判断**: `list_tasks` アクションでタスク一覧を取得し、期限が今日以前のタスクをフィルタリングしてCanvas表示する。
   - **理由**: 「今日の」という条件から、期限ベースのフィルタリングが必要と判断。

2. **ユーザー入力**: 「買い物リストをタスクに追加して。牛乳、卵、パン」
   - **AIの判断**: 3つの個別タスク（「牛乳を買う」「卵を買う」「パンを買う」）として `extractedData.tasks` に追加し、`add_task` アクションで一括登録する。
   - **理由**: カンマ区切りの複数アイテムをそれぞれ独立したタスクとして処理。

3. **ユーザー入力**: 「レポート提出のタスクを金曜までに設定して」
   - **AIの判断**: タイトル「レポート提出」、期限を次の金曜日の日付（`YYYY-MM-DD`形式）に設定して `add_task` を実行。
   - **理由**: 相対日付「金曜まで」を現在の曜日から計算して変換。

4. **ユーザー入力**: 「完了したタスクを全部消して」
   - **AIの判断**: 「完了済みタスクの削除は不可逆な操作です。本当に削除してよろしいですか？」と確認を求める。
   - **理由**: 削除操作は禁止事項に該当するため、明示的な確認が必要。

5. **ユーザー入力**: 「プロジェクトAのタスク進捗を教えて」
   - **AIの判断**: `list_tasks` でタスク一覧を取得し、タイトルやメモに「プロジェクトA」を含むタスクをフィルタリングして表示する。
   - **理由**: キーワードベースのフィルタリングで関連タスクを抽出。

## Error Handling

| エラーケース | 対処法 |
|---|---|
| GAS Web Appへの接続タイムアウト | 「接続がタイムアウトしました。ネットワーク接続を確認し、再度お試しください。」とユーザーに通知 |
| Google Tasks APIの認証エラー | 「Google Tasksへのアクセス権限がありません。GASのデプロイ設定で認証を確認してください。」と通知 |
| タスクタイトルが空 | Canvas上でバリデーションエラーを表示し、タイトル入力を促す |
| 期限の日付が過去 | 警告を表示するが、追加自体は許可する（リマインダー目的の可能性があるため） |
| 存在しないタスクIDで完了リクエスト | 「指定されたタスクが見つかりません。タスク一覧を再読み込みしてください。」と通知 |
| タスクリストが空 | 「現在タスクはありません。新しいタスクを追加してください。」と空状態のUIを表示 |

## GAS Backend

```javascript
function doPost(e) {
  var data = JSON.parse(e.parameter.payload);

  switch (data.action) {
    case "list_tasks":
      return listTasks(data);
    case "add_task":
      return addTask(data);
    case "complete_task":
      return completeTask(data);
    default:
      return ContentService.createTextOutput("Unknown action");
  }
}

function listTasks(data) {
  var taskListId = data.taskListId || "@default";
  var tasks = Tasks.Tasks.list(taskListId, {
    showCompleted: data.showCompleted || false,
    maxResults: 100
  });
  var result = (tasks.items || []).map(function(t) {
    return {
      id: t.id,
      title: t.title,
      notes: t.notes || "",
      dueDate: t.due ? t.due.substring(0, 10) : "",
      status: t.status,  // "needsAction" or "completed"
      completed: t.completed || null
    };
  });
  return ContentService.createTextOutput(JSON.stringify({ success: true, tasks: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addTask(data) {
  var taskListId = data.taskListId || "@default";
  var taskResource = {
    title: data.title,
    notes: data.notes || "",
  };
  if (data.dueDate) {
    taskResource.due = new Date(data.dueDate).toISOString();
  }
  var created = Tasks.Tasks.insert(taskResource, taskListId);
  return ContentService.createTextOutput(JSON.stringify({ success: true, taskId: created.id }))
    .setMimeType(ContentService.MimeType.JSON);
}

function completeTask(data) {
  var taskListId = data.taskListId || "@default";
  var task = Tasks.Tasks.get(taskListId, data.taskId);
  task.status = "completed";
  Tasks.Tasks.update(task, taskListId, data.taskId);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  taskListName: "マイタスク",
  tasks: [
    {
      id: "タスクID",
      title: "タスクのタイトル",
      notes: "メモ・備考",
      dueDate: "2026-06-01",       // YYYY-MM-DD形式
      status: "pending",           // "pending" | "completed"
      overdue: false               // 期限超過フラグ
    }
  ]
};
```

## Templates

- [タスク管理ダッシュボードテンプレート](./templates/task-manager-template.html)
