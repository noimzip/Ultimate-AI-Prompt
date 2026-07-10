---
name: Googleドキュメント作成
description: タイトルとセクション構造（見出し・本文・箇条書き）を定義し、Googleドキュメントを自動生成するCanvas + GASスキル。
triggers:
  - ユーザーが「ドキュメントを作成して」「Googleドキュメントを作って」と指示したとき
  - ユーザーが「報告書を作成して」「マニュアルを書いて」「議事録をまとめて」など文書作成を求めたとき
  - テキスト、PDF、画像などの情報を整理してGoogleドキュメントに出力したいとき
negative_triggers:
  - スライドやスプレッドシートの作成（別スキルで対応）
  - メール文面の作成（Gmail関連スキルで対応）
  - 既存ドキュメントの読み込み・検索のみの操作
---

# Googleドキュメント作成

## When to Use

- ユーザーが構造化された文書（報告書、マニュアル、議事録、企画書など）をGoogleドキュメントとして作成したいとき。
- テキストやメモ、PDF、画像などの素材から情報を抽出し、セクション構造に整理してドキュメント化したいとき。
- ユーザーがセクションの追加・編集・並べ替えをCanvas上で行い、最終的にGoogleドキュメントとして出力したいとき。

## Process

1. **要件の把握**: ユーザーの指示からドキュメントのタイトル、目的、含めるべき内容を特定する。
   - 素材（テキスト、PDF、URL等）が提供された場合は内容を抽出・要約する。
   - 具体的な指示がない場合は、目的に応じた標準的なセクション構成を提案する。
2. **セクション構造の設計**: ドキュメントを論理的なセクションに分割する。
   - 各セクションに「見出し（heading）」「本文（body）」「箇条書き（bullets）」を設定する。
   - セクションの順序は文書の論理的な流れに従う（概要→詳細→まとめ等）。
3. **Canvas生成**: 構造化したデータを `extractedData` に格納し、`templates/doc-creator-template.html` を利用してドキュメント作成ダッシュボードをCanvasとして生成する。
4. **ユーザー編集**: Canvas上でセクションの追加・削除・並べ替え、各セクション内の見出し・本文・箇条書きの編集をリアルタイムで行う。ライブプレビューで最終的なドキュメント構造を確認できる。
5. **GAS送信**: ユーザーが「作成」ボタンを押すと、`create_document` アクションでGAS Web Appにデータが送信され、Googleドキュメントが自動生成される。

## Guidelines

- **extractedData のみ更新**: 一度Canvasを生成した後は `extractedData` オブジェクトのみを更新し、HTML/CSS/JSの再生成は行わないでください。
- **セクション構成の論理性**: セクションは読み手にとって自然な順序（導入→本論→結論）で配置してください。
- **見出しレベルの統一**: 各セクションの見出しは同一レベル（H2相当）で統一し、サブセクションが必要な場合は箇条書きで表現してください。
- **本文の品質**: 本文は簡潔かつ具体的に記述し、1セクションあたり200文字以内を目安としてください。
- **箇条書きの活用**: 要点が3つ以上ある場合は箇条書きを使用し、各項目は50文字以内に収めてください。
- **空セクションの禁止**: 見出しのみで本文も箇条書きもないセクションは作成しないでください。

## Decision Examples

1. **ユーザー入力**: 「プロジェクト計画書を作って。概要、スケジュール、予算、メンバーの4セクションで」
   → **AIの判断**: `create_document` アクション。4セクション構成のドキュメントCanvasを生成し、各セクションにプレースホルダーテキストを配置。
   → **理由**: ドキュメントの種類とセクション構成が明示されている。

2. **ユーザー入力**: 「この会議メモから議事録を作成して」（テキスト素材付き）
   → **AIの判断**: テキストから議題・決定事項・アクションアイテムを抽出し、「会議概要」「議題と討議内容」「決定事項」「次回アクション」の構成でCanvas生成。
   → **理由**: 素材から適切な構造を自動推定する。

3. **ユーザー入力**: 「新製品のマニュアルを作って」
   → **AIの判断**: 標準的なマニュアル構成（概要、セットアップ手順、基本操作、トラブルシューティング、FAQ）を提案し、Canvas生成。ユーザーに追加情報を求める。
   → **理由**: 具体的な内容が不足しているため、テンプレート構成を提案。

4. **ユーザー入力**: 「セクション3と4の順番を入れ替えて」
   → **AIの判断**: `extractedData.sections` の配列インデックス2と3を交換し、Canvas上のプレビューを更新。
   → **理由**: 既存Canvasへの編集操作。

5. **ユーザー入力**: 「スライドを作って」
   → **AIの判断**: このスキルは発火しない。スライド作成スキルへ委譲。
   → **理由**: negative_triggersに該当。

## Error Handling

| エラーケース | 対処法 |
|---|---|
| タイトルが未指定 | デフォルトで「無題のドキュメント」を設定し、ユーザーに変更を促す |
| セクションが0件 | 空のセクションを1つ自動追加し、「セクションを追加してください」と表示 |
| 本文が極端に長い（1セクション2000文字超） | 「本文が長すぎます。複数のセクションに分割することを推奨します」と警告 |
| GAS通信エラー | 「ドキュメントの作成に失敗しました。もう一度お試しください」と表示しリトライボタンを提供 |
| Googleアカウント未認証 | 初回認証フローの案内を表示し、認証後の再実行ボタンを提供 |

## GAS Backend

```javascript
function doPost(e) {
  const data = JSON.parse(e.parameter.payload);

  if (data.action === "create_document") {
    return createDocument(data);
  }
}

function createDocument(data) {
  const doc = DocumentApp.create(data.title || "無題のドキュメント");
  const body = doc.getBody();

  // 既存の空段落を取得
  body.clear();

  // セクションの挿入
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach(function(section, index) {
      // 見出しの追加
      if (section.heading) {
        body.appendParagraph(section.heading)
          .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      }

      // 本文の追加
      if (section.body) {
        body.appendParagraph(section.body)
          .setHeading(DocumentApp.ParagraphHeading.NORMAL);
      }

      // 箇条書きの追加
      if (section.bullets && section.bullets.length > 0) {
        section.bullets.forEach(function(bullet) {
          if (bullet.trim()) {
            body.appendListItem(bullet)
              .setGlyphType(DocumentApp.GlyphType.BULLET);
          }
        });
      }

      // セクション間の区切り（最終セクション以外）
      if (index < data.sections.length - 1) {
        body.appendParagraph("");
      }
    });
  }

  doc.saveAndClose();

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    documentId: doc.getId(),
    url: doc.getUrl()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Data Structure

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  action: "create_document",
  title: "ドキュメントタイトル",
  sections: [
    {
      id: "sec-1",
      heading: "セクション見出し",
      body: "本文テキスト。段落ごとの説明文を記載。",
      bullets: [
        "箇条書き項目1",
        "箇条書き項目2",
        "箇条書き項目3"
      ]
    }
  ]
};
```

## Templates

- [ドキュメント作成ダッシュボードテンプレート](./templates/doc-creator-template.html)
