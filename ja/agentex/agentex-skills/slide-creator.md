---
name: スライド作成
description: スライドの下書き構成を定義し、ユーザーが編集可能なスライド作成ダッシュボード（Canvas）を生成するスキル。
triggers:
  - ユーザーが「スライドを作成して」「プレゼン資料の構成を考えて」などと指示したとき
  - ドキュメントやWebの情報を要約してスライドにまとめることを求めているとき
negative_triggers:
  - スライド構成を伴わない、単なるテキスト文書の作成
  - カレンダー等の別ツールの利用指示
---

# スライド作成

## When to Use

- ユーザーがプレゼンテーションスライドの作成や下書き構成を要求したとき。
- テキストやデータ、Web記事、PDFなどの情報を抽出・整理し、視覚的なスライドプレゼンテーションにまとめる必要があるとき。

## Process

1. **テーマ・素材の受け取り**
   1. ユーザーからスライドのテーマ、対象データ、または元ドキュメントを受け取る。
   2. テーマが曖昧な場合は「プレゼンの目的」「対象聴衆」「希望スライド枚数」をユーザーに確認する。
   3. 元ドキュメント（PDF、Web記事など）がある場合は、内容を読み取り要約する。
   4. **フォールバック**: ユーザーが追加情報を提供しない場合、テーマのみから標準的な5枚構成（タイトル・背景・要点・詳細・まとめ）でドラフトを作成する。

2. **ストーリーラインの設計**
   1. スライド全体のストーリーラインを設計し、各スライドの「タイトル」と「箇条書きのキーポイント（3〜5点程度）」に構成を分解する。
   2. 1枚目は必ず「タイトルスライド」（プレゼンタイトル、サブタイトル、作成者情報）とする。
   3. 最終スライドは「まとめ」または「次のステップ」とする。
   4. 各スライドの箇条書きが5項目を超えないように調整する。
   5. **フォールバック**: 情報量が不足している場合、プレースホルダーテキスト（「[ここにデータを挿入]」など）を含めたドラフト構成を作成する。

3. **Canvasの生成**
   1. 抽出および再構成した情報をもとに、`templates/slide-creator-template.html` を利用してスライド作成ダッシュボードをCanvasとして生成する。
   2. `presentationTitle` に全体タイトルを設定し、`slides` 配列に各スライドデータを格納する。
   3. **フォールバック**: テンプレートの読み込みに失敗した場合、Markdown形式のスライド構成テキストを出力する。

4. **ユーザー編集の同期**
   1. Canvas生成後は、ユーザーの編集内容や指示に応じて `extractedData` オブジェクトのみを更新する。
   2. スライドの追加・編集・削除を `extractedData.slides` 配列に反映する。
   3. HTML/CSS/JS コードの再生成は行わない。
   4. **フォールバック**: `extractedData` の更新に失敗した場合、変更内容をテキスト形式でユーザーに提示し、手動での確認を求める。

## Guidelines

- **厳格なデータ同期**: スライドデータの変更時は、必ず `extractedData` オブジェクトのみを更新・同期し、HTML/CSS/JSコード部分の再生成は避けてください。
- **簡潔で明瞭な記述**: 各スライドの箇条書きは、1行あたり20〜30文字以内の簡潔なキーポイントとして抽出してください（長い文章は避ける）。
- **タイトルスライドの配置**: スライドの1枚目は必ずプレゼンテーションタイトル、サブタイトル、および作成者情報を含む「タイトルスライド」に設定してください。
- **視覚的なバランス**: スライド1枚あたりの箇条書きは最大5項目に抑え、情報過多にならないように整理してください。
- **入力バリデーション**:
  - `presentationTitle` は1文字以上200文字以下であること。空文字列の場合はユーザーにタイトルの入力を求める。
  - `slides` 配列は最低2件（タイトルスライド + コンテンツスライド1枚以上）必須。
  - 各スライドの `title` は必須（空文字列不可）。
  - 各スライドの `bullets` 配列は1件以上5件以下であること。
  - 各 `bullet` の文字数は50文字以下を推奨。超過する場合は自動的に分割を提案する。
- **禁止事項**:
  - スライドテンプレート（`slide-creator-template.html`）のHTML/CSS/JS構造を改変してはならない。
  - 1枚のスライドに6項目以上の箇条書きを含めてはならない（視認性の低下を防止）。
  - タイトルスライドを省略してはならない。
  - ユーザー提供の元データに存在しない事実を捏造して追加してはならない。
  - `extractedData` 以外のCanvas構成要素を直接操作してはならない。

## Decision Examples

