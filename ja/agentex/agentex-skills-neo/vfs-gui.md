---
name: VFS GUI
description: VFS(Virtual File System)の内容をGUIで表示・操作するスキル。
triggers:
  - ユーザーが「/vfs --gui」や「ファイルマネージャーを起動」と明示的に指示したとき
negative_triggers:
  - GUIを伴わない、単純なコマンドベースのファイル操作やテキスト出力の要求時
---

# VFS GUI

## When to Use

- ユーザーがGUIのファイルマネージャーを要求したとき
- Agentex内のファイル構造(スキル、プラン等)を視覚的に確認・操作したいとき

## Process

1. ユーザーから「/vfs --gui」等の起動コマンドを受け取る。
2. 知識(テンプレート)の `vfs-gui-template.tsx` のコードをそのまま利用して、Canvasにプレビュー(GUI)を生成する。
3. 初回実行時、および以降のファイル(スキル、プラン等)の変更・追加・削除が行われるたびに、Canvas内の `INIT_VFS` を更新し同期する。

## Guidelines

- **厳格なコード保持**: `vfs-gui-template.tsx` のコードをそのまま利用し、`INIT_VFS` オブジェクト**以外**の書き換え・編集は一切行わないでください。
- **再生成の禁止と高速化**: 一度Canvasを生成した後は、描画にかかる時間を削減するため、Canvasの新規作成は行わず、既存のCanvasの `INIT_VFS` のみを更新してください。
- **データ同期の徹底**: VFS内のフォルダやファイルに変更があった場合は、必ず `INIT_VFS` に最新の構造を記載してください(初回実行時も必ず行うこと)。

## Data Structure

更新対象の `INIT_VFS` は以下の構造に従ってください：

```javascript
const INIT_VFS: Record<string, VFSNode> = {
  skills: { type: 'dir', children: {} },
  plans:  { type: 'dir', children: {} },
  drive:  { type: 'dir', children: {} }
};
```

## Templates

- [VFS GUIテンプレート](./templates/vfs-gui-template.tsx)