| # | ユーザー入力 | AIの判断 | 理由 |
|---|---|---|---|
| 1 | 「AIの未来についてプレゼン資料を作って」 | スキル発動 → テーマ "AIの未来" で5枚構成のスライドドラフトを生成 | スライド作成の明確な要求があるため |
| 2 | 「この会議メモをWordにまとめて」 | スキル不発動 → テキスト文書作成として処理 | negative_trigger に該当。スライド構成を伴わない文書作成 |
| 3 | 「このPDFの内容を10枚のスライドにして」 | スキル発動 → PDFを読み取り、10枚構成のスライドに再構成 | ドキュメントからスライドへの変換要求に合致 |
| 4 | 「プレゼン作りたいけど、何を入れればいいかわからない」 | スキル発動 → 「プレゼンの目的と対象聴衆を教えてください」とヒアリング | スライド作成意図はあるがテーマが不明瞭なため、Process 1.2 に従い確認 |
| 5 | 「明日の発表のカレンダーに登録して」 | スキル不発動 → カレンダー操作として処理 | negative_trigger に該当。カレンダー等の別ツールの利用指示 |

## Error Handling

| # | エラーケース | 原因 | 対処法 |
|---|---|---|---|
| 1 | テンプレートファイルが見つからない | `templates/slide-creator-template.html` が存在しないか、パスが不正 | ユーザーにテンプレート不在を通知し、Markdown形式のスライド構成を出力する |
| 2 | 元ドキュメントの読み取り失敗 | PDFが暗号化されている、ファイル形式が非対応 | ユーザーに「ファイルを読み取れませんでした」と通知し、テキスト入力での内容提供を依頼する |
| 3 | `extractedData` の構造不正 | `slides` 配列にオブジェクト以外の値が混入 | バリデーションで不正要素を除外し、有効なスライドのみで再構成する |
| 4 | スライド枚数が過剰（20枚以上） | ユーザーの要求または元データの情報量が多すぎる | 20枚を上限としてユーザーに通知し、内容の優先順位を確認してトリミングを提案する |
| 5 | 箇条書きの文字数超過 | 1つの bullet が50文字を大幅超過 | 自動的に2つの bullet に分割する案を提示し、ユーザーの承認を得てから適用する |

## GAS Backend

以下は、Google Apps Script (GAS) を利用してスライドデータを Google スライドに書き出すためのサーバーサイドコードスニペットです。

```javascript
/**
 * extractedData からGoogle スライドを生成する
 * @param {Object} slideData - extractedData オブジェクト
 * @returns {Object} 生成結果 { success: boolean, slideUrl: string }
 */
function createGoogleSlides(slideData) {
  try {
    const presentation = SlidesApp.create(slideData.presentationTitle);
    const slides = presentation.getSlides();

    // 既存の空白スライドを削除
    if (slides.length > 0) {
      slides[0].remove();
    }

    slideData.slides.forEach(function(slideItem, index) {
      let slide;
      if (index === 0) {
        // タイトルスライド
        slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE);
        const titleShape = slide.getPlaceholder(SlidesApp.PlaceholderType.TITLE);
        if (titleShape) titleShape.asShape().getText().setText(slideItem.title);
      } else {
        // コンテンツスライド
        slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
        const titleShape = slide.getPlaceholder(SlidesApp.PlaceholderType.TITLE);
        if (titleShape) titleShape.asShape().getText().setText(slideItem.title);

        const bodyShape = slide.getPlaceholder(SlidesApp.PlaceholderType.BODY);
        if (bodyShape && slideItem.bullets) {
          const bulletText = slideItem.bullets.join('\n');
          bodyShape.asShape().getText().setText(bulletText);
        }
      }
    });

    return {
      success: true,
      slideUrl: presentation.getUrl(),
      slideId: presentation.getId()
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * スライドデータをスプレッドシートにバックアップ保存する
 * @param {Object} slideData - extractedData オブジェクト
 * @returns {Object} 保存結果 { success: boolean, backupId: string }
 */
function backupSlideData(slideData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SlideBackups');
  if (!sheet) {
    sheet = ss.insertSheet('SlideBackups');
    sheet.appendRow(['BackupID', 'PresentationTitle', 'SlideData', 'CreatedAt']);
  }

  const backupId = Utilities.getUuid();
  const createdAt = new Date().toISOString();

  sheet.appendRow([
    backupId,
    slideData.presentationTitle,
    JSON.stringify(slideData.slides),
    createdAt
  ]);

  return { success: true, backupId: backupId };
}

/**
 * Web API エンドポイント (doPost)
 * Canvas からのリクエストを受け取りスライドを生成・保存する
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action || 'create';

    let result;
    switch (action) {
      case 'create':
        result = createGoogleSlides(params.data);
        break;
      case 'backup':
        result = backupSlideData(params.data);
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

Canvasに渡す `extractedData` は以下の構造に従ってください：

```javascript
let extractedData = {
  presentationTitle: "プレゼンテーションの全体タイトル",
  slides: [
    {
      title: "スライド1のタイトル",
      bullets: [
        "箇条書きの要点1",
        "箇条書きの要点2",
        "箇条書きの要点3"
      ]
    }
  ]
};
```

## Templates

- [スライド作成ダッシュボードテンプレート](./templates/slide-creator-template.html)